const db = require("../db");
const qm = require("../../ionic/src/js/qmHelpers");
const fetch = require('node-fetch');
const credentials = require("./credentials");
const encrypter = require('./encryption');
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
  request.session.user =  request.user = dbUser;
  return addAccessTokenToUser(dbUser, request, function(){
    storeConnectorCredentials(request, accessToken, refreshToken, profile, connectorName).then((connection) => {
      qmLog.debug("connection", connection);
    });
    return done(null, dbUser);
  });
}
function loginOrCreateUser(dbUser, request, accessToken, refreshToken, profile, connectorName, done){
  if(dbUser){
    return login(dbUser, request, accessToken, refreshToken, profile, connectorName, done);
  }
  return db.createUser(profile).then((dbUser) => {
    return login(dbUser, request, accessToken, refreshToken, profile, connectorName, done);
  });
}
function getEmailFromProfileResponse(profile){
  console.log("profile", profile);
  let email = profile.email;
  if(!email && profile.emails && profile.emails[0] && profile.emails[0].value){
    email = profile.emails[0].value;
  }
  if(!email && profile.emails && profile.emails[0] && profile.emails[0]){
    email = profile.emails[0];
  }
  return email;
}
async function findUserByConnectorUserId(connectorName, profile){
  const meta = await db.prisma.wp_usermeta.findFirst({
    where: {
      meta_key: connectorName + "_id",
      meta_value: profile.id
    }
  });
  if(meta){
    return await db.findUserById(meta.user_id);
  }
  return null;
}
async function getDbUser(request){
  if(request.user){
    return request.user;
  }
  const accessToken = getAccessTokenFromRequest(request);
  if(!accessToken){
    return null;
  }
  const dbUser = await findUserByAccessToken(accessToken);
  if(!dbUser){
    throw Error("User not found for accessToken " + accessToken);
  }
  return dbUser;
}
module.exports.handleConnection = async function (request, accessToken, refreshToken, profile, done, connectorName) {
  let dbUser = await getDbUser(request);
  if(dbUser){
    request.user = dbUser;
    const res = await storeConnectorCredentials(request, accessToken, refreshToken, profile, connectorName)
  } else {
    dbUser = await socialLogin(request, accessToken, refreshToken, profile, done, connectorName);
  }
  return dbUser;
}
let socialLogin = async function (request, accessToken, refreshToken, profile, done, connectorName) {
  if(qm.appMode.isDebug()){debugger}
  const dbUser = await findUserByConnectorUserId(connectorName, profile);
  if(dbUser){
    return loginOrCreateUser(dbUser, request, accessToken, refreshToken, profile, connectorName, done);
  }
  let email = getEmailFromProfileResponse(profile);
  if(!email){
    request.status(302).redirect('/login?noEmail=true');
    return;
    //throw Error("No email found in profile", profile);
  }
  return db.findUserByEmail(email).then((dbUser) => {
    return loginOrCreateUser(dbUser, request, accessToken, refreshToken, profile, connectorName, done);
  });
};
module.exports.handleSocialLogin = socialLogin
async function storeConnectorCredentials(request, accessToken, refreshToken, profile, connectorName){
  let connectorResponse = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    profile: profile,
  };
  const connectorUserId = profile.id;
  let user = request.user;
  if(!user){
    throw Error("No user found in request");
  }
  let userId = getUserId(user);
  for(let key in profile){
    let value = profile[key];
    if(typeof value !== "string"){
      value = JSON.stringify(value);
    }
    try {
      const meta = await db.prisma.wp_usermeta.create({
        data: {
          meta_key: connectorName + "_" + key,
          meta_value: value,
          user_id: userId,
        }
      });
    } catch (e) {
      console.log("Error storing connector usermeta for "+connectorName);
      break
    }
  }
  const connection = await createConnection(connectorResponse, connectorName, user);
  // qm.api.post('api/v3/connectors/' + connectorName + '/connect?noRedirect=true',
  //   { connectorCredentials: connectorResponse },
  //   function(response){
  //     qmLog.authDebug("postConnectorCredentials got response:", response, response);
  //   }, function(error){
  //     qmLog.error("postConnectorCredentials error: ", error, {
  //       errorResponse: error,
  //       connectorName: connectorName
  //     });
  //   });
  return connection;
}

