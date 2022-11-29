const {numberFormat} = require("underscore.string");
const envHelper = require("../../ionic/ts/env-helper");
var port = envHelper.getEnvOrException("EXPRESS_PORT");
let fallbackServerUrl = `http://localhost:${port}`;
module.exports = {
  serverPort: port,
  serverOrigin: process.env[envHelper.envNames.EXPRESS_ORIGIN] || fallbackServerUrl,
  API_ORIGIN: process.env[envHelper.envNames.API_ORIGIN] || 'https://app.quantimo.do',
  loginSuccessRedirect: process.env[envHelper.envNames.LOGIN_SUCCESS_REDIRECT] || "/#/app/onboarding",
  loginFailureRedirect: "/#/app/login",
  loginPath: "/#/app/login"
}
