"use strict"
var REPORT_EVERY_TEST_RESULT = false
Object.defineProperty(exports, "__esModule", { value: true })
var path = require('path')
var appDir = path.resolve(".")
var chai = require("chai")
var expect = chai.expect
// Otherwise assertion failures in async tests are wrapped, which prevents mocha from
// being able to interpret them (such as displaying a diff).
process.on('unhandledRejection', function(err) {
    if(typeof err !== "string"){
        //qmLog.error("Error is not as string but is: ", null, {err})
        throw err
    }
    if(err.indexOf("unhandledRejection: Uncaught FetchError: invalid json response body") !== -1){
        qmLog.error(err)
    } else {
        throw err
    }
})
const envHelper = require("../../ts/env-helper");
envHelper.loadEnvFromDopplerOrDotEnv(null)
var qmGit = require("../../ts/qm.git")
var digitalTwin = require("../../public/js/digitalTwinApi")
var urlParser = require("url")
var https = require("https")
global.fetch = require("../../node_modules/node-fetch/lib/index.js")
global.Headers = fetch.Headers
var _str = require("underscore.string")
//global.bugsnagClient = require('./../../node_modules/bugsnag')
var argv = require('./../../node_modules/yargs').argv
global.qm = require('../../public/js/qmHelpers')
qm.appMode.mode = 'mocha'
global.qmLog = require('../../public/js/qmLogger')
qmLog.color = require('./../../node_modules/ansi-colors')
qm.github = require('github-api')
qm.Quantimodo = require('./../../node_modules/quantimodo')
require('../../public/data/appSettings.js')
require('../../public/data/commonVariables.js')
require('../../public/data/connectors.js')
require('../../public/data/dialogAgent.js')
require('../../public/data/qmStates.js')
require('../../public/data/units.js')
require('../../public/data/variableCategories.js')
require('../../public/data/stateNames.js')
qm.stateNames = qm.staticData.stateNames
qm.qmLog = qmLog
qmLog.qm = qm
qm.qmLog.setLogLevelName(process.env.LOG_LEVEL || 'info')
global.nlp = require('compromise')
var Q = global.Q = require('q')
global.Swal = require('./../../node_modules/sweetalert2/dist/sweetalert2.all')
global.moment = require('moment-timezone')
const {getBuildLink} = require("../../ts/test-helpers")

