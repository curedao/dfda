import {defineConfig} from "cypress";
import * as envHelper from "./ts/env-helper";
envHelper.loadEnvFromDopplerOrDotEnv(null);
//import * as qmLog from "./ts/qm.log;
const {env} = process;
let baseUrl = envHelper.getRequiredEnv("EXPRESS_ORIGIN");
let apiOrigin = env.QM_API_ORIGIN || "https://app.quantimo.do";
let appOrigin = env.OAUTH_APP_ORIGIN || baseUrl;
let builderOrigin = env.BUILDER_ORIGIN || appOrigin
let cypressProjectId = env.CYPRESS_PROJECT_ID || null;
let cypressConfig: Cypress.ConfigOptions = {
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      const conf = JSON.parse(JSON.stringify(config));
      console.debug("setupNodeEvents Plugin Events", on);
      console.info("setupNodeEvents Config:", config);
      console.info("setupNodeEvents config.env:", config.env);
    },
    "chromeWebSecurity": false,
    "baseUrl": baseUrl,
    "projectId": env.CURRENTS_PROJECT_ID || env.CYPRESS_IO_PROJECT_ID,
    "pageLoadTimeout": 60000,
    "videoCompression": false,
    "videoUploadOnPasses": false,
    "experimentalSessionAndOrigin": false,
    "video": true,
    "env": {
      "QM_API_ORIGIN": apiOrigin,
      "OAUTH_APP_ORIGIN": appOrigin,
      "BUILDER_ORIGIN": builderOrigin,
      "abort_strategy": true
    },
    "reporter": "cypress-multi-reporters",
    "reporterOptions": {
      "configFile": "cypress/reporterOpts.json"
    },
    "screenshotsFolder": "cypress/reports/assets"
  },
};
if(cypressProjectId){
  cypressConfig.projectId = cypressProjectId;
}
export default defineConfig(cypressConfig);
