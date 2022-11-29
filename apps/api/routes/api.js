var express = require('express');
var db = require('../db');
const proxy = require("express-http-proxy");
const urlHelper = require("../utils/urlHelper");
const stringHelper = require("../utils/stringHelper");
const qm = require("../../ionic/src/js/qmHelpers");
let credentials = require('../utils/credentials');
const authHelper = require("../utils/authHelper");
const expressAccessToken = require('express-access-token');

let unauthorizedResponse = {
  "error": "Unauthorized",
  "message": "You are not authorized to access this resource.",
  "status": 401
};
function getAccessTokenFromRequest(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader) {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      return req.token = bearerToken;
    } else {
      // Forbidden
      return null;
    }
}
//Use the req.isAuthenticated() function to check if user is Authenticated
checkAuthenticated = async (req, res, next) => {
  //debugger
  let authorized = req.isAuthenticated();
  let user = req.user
  let accessToken = getAccessTokenFromRequest(req, res, next);
  if(!accessToken && user && user.accessToken){
    accessToken = user.accessToken || user.access_token.access_token;
  }
  if(!user){
    if(accessToken){
      user = await authHelper.findUserByAccessToken(accessToken);
      if(!user){
        console.error("No user or access token found in request", req);
      } else {
        req.session.user = req.user = user;
      }
    } else {
      console.error("No user or access token found in request", req);
    }
  }
  if(!user){
    if(accessToken){
      console.error("User not found for accessToken " + accessToken);
    }
    if(req.path.startsWith("/api")){
      return res.status(403).send('Forbidden');
    } else {
      return res.redirect('/login');
    }
  }
  req.headers['Authorization'] = `Bearer ${accessToken}`
  next();
}

var router = express.Router();
router.get('/api/v1/user', checkAuthenticated, async (req, res) => {
  if(!req.user){
    res.status(401).json(unauthorizedResponse);
    return;
  }
  let user = stringHelper.camelCaseKeys(req.user)
  res.status(200).json(user)
})

router.use('/api', checkAuthenticated, proxy(urlHelper.API_ORIGIN, {
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    // you can update headers
    // proxyReqOpts.headers['X-Client-ID'] = process.env.QUANTIMODO_CLIENT_ID;
    // proxyReqOpts.headers['X-Client-Secret'] = process.env.QUANTIMODO_CLIENT_SECRET;
    const user = srcReq.user;
    if(user && user.access_token && user.access_token.access_token){
      proxyReqOpts.headers['Authorization'] = `Bearer ${user.access_token.access_token}`;
      proxyReqOpts.headers['X-Client-ID'] = credentials.quantimodo.clientId;
      proxyReqOpts.headers['Accept'] = 'application/json';
    }
    return proxyReqOpts;
  },
  proxyReqPathResolver: function (req) {
    req.url = '/api' + req.url;
    console.log('proxyReqPathResolver', req.url)
    return req.url;
  }
}));

module.exports = router;