function getUserId(dbUser){
  //debugger
  return BigInt(dbUser.id || dbUser.ID || null);
}
module.exports.getIdFromUser = function(user){
  //debugger
  return getUserId(user);
}
async function createConnection(connectorResponse, connectorName, dbUser){
  const connector = dataSources[connectorName];
  let connection  = await db.prisma.connections.findFirst({
    where: {
      connector_id: connector.id,
      user_id: getUserId(dbUser),
    }
  });
  if(connection){
    let data = {
      update_status: "WAITING",
      client_id: qm.getClientId(),
      update_requested_at: new Date(),
      credentials: JSON.stringify(connectorResponse),
      connect_status: "CONNECTED",
      user_message: null,
      update_error: null,
    };
    connection  = await db.prisma.connections.update({
      where: {
        id: connection.id
      },
      data: data
    })
  } else {
    data.user_id = getUserId(dbUser);
    data.connector_id = connector.id;
    connection  = await db.prisma.connections.create({ data: data })
  }
  return connection;
}
module.exports.loginViaEmail = function (request, done) {
  const email = request.body.email;
  const plainTextPassword = request.body.password;
  db.findUserByEmail(email).then((dbUser) => {
    if (!dbUser) { return done("I couldn't find a user matching those credentials!"); }
    var matches = encrypter.CheckPassword(plainTextPassword, dbUser.user_pass); //This will return true
    if (!matches) {return done("I couldn't find a user matching those credentials!");}
    return addAccessTokenToUser(dbUser, request, function(){
      return done(null, dbUser);
    });
  });
}
async function findUserByEmailAndPassword(email, plainTextPassword){
  const dbUser = await db.findUserByEmail(email)
  if(!dbUser){
    qmLog.error("User not found for email " + email);
    return null
  }
  var matches = encrypter.CheckPassword(plainTextPassword, dbUser.user_pass); //This will return true
  if (!matches) {
    qmLog.error("Wrong password for email " + email);
    return null
  }
  return dbUser
}
async function findAccessTokenRow(accessTokenString){
  return await db.prisma.oa_access_tokens.findFirst({
    where: {
      access_token: accessTokenString
    }
  });
}
async function createAccessToken(userId, accessTokenString){
  const accessToken = await db.prisma.oa_access_tokens.create({
    data: {
      access_token: accessTokenString,
      expires: new Date(),
      user_id: userId,
      client_id: qm.getClientId(),
      scope: "readmeasurements writemeasurements",
    }
  });
  return accessToken;
}
const demoUserId = 1;
const testUserId = 18535;
const demoAccessTokenString = "demo";
const testAccessTokenString = "test-token";
let findUserByAccessToken = async function (accessTokenString){
  let accessTokenRow = await findAccessTokenRow(accessTokenString);
  if(!accessTokenRow){
    if(accessTokenString === demoAccessTokenString){
      accessTokenRow = await createAccessToken(demoUserId, demoAccessTokenString);
    }
    if(accessTokenString === testAccessTokenString){
      accessTokenRow = await createAccessToken(testUserId, testAccessTokenString);
    }
  }
  if(!accessTokenRow){
    qmLog.error("No access token found for " + accessTokenString);
    return null
  }
  const dbUser = await db.findUserById(accessTokenRow.user_id);
  dbUser.accessToken = accessTokenRow.access_token;
  dbUser.access_token = accessTokenRow
  return dbUser
};
module.exports.findUserByAccessToken = findUserByAccessToken
function getAccessTokenFromRequest(req) {
  //debugger
  let fromSession, fromHeader, fromQuery, fromUser;
  if(req.session && req.session.access_token){fromSession = req.session.access_token;}
  const user = req.user;
  if(user){
    if(user.access_token && user.access_token.access_token){fromUser = user.access_token.access_token;}
    if(user.accessToken){fromUser = user.accessToken;}
  }
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader && bearerHeader.startsWith('Bearer ')) {
    fromHeader = bearerHeader.replace('Bearer ', '');
  }
  let query = req.query;
  if(query && query.access_token){fromQuery = query.access_token;}
  if(fromSession){
    if(fromHeader && fromHeader !== fromSession){
      qmLog.error("Access token from session does not match access token from header!  Using one from session.");
    }
    return fromSession;
  }
  qmLog.debug("getAccessTokenFromRequest: " +
              "fromHeader: " + fromHeader + ", " +
              "fromQuery: " + fromQuery + ", " +
              "fromUser: " + fromUser);
  return fromHeader || fromQuery || fromUser;
}
module.exports.getAccessTokenFromRequest = getAccessTokenFromRequest
module.exports.addAccessTokenToSession = function (req, res, next){
  const accessToken = getAccessTokenFromRequest(req);
  if(accessToken){req.session.access_token = accessToken;}
  if(req.query.final_callback_url){req.session.final_callback_url = req.query.final_callback_url;}
  next();
}
