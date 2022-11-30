const {numberFormat} = require("underscore.string");
import * as envHelper from "@curedao/env-helper";
var port = envHelper.getEnvOrException("EXPRESS_PORT");
let fallbackServerUrl = `http://localhost:${port}`;
const values = {
  serverPort: port,
  serverOrigin: process.env[envHelper.envNames.EXPRESS_ORIGIN] || fallbackServerUrl,
  API_ORIGIN: process.env[envHelper.envNames.API_ORIGIN] || 'https://app.quantimo.do',
  loginSuccessRedirect: process.env[envHelper.envNames.LOGIN_SUCCESS_REDIRECT] || "/#/app/onboarding",
  loginFailureRedirect: "/#/app/login",
  loginPath: "/#/app/login"
}
export { values };
