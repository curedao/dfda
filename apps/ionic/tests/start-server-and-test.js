#!/usr/bin/env node
const qmLog = require("../ts/qm.log")
// noinspection JSCheckFunctionSignatures
const envHelper = require("../ts/env-helper");
envHelper.loadEnvFromDopplerOrDotEnv(".env")
var from = 15000,
    range = 100,
    port = from + ~~(Math.random() * range);
const startAndTest = require('../node_modules/start-server-and-test/src/index.js').startAndTest
const utils = require('../node_modules/start-server-and-test/src/utils')
const {getCurrentGitCommitSha} = require("../ts/qm.git");
const {getHumanDateTime} = require("../ts/qm.time-helper");
const baseUrl = envHelper.getenv("BASE_URL") || "http://localhost:"+port;
process.env.BASE_URL = baseUrl;
let services = [
  {
    "start": `http-server ./src -c-1 -p ${port} --silent`,
    "url": [
      baseUrl
    ]
  }
]
qmLog.info("Starting services...", services)
let id = getCurrentGitCommitSha()+"-"+getHumanDateTime()
let test = `npx currents run --parallel --record --key ${envHelper.getEnvOrException('CURRENTS_RECORD_KEY')} --ci-build-id ${id}`
if(envHelper.getenv('APP_DEBUG')) {
  utils.printArguments({ services, test })
}
startAndTest({ services, test }).catch(e => {
  console.error(e)
  process.exit(1)
})
