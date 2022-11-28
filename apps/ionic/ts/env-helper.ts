import dotenv from "dotenv"
import {getAbsolutePath} from "./qm.file-helper"
import * as fileHelper from "./qm.file-helper"
import * as qmLog from "./qm.log"

export const envNames = {
    API_ORIGIN: "API_ORIGIN",
    AWS_ACCESS_KEY_ID: "AWS_ACCESS_KEY_ID",
    AWS_SECRET_ACCESS_KEY: "AWS_SECRET_ACCESS_KEY",
    BUGSNAG_API_KEY: "BUGSNAG_API_KEY",
    CONNECTOR_QUANTIMODO_CLIENT_ID: "CONNECTOR_QUANTIMODO_CLIENT_ID",
    CONNECTOR_QUANTIMODO_CLIENT_SECRET: "CONNECTOR_QUANTIMODO_CLIENT_SECRET",
    CUREDAO_PERSONAL_ACCESS_TOKEN: "CUREDAO_PERSONAL_ACCESS_TOKEN",
    CYPRESS_PROJECT_ID: "CYPRESS_PROJECT_ID",
    EXPRESS_ORIGIN: "EXPRESS_ORIGIN",
    EXPRESS_PORT: "EXPRESS_PORT",
    GH_TOKEN: "GH_TOKEN",
    GITHUB_ACCESS_TOKEN: "GITHUB_ACCESS_TOKEN",
    GITHUB_ACCESS_TOKEN_FOR_STATUS: "GITHUB_ACCESS_TOKEN_FOR_STATUS",
    LOGIN_SUCCESS_REDIRECT: "LOGIN_SUCCESS_REDIRECT",
    QM_AWS_ACCESS_KEY_ID: "QM_AWS_ACCESS_KEY_ID",
    QM_AWS_SECRET_ACCESS_KEY: "QM_AWS_SECRET_ACCESS_KEY",
}

export let paths = {
    apk: {// android\app\build\outputs\apk\release\app-release.apk
        arm7Release: "platforms/android/app/build/outputs/apk/release/app-arm7-release.apk",
        builtApk: null,
        combinedDebug: "platforms/android/app/build/outputs/apk/release/app-debug.apk",
        combinedRelease: "platforms/android/app/build/outputs/apk/release/app-release.apk",
        outputFolder: "platforms/android/app/build/outputs/apk",
        x86Release: "platforms/android/app/build/outputs/apk/release/app-x86-release.apk",
    },
    sass: ["./src/scss/**/*.scss"],
    src: {
        appSettings: "src/data/appSettings.js",
        data: "src/data",
        defaultPrivateConfig: "src/default.private_config.json",
        devCredentials: "src/dev-credentials.json",
        firebase: "src/lib/firebase/**/*",
        icons: "src/img/icons",
        js: "src/js/*.js",
        serviceWorker: "src/firebase-messaging-sw.js",
    },
    www: {
        appSettings: "src/data/appSettings.js",
        data: "www/data",
        defaultPrivateConfig: "www/default.private_config.json",
        devCredentials: "www/dev-credentials.json",
        firebase: "www/lib/firebase/",
        icons: "www/img/icons",
        js: "www/js/",
        scripts: "www/scripts",
    },
}

export function getRequiredEnv(envName: string) {
    return getEnvOrException(envName)
}

export function getenv(names: string|string[], defaultValue?: null | string): string | null {
    if(!Array.isArray(names)) {names = [names]}
    function getFromProcess(): string | null  {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < names.length; i++) {
            const name = names[i]
            const val = process.env[name]
            if (typeof val !== "undefined" && val !== null && val !== "") {
                // @ts-ignore
                return val
            }
        }
        return null
    }
    let result = getFromProcess()
    if(result !== null) {return result}
    try {
        loadEnv(".env")
        result = getFromProcess()
        if(result !== null) {return result}
        console.info("Could not get "+names.join(" or ")+" from .env file or process.env")
    } catch (e) {
        // @ts-ignore
        console.info(e.message+"\n No .env to get "+names.join(" or "))
    }
    return defaultValue || null
}
export function loadEnvFromDopplerOrDotEnv(relativeEnvPath: string|undefined|null): void {
    if(!process.env.DOPPLER_TOKEN) {
        try {
            loadEnv(relativeEnvPath)
        } catch (e) {
            qmLog.error("Please provide a DOPPLER_TOKEN environment variable or .env in root of repo")
            throw e
        }
    } else {
        loadDopplerSecrets()
    }
}

export function getEnvOrException(names: string|string[]): string {
    if(!Array.isArray(names)) {names = [names]}
    const val = getenv(names)
    if (val === null || val === "" || val === "undefined") {
        const msg = `
==================================================================
Please specify
` + names.join(" or ") + `
in .env file in root of project or system environmental variables
==================================================================
`
        qmLog.throwError(msg)
        throw new Error(msg)
    }
    return val
}

