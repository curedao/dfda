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
function handleUnauthorizedRequest(req, res){
  if(req.path.startsWith("/api")){
    return res.status(403).send("Forbidden");
  } else {
    return res.redirect("/login");
  }
}
//Use the req.isAuthenticated() function to check if user is Authenticated
checkAuthenticated = async (req, res, next) => {
  //debugger
  let authorized = req.isAuthenticated();
  let user = req.user
  if(!user){
    let accessToken = authHelper.getAccessToken(null, req);
    if(accessToken){
      user = await authHelper.findUserByAccessToken(accessToken);
      if(user){req.session.user = req.user = user;}
    }
  }
  if(!user){
    return handleUnauthorizedRequest(req, res);
  }
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

router.use('/api', proxy(urlHelper.API_ORIGIN, {
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    // you can update headers
    // proxyReqOpts.headers['X-Client-ID'] = process.env.QUANTIMODO_CLIENT_ID;
    // proxyReqOpts.headers['X-Client-Secret'] = process.env.QUANTIMODO_CLIENT_SECRET;
    const accessToken = authHelper.getAccessToken(proxyReqOpts, srcReq);
    if(accessToken){proxyReqOpts.headers['authorization'] = `Bearer ${accessToken}`;}
    proxyReqOpts.rejectUnauthorized = process.env['PROXY_REJECT_UNAUTHORIZED'] || false
    proxyReqOpts.headers['X-Client-ID'] = qm.getClientId();
    proxyReqOpts.headers['Accept'] = 'application/json';
    return proxyReqOpts;
  },
  proxyReqPathResolver: function (req) {
    req.url = '/api' + req.url;
    console.log('proxyReqPathResolver', req.url)
    return req.url;
  }
}));

module.exports = router;
