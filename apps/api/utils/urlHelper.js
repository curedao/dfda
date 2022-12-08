const {numberFormat} = require("underscore.string");
const envHelper = require("../../ionic/ts/env-helper");
//envHelper.loadEnvFromDopplerOrDotEnv(null);
var port = envHelper.getEnvOrException("EXPRESS_PORT");
let fallbackServerUrl = `http://localhost:${port}`;
let envs = process.env
let envNames = envHelper.envNames
let apiOrigin = process.env[envNames.QM_API_ORIGIN]
if(!apiOrigin){
  apiOrigin = 'https://app.quantimo.do';
}
module.exports = {
  serverPort: port,
  serverOrigin: process.env[envHelper.envNames.EXPRESS_ORIGIN] || fallbackServerUrl,
  QM_API_ORIGIN: apiOrigin,
  loginSuccessRedirect: process.env[envHelper.envNames.LOGIN_SUCCESS_REDIRECT] || "/#/app/onboarding",
  loginFailureRedirect: "/#/app/login",
  loginPath: "/#/app/login"
}
