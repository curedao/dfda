const urlHelper = require("./urlHelper");
const qm = require("../../ionic/src/js/qmHelpers");
const dataSources = require("../data/data-sources");
const envHelper = require("../../ionic/ts/env-helper");
let credentials = {
  getScopes(connectorName){
    const dataSource = dataSources[connectorName] || null;
    if(dataSource){
      return dataSource.scopes;
    } else {
      throw Error("data/data-sources does not contain connector called: " + connectorName);
    }
  }
};
credentials.find = function(strategyName, connectorName){
  let toUpperCase = strategyName.toUpperCase();
  let clientID = envHelper.getRequiredEnv("CONNECTOR_" + toUpperCase + "_CLIENT_ID");
  let clientSecret = envHelper.getRequiredEnv("CONNECTOR_" + toUpperCase + "_CLIENT_SECRET");
  let res = {
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: `${urlHelper.serverOrigin}/auth/${strategyName}/callback`,
    passReqToCallback: true
  };
  if(connectorName === "twitter"){
    res.consumerKey = clientID;
    res.consumerSecret = clientSecret;
    delete res.clientID;
    delete res.clientSecret;
  }
  return res;
};
module.exports = credentials;
