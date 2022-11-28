const {numberFormat} = require("underscore.string");
const envHelper = require("../../ionic/ts/env-helper");
const envs = envHelper.envNames;
var port = envHelper.getEnvOrException("EXPRESS_PORT");
let fallbackServerUrl = `http://localhost:${port}`;
module.exports = {
  serverPort: port,
  serverOrigin: process.env[envs.EXPRESS_ORIGIN] || fallbackServerUrl,
  API_ORIGIN: process.env[envs.API_ORIGIN] || 'https://app.quantimo.do',
  loginSuccessRedirect: process.env[envs.LOGIN_SUCCESS_REDIRECT] || "/#/app/onboarding",
  loginFailureRedirect: "/#/app/login",
  loginPath: "/#/app/login"
}