export function loadEnv(relativeEnvPath: string | undefined|null): void {
    if(!relativeEnvPath) {
        relativeEnvPath = ".env"
        let count = 0
        while (!fileHelper.exists(relativeEnvPath)) {
            count++
            if(count > 10) {throw Error("Could not find .env file")}
            relativeEnvPath = "../" + relativeEnvPath
        }
    }
    const path = fileHelper.getAbsolutePath(relativeEnvPath)
    console.info("Loading " + path)
    // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
    const result = dotenv.config({path})
    if (result.error) {
        throw result.error
    }
    // qmLog.info(result.parsed.name)
}

export function getQMClientIdOrException(): string {
    return getEnvOrException(envNames.CONNECTOR_QUANTIMODO_CLIENT_ID)
}

export function getQMClientIdIfSet(): string|null {
    return getenv(envNames.CONNECTOR_QUANTIMODO_CLIENT_ID)
}

export function getQMClientSecret(): string | null {
    return getenv(envNames.CONNECTOR_QUANTIMODO_CLIENT_SECRET)
}

export function getAppHostName() {
    return getenv(envNames.API_ORIGIN)
}

export function getAccessToken(): string {
    return getEnvOrException(envNames.CUREDAO_PERSONAL_ACCESS_TOKEN)
}

export function getGithubAccessToken(): string {
    return getEnvOrException([envNames.GITHUB_ACCESS_TOKEN_FOR_STATUS, envNames.GITHUB_ACCESS_TOKEN, envNames.GH_TOKEN])
}

export const qmPlatform = {
    android: "android",
    buildingFor: {
        getPlatformBuildingFor() {
            if(qmPlatform.buildingFor.android()) {return "android"}
            if(qmPlatform.buildingFor.ios()) {return "ios"}
            if(qmPlatform.buildingFor.chrome()) {return "chrome"}
            if(qmPlatform.buildingFor.web()) {return "web"}
            qmLog.error("What platform are we building for?")
            return null
        },
        setChrome() {
            qmPlatform.buildingFor.platform = qmPlatform.chrome
        },
        platform: "",
        web() {
            return !qmPlatform.buildingFor.android() &&
                !qmPlatform.buildingFor.ios() &&
                !qmPlatform.buildingFor.chrome()
        },
        android() {
            if (qmPlatform.buildingFor.platform === "android") { return true }
            if (process.env.BUDDYBUILD_SECURE_FILES) { return true }
            if (process.env.TRAVIS_OS_NAME === "osx") { return false }
            return process.env.BUILD_ANDROID
        },
        ios() {
            if (qmPlatform.buildingFor.platform === qmPlatform.ios) { return true }
            if (process.env.BUDDYBUILD_SCHEME) {return true}
            if (process.env.TRAVIS_OS_NAME === "osx") { return true }
            return process.env.BUILD_IOS
        },
        chrome() {
            if (qmPlatform.buildingFor.platform === qmPlatform.chrome) { return true }
            return process.env.BUILD_CHROME
        },
        mobile() {
            return qmPlatform.buildingFor.android() || qmPlatform.buildingFor.ios()
        },
    },
    chrome: "chrome",
    setBuildingFor(platform: string) {
        qmPlatform.buildingFor.platform = platform
    },
    isOSX() {
        return process.platform === "darwin"
    },
    isLinux() {
        return process.platform === "linux"
    },
    isWindows() {
        return !qmPlatform.isOSX() && !qmPlatform.isLinux()
    },
    getPlatform() {
        if(qmPlatform.buildingFor) {return qmPlatform.buildingFor}
        if(qmPlatform.isOSX()) {return qmPlatform.ios}
        if(qmPlatform.isWindows()) {return qmPlatform.android}
        return qmPlatform.web
    },
    ios: "ios",
    web: "web",
    isBackEnd() {
        return typeof window === "undefined"
    },
}

function loadDopplerSecrets() {
    let result
    const absPath = getAbsolutePath("doppler-secrets-async.js")
    result = require("child_process").execSync("node "+absPath)
    const secrets = JSON.parse(result)
    qmLog.info("Setting envs from doppler-secrets-async.js...")
    const env = process.env
    Object.keys(secrets).forEach(function(key) {
        if (secrets.hasOwnProperty(key)) {
            const value = secrets[key]
            const existingValue = env[key] || null
            if(existingValue && existingValue.length > 0) {
                qmLog.info(key + " already set to " + existingValue)
                return
            }
            if (value.length > 6) {
                qmLog.debug(key + "=..." + value.substring(value.length - 6, value.length))
            } else {
                qmLog.debug(key + "=" + value)
            }
            process.env[key] = secrets[key]
        }
    })
}
