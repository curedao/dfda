const db = require("../db");
const qm = require("../../ionic/src/js/qmHelpers");
const fetch = require('node-fetch');
const credentials = require("./credentials");
var hasher = require('wordpress-hash-node');
global.fetch = fetch
global.Headers = fetch.Headers;
const dataSources = require("../data/data-sources");
const crypto = require("crypto");
function addAccessTokenToUser(dbUser, request, done){
  return db.createAccessToken(dbUser, request).then((token) => {
    dbUser.accessToken = token.access_token;
    qm.userHelper.setUser(dbUser);
    return done(null, dbUser);
  });
}
function login(dbUser, request, accessToken, refreshToken, profile, connectorName, done){
  return addAccessTokenToUser(dbUser, request, function(){
    storeConnectorCredentials(request, accessToken, refreshToken, profile, connectorName).then((connection) => {
      console.log("connection", connection);
    });
    return done(null, dbUser);
  });
}
function loginOrCreateUser(user, request, accessToken, refreshToken, profile, connectorName, done){
  if(user){
    return login(user, request, accessToken, refreshToken, profile, connectorName, done);
  }
  return db.createUser(profile).then((user) => {
    return login(user, request, accessToken, refreshToken, profile, connectorName, done);
  });
}
async function handleSocialLogin(request, accessToken, refreshToken, profile, done, connectorName) {
  const meta = await db.prisma.wp_usermeta.findFirst({
    where: {
      meta_key: connectorName + "_id",
      meta_value: profile.id,
    }
  });
  if(meta){
    let user = await db.findUserById(meta.user_id);
    if(user){
      return loginOrCreateUser(user, request, accessToken, refreshToken, profile, connectorName, done);
    }
  }
  console.log("profile", profile)
  let email = profile.email;
  if(!email && profile.emails && profile.emails[0] && profile.emails[0].value){
    email = profile.emails[0].value;
  }
  if(!email && profile.emails && profile.emails[0] && profile.emails[0]){
    email = profile.emails[0];
  }
  if(!email){
    throw Error("No email found in profile", profile);
  }
  return db.findUserByEmail(email).then((user) => {
    return loginOrCreateUser(user, request, accessToken, refreshToken, profile, connectorName, done);
  });
}
async function storeConnectorCredentials(request, accessToken, refreshToken, profile, connectorName){
  let connectorResponse = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile,
  };
  const connectorUserId = profile.id;
  profile.forEach((key, value) => {
    const meta = db.prisma.wp_usermeta.create({
      data: {
        meta_key: connectorName + "_" + key,
        meta_value: value,
        user_id: user.id,
      }
    });
  })
  const connection = await createConnection(connectorResponse, connectorName);
  qm.api.post('api/v3/connectors/' + connectorName + '/connect?noRedirect=true',
    { connectorCredentials: connectorResponse },
    function(response){
      qmLog.authDebug("postConnectorCredentials got response:", response, response);
    }, function(error){
      qmLog.error("postConnectorCredentials error: ", error, {
        errorResponse: error,
        connectorName: connectorName
      });
    });
}
async function createConnection(connectorResponse, connectorName){
  const connector = dataSources[connectorName];
  const connection  = await db.prisma.connections.create({
    data: {
      user_id: user.id,
      connector_id: connector.id,
      update_status: "WAITING",
      connectorName: connectorName,
      client_id: qm.getClientId(),
      update_requested_at: new Date(),
      credentials: connectorResponse,
      connect_status: "CONNECTED",
    }
  })
  return connection;
}
function loginViaEmail(request, done) {
  const email = request.body.email;
  const plainTextPassword = request.body.password;
  db.findUserByEmail(email).then((dbUser) => {
    if (!dbUser) { return done("I couldn't find a user matching those credentials!"); }
    var matches = hasher.CheckPassword(plainTextPassword, dbUser.user_pass); //This will return true
    if (!matches) {return done("I couldn't find a user matching those credentials!");}
    return addAccessTokenToUser(dbUser, request, function(){
      return done(null, dbUser);
    });
  });
}
async function findUserByEmailAndPassword(email, plainTextPassword){
  const dbUser = await db.findUserByEmail(email)
  if(!user){
    qmLog.error("User not found for email " + email);
    return null
  }
  var matches = hasher.CheckPassword(plainTextPassword, dbUser.user_pass); //This will return true
  if (!matches) {
    qmLog.error("Wrong password for email " + email);
    return null
  }
  return user
}
async function findUserByAccessToken(accessTokenString){
  const accessTokenRow = await db.prisma.oa_access_tokens.findFirst({
    where: {
      access_token: accessTokenString
    }
  });
  if(!accessTokenRow){
    qmLog.error("No access token found for " + accessTokenString);
    return null
  }
  const dbUser =  await db.findUserById(accessTokenRow.user_id);
  dbUser.accessToken = accessTokenString;
  dbUser.access_token = accessTokenRow
  return dbUser
}
function getAccessTokenFromRequest(req) {
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    return bearerToken;
  } else {
    // Forbidden
    return null;
  }
}
function getAccessToken(proxyReqOpts, srcReq){
  let accessToken = getAccessTokenFromRequest(srcReq);
  if(accessToken){return accessToken}
  const user = srcReq.user;
  if(user){
    if(user.access_token && user.access_token.access_token){
      return user.access_token.access_token;
    }
    if(user.accessToken){
      return user.accessToken;
    }
  }
  return null;
}
module.exports = {
  handleSocialLogin,
  loginViaEmail,
  findUserByEmailAndPassword,
  findUserByAccessToken,
  getAccessToken,
}
