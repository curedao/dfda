var qmExec = require('./qmExec');
var qmLog = {
    error: function (message, metaData, maxCharacters) {
        metaData = qmLog.addMetaData(metaData);
        console.error(qmLog.obfuscateStringify(message, metaData, maxCharacters));
        metaData.build_info = {
            builtAt: qmLog.timeHelper.getUnixTimestampInSeconds(),
            buildServer: qmLog.getCurrentServerContext(),
            buildLink: qmLog.buildInfoHelper.getBuildLink(),
        };
        bugsnag.notify(new Error(qmLog.obfuscateStringify(message), qmLog.obfuscateSecrets(metaData)));
    },
    errorAndExceptionTestingOrDevelopment: function(message, metaData, maxCharacters){
        throw message;
    },
    info: function (message, object, maxCharacters) {console.log(qmLog.obfuscateStringify(message, object, maxCharacters));},
    debug: function (message, object, maxCharacters) {
        if(qmLog.isTruthy(process.env.BUILD_DEBUG || process.env.DEBUG_BUILD)){
            qmLog.info("DEBUG: " + message, object, maxCharacters);
        }
    },
    authDebug: function(name, message, errorSpecificMetaData) {
        name = "Auth Debug: " + name;
        qmLog.debug(name, message, errorSpecificMetaData);
    },
    webAuthDebug: function(name, message, errorSpecificMetaData) {
        name = "Web Auth Debug: " + name;
        qmLog.debug(name, message, errorSpecificMetaData);
    },
    logErrorAndThrowException: function (message, object) {
        qmLog.error(message, object);
        throw message;
    },
    addMetaData: function(metaData){
        metaData = metaData || {};
        metaData.environment = qmLog.obfuscateSecrets(process.env);
        metaData.subsystem = { name: qmLog.getCurrentServerContext() };
        metaData.client_id = process.env.CONNECTOR_QUANTIMODO_CLIENT_ID;
        metaData.build_link = qmLog.getBuildLink();
        return metaData;
    },
    obfuscateStringify: function(message, object, maxCharacters) {
        if(maxCharacters !== false){maxCharacters = maxCharacters || 140;}
        var objectString = '';
        if(object){
            object = qmLog.obfuscateSecrets(object);
            objectString = ':  ' + qmLog.prettyJSONStringify(object);
        }
        if (maxCharacters !== false && objectString.length > maxCharacters) {objectString = objectString.substring(0, maxCharacters) + '...';}
        message += objectString;
        if(process.env.CONNECTOR_QUANTIMODO_CLIENT_SECRET){message = message.replace(process.env.CONNECTOR_QUANTIMODO_CLIENT_SECRET, 'HIDDEN');}
        if(process.env.AWS_SECRET_ACCESS_KEY){message = message.replace(process.env.AWS_SECRET_ACCESS_KEY, 'HIDDEN');}
        if(process.env.ENCRYPTION_SECRET){message = message.replace(process.env.ENCRYPTION_SECRET, 'HIDDEN');}
        if(process.env.CUREDAO_PERSONAL_ACCESS_TOKEN){message = message.replace(process.env.CUREDAO_PERSONAL_ACCESS_TOKEN, 'HIDDEN');}
        return message;
    },
    obfuscateSecrets: function(object){
        if(typeof object !== 'object'){return object;}
        object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
        for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                var lowerCaseProperty = propertyName.toLowerCase();
                if(lowerCaseProperty.indexOf('secret') !== -1 || lowerCaseProperty.indexOf('password') !== -1 || lowerCaseProperty.indexOf('token') !== -1){
                    object[propertyName] = "HIDDEN";
                } else {
                    object[propertyName] = qmLog.obfuscateSecrets(object[propertyName]);
                }
            }
        }
        return object;
    },
    getCurrentServerContext: function() {
        if(process.env.CIRCLE_BRANCH){return "circleci";}
        if(process.env.BUDDYBUILD_BRANCH){return "buddybuild";}
        return process.env.HOSTNAME;
    },
    prettyJSONStringify: function(object) {return JSON.stringify(object, null, '\t');},
    isTruthy: function(value){return value && value !== "false"; },
    getBuildLink: function() {
        if(process.env.BUDDYBUILD_APP_ID){return "https://dashboard.buddybuild.com/apps/" + process.env.BUDDYBUILD_APP_ID + "/build/" + process.env.BUDDYBUILD_APP_ID;}
        if(process.env.CIRCLE_BUILD_NUM){return "https://circleci.com/gh/curedao/curedao-web-android-chrome-ios-app-template/" + process.env.CIRCLE_BUILD_NUM;}
        if(process.env.TRAVIS_BUILD_ID){return "https://travis-ci.org/" + process.env.TRAVIS_REPO_SLUG + "/builds/" + process.env.TRAVIS_BUILD_ID;}
    },
    timeHelper: {
        getUnixTimestampInSeconds: function(dateTimeString) {
            if(!dateTimeString){dateTimeString = new Date().getTime();}
            return Math.round(qmLog.timeHelper.getUnixTimestampInMilliseconds(dateTimeString)/1000);
        },
        getUnixTimestampInMilliseconds:function(dateTimeString) {
            if(!dateTimeString){return new Date().getTime();}
            return new Date(dateTimeString).getTime();
        },
        getTimeSinceString:function(unixTimestamp) {
            if(!unixTimestamp){return "never";}
            var secondsAgo = qmLog.timeHelper.secondsAgo(unixTimestamp);
            if(secondsAgo > 2 * 24 * 60 * 60){return Math.round(secondsAgo/(24 * 60 * 60)) + " days ago";}
            if(secondsAgo > 2 * 60 * 60){return Math.round(secondsAgo/(60 * 60)) + " hours ago";}
            if(secondsAgo > 2 * 60){return Math.round(secondsAgo/(60)) + " minutes ago";}
            return secondsAgo + " seconds ago";
        },
        secondsAgo: function(unixTimestamp) {return Math.round((qmLog.timeHelper.getUnixTimestampInSeconds() - unixTimestamp));}
    },
    buildInfoHelper: {
        alreadyMinified: function(){
            if(!qmLog.buildInfoHelper.getPreviousBuildInfo().gitCommitShaHash){return false;}
            return qmLog.buildInfoHelper.getCurrentBuildInfo().gitCommitShaHash === qmLog.buildInfoHelper.getCurrentBuildInfo().gitCommitShaHash;
        },
        previousBuildInfo: {
            iosCFBundleVersion: null,
            builtAt: null,
            buildServer: null,
            buildLink: null,
            versionNumber: null,
            versionNumbers: null,
            gitBranch: null,
            gitCommitShaHash: null
        },
        getCurrentBuildInfo: function () {
            return qmLog.buildInfoHelper.currentBuildInfo = {
                builtAt: qmLog.timeHelper.getUnixTimestampInSeconds(),
                buildServer: qmLog.getCurrentServerContext(),
                buildLink: qmLog.buildInfoHelper.getBuildLink(),
                gitBranch: qmLog.qmGit.branchName,
                gitCommitShaHash: qmLog.qmGit.getCurrentGitCommitSha()
            };
        },
        getPreviousBuildInfo: function () {
            return JSON.parse(fs.readFileSync(paths.www.buildInfo));
        },
        getBuildLink: function() {
            if(process.env.BUDDYBUILD_APP_ID){return "https://dashboard.buddybuild.com/apps/" + process.env.BUDDYBUILD_APP_ID + "/build/" + process.env.BUDDYBUILD_APP_ID;}
            if(process.env.CIRCLE_BUILD_NUM){return "https://circleci.com/gh/curedao/curedao-web-android-chrome-ios-app-template/" + process.env.CIRCLE_BUILD_NUM;}
            if(process.env.TRAVIS_BUILD_ID){return "https://travis-ci.org/" + process.env.TRAVIS_REPO_SLUG + "/builds/" + process.env.TRAVIS_BUILD_ID;}
        }
    },
    qmGit: {
        branchName: null,
        isMaster: function () {
            return qmLog.qmGit.branchName === "master"
        },
        isDevelop: function () {
            if(!qmLog.qmGit.branchName){
                throw "Branch name not set!"
            }
            return qmLog.qmGit.branchName === "develop"
        },
        isFeature: function () {
            return qmLog.qmGit.branchName.indexOf("feature") !== -1;
        },
        getCurrentGitCommitSha: function () {
            if(process.env.SOURCE_VERSION){return process.env.SOURCE_VERSION;}
            try {
                return require('child_process').execSync('git rev-parse HEAD').toString().trim()
            } catch (error) {
                qmLog.info(error);
            }
        },
        accessToken: process.env.GITHUB_ACCESS_TOKEN,
        getCommitMessage: function(callback){
            var commandForGit = 'git log -1 HEAD --pretty=format:%s';
            qmExec(commandForGit, function (error, output) {
                var commitMessage = output.trim();
                qmLog.info("Commit: "+ commitMessage);
                if(callback) {callback(commitMessage);}
            });
        },
        outputCommitMessageAndBranch: function () {
            qmLog.qmGit.getCommitMessage(function (commitMessage) {
                qmLog.qmGit.setBranchName(function (branchName) {
                    qmLog.info("=====\nBuilding\n" + commitMessage + "\non branch: "+ branchName + "\n=====");
                })
            })
        },
        setBranchName: function (callback) {
            function setBranch(branch, callback) {
                qmLog.qmGit.branchName = branch.replace('origin/', '');
                qmLog.info('current git branch: ' + qmLog.qmGit.branchName);
                if (callback) {callback(qmLog.qmGit.branchName);}
            }
            if (qmLog.qmGit.getBranchEnv()){
                setBranch(qmLog.qmGit.getBranchEnv(), callback);
                return;
            }
            try {
                qmLog.qmGit.setBranchName()
            } catch (e) {
                qmLog.info("Could not set branch name because " + e.message);
            }
        },
        getBranchEnv: function () {
            function getNameIfNotHead(envName) {
                if(process.env[envName] && process.env[envName].indexOf("HEAD") === -1){return process.env[envName];}
                return false;
            }
            if(getNameIfNotHead('CIRCLE_BRANCH')){return process.env.CIRCLE_BRANCH;}
            if(getNameIfNotHead('BUDDYBUILD_BRANCH')){return process.env.BUDDYBUILD_BRANCH;}
            if(getNameIfNotHead('TRAVIS_BRANCH')){return process.env.TRAVIS_BRANCH;}
            if(getNameIfNotHead('GIT_BRANCH')){return process.env.GIT_BRANCH;}
        }
    },
    fileHelper: {
        writeToFile: function(filePath, stringContents) {
        if(!stringContents || stringContents === "undefined" || stringContents === "null"){
            throw "String contents are " + stringContents;
        }
        qmLog.debug("Writing to " + filePath);
        if(typeof stringContents !== "string"){stringContents = qmLog.prettyJSONStringify(stringContents);}
        return fs.writeFileSync(filePath, stringContents);
    }
    },
    isDebugMode: function() {
        return qmLog.getLogLevelName() === "debug";
    },
    getLogLevelName: function() {
        return qmLog.logLevel;
    },
    setLogLevelName: function(value){
        if(qmLog.logLevel === value){return;}
        qmLog.logLevel = value;
        if(typeof localStorage !== "undefined"){
            localStorage.setItem(qm.items.logLevel, value); // Can't use qm.storage because of recursion issue
        }
    },

};
var fs = require('fs');
if(fs.existsSync('../tests/node_modules/bugsnag/lib/bugsnag.js')){
    var bugsnag = require('../tests/node_modules/bugsnag/lib/bugsnag.js');
} else {
    var bugsnag = require("bugsnag");
}
bugsnag.register("ae7bc49d1285848342342bb5c321a2cf");
bugsnag.releaseStage = qmLog.getCurrentServerContext();
process.on('unhandledRejection', function (err) {
    console.error("Unhandled rejection: " + (err && err.stack || err));
    bugsnag.notify(err);
});
bugsnag.onBeforeNotify(function (notification) {
    var metaData = notification.events[0].metaData;
    metaData = qmLog.addMetaData(metaData);
});
if(typeof window !== "undefined"){ window.qmLog = qmLog;} else {module.exports = qmLog;}