var qmTests = {
    getTestAccessToken(){
        var t = process.env.TEST_ACCESS_TOKEN
        if(!t){
            t = "test-token"
        }
        return t
    },
    setTestAccessToken(){
        qm.auth.logout()
        qm.auth.setAccessToken(qmTests.getTestAccessToken())
    },
    setDemoAccessToken(){
        qm.auth.logout()
        qm.auth.setAccessToken("demo")
    },
    testParams: {},
    setTestParams(params){
        qmTests.testParams = params
        qmLog.debug("Setting test params: " + JSON.stringify(params))
    },
    getTestParams(){
        if(typeof qmTests.testParams === 'string'){
            return JSON.parse(qmTests.testParams)
        }
        return qmTests.testParams
    },
    startUrl: null,
    getStartUrl(){
        var params = qmTests.getTestParams()
        var startUrl = 'https://medimodo.herokuapp.com'
        if(params && params.startUrl){ startUrl = params.startUrl }
        if(params && params.deploy_ssl_url){ startUrl = params.deploy_ssl_url }
        if(params && params.START_URL){ startUrl = params.START_URL }
        if(process.env.START_URL){ startUrl = process.env.START_URL }
        if(process.env.DEPLOY_PRIME_URL){ startUrl = process.env.DEPLOY_PRIME_URL }
        if(argv.startUrl){ startUrl = argv.startUrl }
        if(startUrl.indexOf('https') === -1){ startUrl = "https://" + startUrl }
        return startUrl
    },
    getSha(){
        var params = qmTests.getTestParams()
        if(params && params.commit_ref){ return params.commit_ref }
        if(params && params.sha){ return params.sha }
    },
    getStatusesUrl(){
        var params = qmTests.getTestParams()
        if(params && params.statuses_url){ return params.statuses_url }
        /** @namespace params.commit_url */
        if(params && params.commit_url){
            var url = params.commit_url
            url = url.replace('github.com', 'api.github.com/repos')
            url = url.replace('commit', 'statuses')
            return url
        }
        return null
    },
    getApiOrigin(){
        var params = qmTests.getTestParams()
        if(params && params.QM_API_ORIGIN){ return params.QM_API_ORIGIN }
        if(process.env.QM_API_ORIGIN){ return process.env.QM_API_ORIGIN }
        if(argv.apiOrigin){ return argv.apiOrigin }
        return 'api.quantimo.do'
    },
    tests: {
        checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, callback){
            var intents = qm.staticData.dialogAgent.intents
            var entities = qm.staticData.dialogAgent.entities
            info("Got " + entities.length + " entities")
            var matchedEntities = qm.dialogFlow.getEntitiesFromUserInput(userInput)
            for (var expectedEntityName in expectedEntities) {
                if (!expectedEntities.hasOwnProperty(expectedEntityName)) { continue }
                qm.assert.doesNotEqual(typeof matchedEntities[expectedEntityName], "undefined",
                    expectedEntityName + " not in matchedEntities!")
                qm.assert.equals(matchedEntities[expectedEntityName].matchedEntryValue, expectedEntities[expectedEntityName])
            }
            var expectedIntent = intents[expectedIntentName]
            var triggerPhraseMatchedIntent = qm.dialogFlow.getIntentMatchingCommandOrTriggerPhrase(userInput)
            qm.assert.equals(triggerPhraseMatchedIntent.name, expectedIntentName)
            var score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput)
            var filledParameters = expectedIntent.parameters
            var expectedParameterName
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) { continue }
                if(typeof filledParameters[expectedParameterName] === "undefined"){
                    score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput)
                }
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!")
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName])
            }
            qm.assert.greaterThan(-2, score)
            var matchedIntent = qm.dialogFlow.getIntent(userInput)
            filledParameters = matchedIntent.parameters
            qm.assert.equals(matchedIntent.name, expectedIntentName)
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) { continue }
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!")
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName])
            }
            if(callback){ callback() }
        },
        getOptions(startUrl){
            var options = {}
            options.startUrl = startUrl || qmTests.getStartUrl()
            options.apiOrigin = qmTests.getApiOrigin()
            if(qmTests.getSha()){ options.sha = qmTests.getSha() }
            if(qmTests.getStatusesUrl()){ options.statuses_url = qmTests.getStatusesUrl() }
            return options
        },
    },
    logBugsnagLink(suite, start, end){
        var query = "filters[event.since][0]=" +
            start + "&filters[error.status][0]=open&filters[event.before][0]=" +
            end + "&sort=last_seen"
        console.error(suite.toUpperCase() + " errors: https://app.bugsnag.com/quantimodo/" + suite + "/errors?" + query)
    },
    outputErrorsForTest(testResults){
        var name = testResults.testName || testResults.name
        console.error(name + " FAILED: https://app.ghostinspector.com/results/" + testResults._id)
        qmTests.logBugsnagLink('ionic', testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        qmTests.logBugsnagLink('slim-api', testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        console.error("=== CONSOLE ERRORS ====")
        for (var i = 0; i < testResults.console.length; i++) {
            var logObject = testResults.console[i]
            if(logObject.error || logObject.output.toLowerCase().indexOf("error") !== -1){
                console.error(logObject.output + " at " + logObject.url)
            }
        }
        process.exit(1)
    },
    runAllTestsForType (testType, callback) {
        console.info("=== " + testType + " Tests ===")
        var tests = qm.tests[testType]
        for (var testName in tests) {
            if (!tests.hasOwnProperty(testName)) continue
            console.info(testName + "...")
            tests[testName]()
            console.info(testName + " passed! :D")
        }
        if(callback){ callback() }
    },
}
var context = "qm.mocha.test.js"
before(function (done) {
    qmGit.setGithubStatus("pending", context, "Running...", getBuildLink(), function (res) {
        qmLog.debug(res)
        done()
    })
})
beforeEach(function (done) {
    var t = this.currentTest
    this.timeout(10000) // Default 2000 is too fast for Github API
    // @ts-ignore
    if(REPORT_EVERY_TEST_RESULT){
        qmGit.setGithubStatus("pending", t.title, "Running...", getBuildLink(), function (res) {
            qmLog.debug(res)
            done()
        })
    } else {
        done()
    }
})
var failedTests = []
var successfulTests = []
afterEach(function (done) {
    var t = this.currentTest
    // @ts-ignore
    var state = t.state
    if (!state) {
        qmLog.error("No test state in afterEach!")
        done()
        return
    }
    if (state === "failed") {
        failedTests.push(t)
    } else if (!REPORT_EVERY_TEST_RESULT) {
        successfulTests.push(t)
    }
    if (state === "failed" || REPORT_EVERY_TEST_RESULT) {
        // @ts-ignore
        qmGit.setGithubStatus((state === "failed") ? "failure" : "success", t.title, t.title, getBuildLink(), function (res) {
            qmLog.debug(res)
            done()
        })
    } else {
        done()
    }
})
after(function(done){
    if (failedTests.length) {
        qmGit.setGithubStatus("failure", context, failedTests.length + " failed tests in after() hook!", getBuildLink(), function (res) {
            qmLog.debug(res)
            done()
        })
        return
    }
    if (!successfulTests.length) {
        // eslint-disable-next-line no-debugger
        debugger
        qmGit.setGithubStatus("error", context, "No successfulTests or failedTests in after() hook!", getBuildLink(), function (res) {
            qmLog.debug(res)
            done()
        })
        return
    }
    qmGit.setGithubStatus("success", context, successfulTests.length + " tests passed!", getBuildLink(), function (res) {
        qmLog.debug(res)
        done()
    })
})
function downloadFileContains(url, expectedToContain) {
    const deferred = Q.defer()
    downloadFile(url)
        .then(function (str) {
            expect(str).to.contain(expectedToContain)
            deferred.resolve(str)
        })
    return deferred.promise
}
function downloadFile(url) {
    const deferred = Q.defer()
    var parsedUrl = urlParser.parse(url)
    var options = {
        hostname: parsedUrl.hostname,
        method: "GET",
        path: parsedUrl.path,
        port: 443,
    }
    var req = https.request(options, function (res) {
        console.log("statusCode: " + res.statusCode)
        expect(res.statusCode).to.eq(200)
        var str = ""
        res.on("data", function (chunk) {
            str += chunk
        })
        res.on("end", function () {
            console.log("RESPONSE: " + _str.truncate(str, 30))
            deferred.resolve(str)
        })
    })
    req.on("error", function (error) {
        console.error(error)
        deferred.reject(error)
    })
    req.end()
    return deferred.promise
}
function expectInteger(val){
    expect(val).to.be.a('number')
    expect(val % 1).to.equal(0)
}
function info(str, meta){
    qmLog.info("MOCHA: " + str, meta)
}
function checking(str, meta){
    info("Checking that " + str + "...", meta)
}

describe("Measurement", function () {
    function checkPostMeasurementResponse(data, variableName, value) {
        var measurements = qm.measurements.toArray(data.measurements)
        var id
        measurements.forEach(function (m) {
            id = m.id
            expectInteger(id)
            expect(m.variableName).eq(variableName)
            expect(m.value).eq(value)
        })
        expect(measurements).length(1)
        expect(data.userVariables).length(1)
        var queue = qm.measurements.getMeasurementsFromQueue()
        expect(queue).length(0)
        return id
    }
    it('can get connector measurements', function (done) {
        this.timeout(60000)
        var measurements = [{
            "sourceName": "Fitbit",
            "unitAbbreviatedName": "min",
            "value": 81,
            "variableName": "Duration of Awakenings During Sleep",
            "clientId": "fitbit",
            "connectorId": 7,
            "createdAt": "2020-12-11 00:18:52",
            "displayValueAndUnitString": "81 minutes",
            "id": 1092806496,
            "note": null,
            "noteHtml": null,
            "originalUnitId": 2,
            "originalValue": 81,
            "pngPath": "https://i.imgur.com/WE8KUx7.png",
            "productUrl": null,
            "startDate": null,
            "unitId": 2,
            "unitName": "Minutes",
            "updatedAt": "2020-12-11 00:18:52",
            "url": null,
            "valence": "negative",
            "variableCategoryId": 6,
            "variableCategoryName": "Sleep",
            "variableDescription": null,
            "variableId": 6054544,
            "startAt": "2020-12-10 00:00:00",
            "valueUnitVariableName": "81 minutes Duration of Awakenings During Sleep",
            "icon": "ion-ios-cloudy-night-outline",
        }]
        qmTests.setDemoAccessToken()
        qm.userHelper.getUserFromApi()
            .then(function () {
                qm.connectorHelper.getConnectorsFromLocalStorageOrApi(function(){
                    info('getConnectorsFromLocalStorageOrApi')
                    var connector = qm.connectorHelper.getConnectorByName("fitbit")
                    var filtered = qm.arrayHelper.filterByRequestParams(measurements, {connectorId: connector.id})
                    expect(filtered.length).to.eq(1)
                    var params = {connectorId: connector.id, sort: "-startAt"}
                    info('getMeasurementsFromApi')
                    qm.measurements.getMeasurementsFromApi(params).then(function(apiMeasurements){
                        expect(apiMeasurements.length).to.be.greaterThan(1)
                        apiMeasurements.forEach(function(m){
                            expect(m.connectorId).to.eq(connector.id)
                        })
                        qmLog.info(apiMeasurements.length + " measurements from API with params: ", params)
                        info('processMeasurements')
                        qm.measurements.processMeasurements(apiMeasurements)
                        done()
                    }, function (err){
                        qmLog.error(err)
                        done(err)
                        throw new Error(err)
                    }).catch(function(err){
                        qmLog.error(err)
                        done(err)
                        throw new Error(err)
                    })
                })
            }, function (err){
                //qmLog.error(err)
                done(err)
                throw err
            }).catch(function(err){
            qmLog.error(err)
            done(err)
            throw new Error(err)
        })
    })
    it('can record, edit, and delete a rating measurement', function () {
        this.timeout(60000)
        let d = new Date()
        let seconds = d.getSeconds()
        let initialValue = (seconds % 5) + 1
        let editedValue = ((initialValue % 5) + 1)
        qmTests.setTestAccessToken()
        var variableName = "Alertness"
        let measurementId
        return qm.userHelper.getUserFromApi()
            .then(function (user) {
                expect(user.id).to.eq(18535)
                info("Getting user variables...")
                expect(user.accessToken).to.eq(qmTests.getTestAccessToken())
                return qm.userVariables.getFromApi()
            })
            .then(function (userVariables) {
                expect(userVariables).to.be.a('array')
                info("getMeasurements...")
                return qm.measurements.getMeasurements({variableName, sort: "-startAt"})
            })
            .then(function (measurements) {
                info("Deleting last " + variableName + " measurement...")
                qm.measurements.logMeasurements(measurements, variableName + " Measurements")
                info("deleteLastMeasurementForVariable...")
                return qm.measurements.deleteLastMeasurementForVariable(variableName)
            })
            .then(function () {
                info("Recording " + initialValue + " /5 " + variableName + " measurement...")
                var body = {
                    value: initialValue,
                    variableName,
                    unitAbbreviatedName: "/5",
                }
                info("qm.measurements.recordMeasurement: ", body)
                return qm.measurements.postMeasurement(body)
            })
            .then(function (data) {
                info("Checking post measurement response...")
                measurementId = checkPostMeasurementResponse(data, variableName, initialValue)
                info("userVariables.getFromLocalStorage...")
                return qm.userVariables.getFromLocalStorage({variableName})
            })
            .then(function (userVariables) {
                info("Checking qm.userVariables.getFromLocalStorage({variableName}) after post measurement response...")
                expect(userVariables.length).to.eq(1)
                info("getting charts...")
                return qm.userVariables.findWithCharts(variableName)
            })
            .then(function (uv) {
                expect(uv.charts).to.not.be.null
                info("measurements.getLocalMeasurements...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                info("Checking qm.measurements.getLocalMeasurements({variableName}) measurements...")
                var m = measurements[0]
                expect(m.value).eq(initialValue)
                expectInteger(m.id)
                measurements.forEach(function(m){
                    expectInteger(m.id)
                    expect(m.variableName).eq(variableName)
                })
                info("userVariables.getFromLocalStorage...")
                return qm.userVariables.getFromLocalStorage({variableName})
            })
            .then(function (userVariables) {
                expect(userVariables).length(1)
                info("Checking qm.userVariables.getFromLocalStorage({})...")
                var uv = userVariables[0]
                expect(uv.variableName).to.eq(variableName) // Should be first since it has most recent measurement
                info("measurements.getLocalMeasurements 2...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                info("Checking qm.measurements.getLocalMeasurements({variableName})...")
                expect(measurements).length.to.be.greaterThan(0)
                measurements.forEach(function (measurement) {
                    expect(measurement.pngPath).to.be.a('string')
                        .and.satisfy((msg) => msg.startsWith("img/rating/face_rating_button_256_"))
                })
                info("Finding local measurement by id...")
                return qm.measurements.find(measurementId)
            })
            .then(function (measurement) {
                expect(measurement.id).to.eq(measurementId)
                qm.measurements.cache = {}
                info("Finding remote measurement by id...")
                return qm.measurements.find(measurementId)
            })
            .then(function (measurement) {
                expect(measurement.id).to.eq(measurementId)
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                info("Editing measurement...")
                var m = measurements[0]
                expect(m.id).to.eq(measurementId)
                m.value = editedValue
                return qm.measurements.postMeasurement(m)
            })
            .then(function (data) {
                var editedId = checkPostMeasurementResponse(data, variableName, editedValue)
                expect(editedId).to.eq(measurementId)
                info("qm.measurements.getLocalMeasurements({variableName})...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                expect(measurements[0].value).to.eq(editedValue)
                info("measurements.deleteMeasurement...")
                return qm.measurements.deleteMeasurement(measurements[0])
            })
            .then(function () {
                info("measurements.getLocalMeasurements 4...")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                measurements.forEach(function(m){
                    expect(m.id).to.not.eq(measurementId)
                })
            })
        // .catch(function (error) {
        //     throw Error(error)
        // })
    })
})

describe("API", function (){
    it.skip("Makes sure api url is app.quantimo.do", function (done) {
        if(qm.appMode.isStaging()){
            expect(qm.api.getQMApiOrigin()).to.eq("https://staging.quantimo.do")
        } else {
            expect(qm.api.getQMApiOrigin()).to.eq("https://app.quantimo.do")
        }
        done()
    })
    it("Makes sure it parses error responses properly", function (done) {
        this.timeout(60000)
        var params = {"log":"testuser","pwd":"testing123","pwdConfirm":"testing123","register":true}
        qm.api.post('api/v3/userSettings', params, function(response){
            //qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
            expect(true).to.eq(false)
        }, function(error){
            var message = qm.api.getErrorMessageFromResponse(error);
            expect(message).to.contain('User testuser already exists')
            //qmService.showMaterialAlert("Error", message);
            done()
        });

    });
})
function deleteLastMeasurement(variableName) {
    return function () {
        info("deleteLastMeasurement for " + variableName)
        return qm.measurements.getMeasurements({variableName}).then(function (measurements) {
            qm.measurements.logMeasurements(measurements, variableName + " Measurements Before Deleting")
        }).then(function () {
            return qm.measurements.deleteLastMeasurementForVariable(variableName)
        }).then(function () {
            return qm.measurements.getMeasurements({variableName}).then(function (measurements) {
                qm.measurements.logMeasurements(measurements, variableName + " Measurements After Deleting")
            })
        })
    }
}
describe("User Variables", function () {
  it("Can get a variable by name", function (done) {
      this.timeout(10 * 1000)
      qmTests.setTestAccessToken()
      qm.userVariables.getFromLocalStorageOrApi({limit: 1})
          .then(function (variables) {
              expect(variables.length).to.eq(1)
              let first = variables[0]
              const name = first.name;
              qmLog.info("First variable: " + name)
              qm.userVariables.findWithCharts(name, true)
                  .then(function(uv){
                      expect(uv.name).to.eq(name)
                      expect(uv.charts).to.not.be.empty
                      done()
                  });
      })
  });
})
describe("Favorites", function () {
    function createFavorite(variableName) {
        info("createFavorite for " + variableName)
        return function (reminders) {
            expect(reminders).length(0)
            expect(qm.reminderHelper.getQueue()).length(0)
            return createReminder({variableName, reminderFrequency: 0, defaultValue: 100},
                1, 0, 1)
        }
    }
    function trackByFavorite(variableName, recordedValue) {
        return function (favorites) {
            info("trackByFavorite for " + variableName)
            expect(favorites).length(1)
            expect(qm.reminderHelper.getQueue()).length(0)
            const notifications = qm.notifications.getCached()
            expect(notifications).length(0)
            var f = favorites[0]
            qm.reminderHelper.trackByFavorite(f, recordedValue)
            expect(f.value).to.eq(recordedValue)
            expect(f.displayTotal).to.eq("Recorded " + f.value + " " + f.unitAbbreviatedName)
            var timeout = f.timeout
            timeout._onTimeout()
            clearTimeout(timeout)
            return qm.measurements.getLocalMeasurements({variableName})
        }
    }
    it("record measurement by favorite", function () {
        this.timeout(90000)
        const variableName = "Aaa Test Treatment"
        const variableCategoryName = "Treatments"
        qmTests.setTestAccessToken()
        let recordedValue = qm.math.getRandomIntBetween(1, 100)
        return qm.userHelper.getUserFromApi({})
            .then(function (user){
                expect(user.accessToken, qmTests.getTestAccessToken())
                info("deleting reminders for " + variableName)
                return qm.reminderHelper.deleteByVariableName(variableName)
            })
            .then(function () {
                info("getting reminders for " + variableName)
                return qm.reminderHelper.getReminders({variableName})
            })
            .then(createFavorite(variableName))
            .then(function (){
                var cached = qm.reminderHelper.getCached()
                expect(cached[0].reminderFrequency).to.eq(0)
            })
            .then(deleteLastMeasurement(variableName))
            .then(function() {
                info("qm.reminderHelper.getFavorites for " + variableCategoryName)
                return qm.reminderHelper.getFavorites(variableCategoryName)
            })
            .then(trackByFavorite(variableName, recordedValue))
            .then(function (measurements) {
                expect(measurements.length).to.eq(20)
                var m = measurements[0]
                expect(m.value).to.eq(recordedValue)
            })
    })
})

function createReminder(tr, expectedVariables, expectedNotifications, expectedReminders) {
    var queueBefore = qm.reminderHelper.getQueue()
    qm.reminderHelper.addToQueue([tr])
    expect(qm.reminderHelper.getQueue()).length(queueBefore.length + 1)
    return qm.reminderHelper.syncReminders()
        .then(function (response) {
            const data = (response && response.data) ? response.data : null
            expect(data.trackingReminders).length(expectedReminders)
            expect(data.userVariables).length(expectedVariables)
            expect(data.trackingReminderNotifications).length(expectedNotifications)
            expect(qm.notifications.getCached()).length(expectedNotifications)
            expect(qm.reminderHelper.getCached()).length(expectedReminders)
        }).catch(function(err){
            throw Error(err)
        })
}
describe("Reminders", function () {
    it("can create a reminder and track the notification", function () {
        this.timeout(90000)
        //expect(qm.appMode.isLocal()).to.be.true
        const variableName = "Hostility"
        qmTests.setTestAccessToken()
        var yesterday = qm.timeHelper.getYesterdayDate()
        return qm.userHelper.getUserFromApi({})
            .then(function (user){
                expect(user.accessToken, qmTests.getTestAccessToken())
                info("Deleting reminders...")
                return qm.reminderHelper.deleteByVariableName(variableName)
            })
            .then(function () {
                return qm.reminderHelper.getReminders({variableName})
            })
            .then(function (reminders) {
                checking("reminders have been deleted")
                expect(reminders).length(0)
                expect(qm.reminderHelper.getQueue()).length(0)
                return createReminder({variableName, frequency: 60},
                    1, 1, 1)
            })
            .then(deleteLastMeasurement(variableName))
            .then(function () {
                checking("measurements have been deleted")
                expect(qm.reminderHelper.getQueue()).length(0)
                expect(qm.reminderHelper.getCached()).length(1)
                const notifications = qm.notifications.getCached()
                expect(notifications).length(1)
                const n = notifications[0]
                n.value = 1
                expect(qm.notifications.timeout).to.be.null
                qm.notifications.track(notifications[0])
                expect(qm.notifications.timeout).to.not.be.null
                expect(qm.notifications.getQueue()).length(1)
                checking("we get a local measurement for the notification we tracked before sync")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                qm.measurements.logMeasurements(measurements, "Local Measurements")
                expect(measurements).length(1)
                info("syncing notifications...")
                return qm.notifications.syncIfQueued()
            })
            .then(function (response) {
                info("Checking post notifications response...")
                expect(qm.notifications.getQueue()).length(0)
                expect(qm.notifications.getCached()).length(0)
                var measurements = qm.measurements.toArray(response.measurements)
                expect(measurements).length(1)
                expect(response.userVariables).length(1)
                checking("we stored measurement from post notification response")
                return qm.measurements.getLocalMeasurements({variableName})
            })
            .then(function (measurements) {
                checking("we get a measurement for the notification we tracked")
                expect(measurements).length(1)
                return qm.reminderHelper.getReminders({variableName})
            })
            .then(function (reminders) {
                checking("we get reminder we created")
                expect(reminders).length(1)
                expect(qm.reminderHelper.getQueue()).length(0)
                var tr = reminders[0]
                expect(tr.variableName).to.eq(variableName)
                expect(tr.stopTrackingDate).to.be.null
                expect(qm.reminderHelper.getActive()).length(1)
                expect(qm.reminderHelper.getArchived()).length(0)
                tr.stopTrackingDate = yesterday
                expect(qm.reminderHelper.getQueue()).length(0)
                info("setting stopTrackingDate to " + yesterday)
                return createReminder(tr, 1, 0, 1)
            })
            //  .then(function (){
            //     checking("reminder is disabled")
            //     var reminders = qm.reminderHelper.getCached()
            //     expect(qm.reminderHelper.getQueue()).length(0)
            //     expect(reminders).length(1)
            //     expect(qm.reminderHelper.getActive()).length(0)
            //     expect(qm.reminderHelper.getArchived()).length(1)
            //     expect(qm.notifications.getCached()).length(0)
            //     var tr = reminders[0]
            //     expect(tr.stopTrackingDate).to.eq(yesterday)
            //     tr.stopTrackingDate = null
            //     info("re-enabling reminder...")
            //     return createReminder(tr, 1, 1, 1)
            // })
            // .then(function (){
            //     checking("reminder is re-enabled")
            //     var reminders = qm.reminderHelper.getCached()
            //     expect(qm.reminderHelper.getQueue()).length(0)
            //     expect(reminders).length(1)
            //     expect(qm.reminderHelper.getActive()).length(1)
            //     expect(qm.reminderHelper.getArchived()).length(0)
            //     var tr = reminders[0]
            //     expect(tr.stopTrackingDate).to.be.null
            //     expect(qm.notifications.getCached()).length(1)
            //})
            .catch(function(err){
                throw Error(err)
            })
    })
})
describe("Studies", function () {
    it('can get a study showing relationship between eggs and mood', function() {
        this.timeout(30000)
        qmTests.setTestAccessToken()
        var causeName = "Eggs (serving)"
        var effectName = "Overall Mood"
        return qm.studyHelper.getStudyFromApi({
            causeVariableName: causeName,
            effectVariableName: effectName,
            userId: 230,
        }).then(function(study){
            //expect(qm.getUser().id).to.eq(18535)
            info("Got study " + study.causeVariableName)
            expect(qm.userVariables.cached).to.not.have.property(causeName,
              "We should not have a "+causeName+" user variable because we're not logged in")
            // expect(qm.userVariables.cached).to.not.have.property(effectName,
            //   "We should not have a user variable because we're not logged in")
            expect(qm.commonVariablesHelper.cached).to.not.have.property(causeName)
            expect(qm.commonVariablesHelper.cached).to.not.have.property(effectName)
            qm.variablesHelper.getFromLocalStorageOrApi({
                variableName: "Eggs (serving)",
            }).then(function(variables){
                expect(variables).length(1, "Why did we get " + variables.length +
                    " variables for Eggs (serving)?!?!?")
                qm.getUser(function (user){
                    qm.assert.equals(user.id, variables[0].userId,
                        "The logged in user doesn't have eggs because the study belonged to someone else")
                })
            }, function(error){
                throw Error(error)
            })
        }, function(error){
            throw Error(error)
        })
    })
})

function generateRandomEmail() {
    let rand = Math.round(Math.random() * 1000000);
    var email = "testuser" + rand + "@quantimo.do";
    return email;
}

describe("Users", function () {
    it.skip('can get users', function(done) {
        this.timeout(10000)
        //expect(qm.api.getApiOrigin()).to.eq("https://app.quantimo.do")
        qmTests.setTestAccessToken()
        qm.userHelper.getUsersFromApi(function(response){
            var users = response.users
            qmLog.debug("users:", users)
            qm.assert.greaterThan(0, users.length)
            done()
        }, function(error){
            throw error
        })
    })
    it('can create a user via API', function(done) {
        this.timeout(20000)
        var email = generateRandomEmail();
        var params = {
            email: email,
            password: "some-damn-pw",
            register: true
        }
        let origin = 'https://curedao-n66b6ronka-uc.a.run.app';
        origin = qm.api.getQMApiOrigin()
        let url = origin + '/api/v3/userSettings';
        console.log('url', url);
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Id': process.env.CONNECTOR_QUANTIMODO_CLIENT_ID,
                'X-Client-Secret': process.env.CONNECTOR_QUANTIMODO_CLIENT_SECRET
            },
            body: JSON.stringify(params)
        })
          .then(response => response.json())
          .then(response => {
              // enter you logic when the fetch is successful
              console.log(response)
              //expect(response.data).to.have.property('user')
              var user = response.data.user
              if(user.message){
                  throw Error(user.message)
              }
              expect(user).to.have.property('id')
              expect(user).to.have.property('email')
              expect(user).to.have.property('loginName')
              expect(user).not.to.have.property('password')
              expect(user.email).to.eq(params.email)
              //expect(user.loginName).to.eq(params.email)
              //expect(user.password).to.eq(params.pwd)
              expect(user.clientId).to.eq(qm.getClientId())
              done()
          })
          .catch(error => {
              // enter your logic for when there is an error (ex. error toast)
              console.error("Error:", error)
              throw error;
          })
    })
})
describe("Login", function () {
    it.skip('can login and logout via email and password via API', async function(done) {
        // TODO: Figure out how to preserve cookie session between requests in tests
        this.timeout(5000)
        let request = { body: { email: "testuser@mikesinn.com", password: "testing123" } };
        const loginUrl = qm.urlHelper.prefixQMAPIOriginIfNecessary('/auth/login')
        var response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.body),
            // }).then(function(response){
            //     return response.json()
            // }).then(function(json){
            //     qmLog.debug("user:", json)
            //     qm.assert.equals("testuser", json.user_login);
        })
        let apiUrl = qm.urlHelper.prefixQMAPIOriginIfNecessary("/api/v1/user");
        let cookie = response.headers.get('set-cookie');
        function parseCookies(response) {
            const raw = response.headers.raw()['set-cookie'];
            return raw.map((entry) => {
                const parts = entry.split(';');
                const cookiePart = parts[0];
                return cookiePart;
            }).join(';');
        }
        let parsedCookies = parseCookies(response);
        let userFromAPIResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'cookie': parsedCookies
            }
        })
        let userFromAPI = await userFromAPIResponse
        let text = await userFromAPI.text();
        let parsed = qm.stringHelper.isJson(text);
        if(!parsed){
            throw Error(text)
        }
        qmLog.debug("userFromAPI:", parsed)
        qm.assert.equals("testuser", parsed.user_login);
        qm.userHelper.logout(function(response){
            qmLog.debug("response:", response)
            qm.assert.equals("You have been logged out", response.message)
            qm.getUser(function(user){
                throw Error("User should be logged out but we got " + JSON.stringify(user))
            }, function(error){
                qmLog.error(error)
                done()
            })
        }, function(error){
            throw error
        })
    })
})
describe("Variables", function () {
    it("can search for common variables containing partial string", function (done) {
        this.timeout(30000) // Default 2000 is too fast for Github API
        //qm.qmLog.setLogLevelName("debug");
        var alreadyCalledBack = false
        qmTests.setTestAccessToken()
        qm.userHelper.getUserFromLocalStorageOrApi().then(function (user) {
            qmLog.debug("User: ", user)
            if(!qm.getUser()){ throw "No user!" }
            var params = {
                excludeLocal: null,
                includePublic: true,
                minimumNumberOfResultsRequiredToAvoidAPIRequest: 20,
                searchPhrase: "car",
            }
            qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                info('=== Got ' + variables.length + ' variables matching ' + params.searchPhrase)
                // Why? qm.assert.doesNotHaveUserId(variables);
                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                qm.assert.greaterThan(5, variables.length)
                var variable5 = variables[4]
                var timestamp = qm.timeHelper.at()
                qm.variablesHelper.setLastSelectedAtAndSave(variable5)
                var userVariables = qm.globalHelper.getItem(qm.items.userVariables) || []
                info("There are " + userVariables.length + " user variables")
                //qm.assert.isNull(userVariables, qm.items.userVariables);
                qm.variablesHelper.getFromLocalStorageOrApi({id: variable5.id, includePublic: true})
                    .then(function(variables){
                        // Why? qm.assert.doesNotHaveProperty(variables, 'userId');
                        qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                        qm.assert.equals(timestamp, variables[0].lastSelectedAt, 'lastSelectedAt')
                        qm.assert.equals(variable5.name, variables[0].name, 'name')
                        qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                            qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                            var variable1 = variables[0]
                            info("Variable 1 is " + variable1.name)
                            //qm.assert.equals(variable1.lastSelectedAt, timestamp);
                            //qm.assert.equals(variable1.variableId, variable5.variableId);
                            //qm.assert.equals(1, qm.api.requestLog.length, "We should have made 1 request but have "+ JSON.stringify(qm.api.requestLog));
                            if(done && !alreadyCalledBack){
                                alreadyCalledBack = true
                                done()
                            }
                        })
                    }, function(error){
                        throw Error(error)
                    })
            })
        })
    })
    it('can search manual tracking variables', function(done) {
        this.timeout(30000) // Default 2000 is too fast for Github API
        qmTests.setTestAccessToken()
        qm.userHelper.getUserFromLocalStorageOrApi().then(function (user) {
            info("Got user " + user.loginName)
            if(!qm.getUser()){ throw "No user!" }
            var params = {
                limit: 100,
                includePublic: true,
                manualTracking: true,
            }
            qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                info('Got ' + variables.length + ' variables')
                qm.assert.count(params.limit, variables)
                var manual = variables.filter(function (v) {
                    return v.manualTracking
                })
                qm.assert.count(params.limit, manual)
                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                done()
            })
        })
    })
})
describe("NFT", function () {
	it('can can mint a digital twin nft', async function(done) {
		var image = await digitalTwin.generateLifeForceNftImage();

		done()
	})
})
