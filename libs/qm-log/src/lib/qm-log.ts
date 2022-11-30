import Bugsnag from "@bugsnag/js"
import qm from "@curedao/qm-helpers"
import {envNames, getenv, getEnvOrException, getQMClientIdIfSet, qmPlatform} from "@curedao/env-helper"

export function le(s: string, meta: any) {
  s = obfuscateString(s)
  if(meta) {
    meta = obfuscateSecrets(meta)
    s += prettyJSONStringify(meta)
  }
  throw Error(s)
}

// tslint:disable-next-line:max-line-length
function isTruthy(value: any) {
  return (value && value !== "false")
}
// getenvOrException(envs.BUGSNAG_API_KEY)
function getBugsnag() {
  Bugsnag.start({
                  apiKey: getEnvOrException(envNames.BUGSNAG_API_KEY),
                  releaseStage:  getCurrentServerContext(),
                  onError(event: { addMetadata: (arg0: string, arg1: any) => void }) {
                    event.addMetadata("GLOBAL_META_DATA", addMetaData())
                  },
                  // otherOptions: https://docs.bugsnag.com/platforms/javascript/configuration-options/
                })
  process.on("unhandledRejection", function(err) {
    // @ts-ignore
    console.error("Unhandled rejection: " + (err && err.stack || err))
    // @ts-ignore
    Bugsnag.notify(err)
  })
  return Bugsnag
}

export function error(message: string|any, metaData?: any, maxCharacters?: number) {
  // tslint:disable-next-line:no-debugger
  debugger
  metaData = addMetaData(metaData)
  message = obfuscateStringify(message, metaData, maxCharacters)
  if(qmPlatform.isBackEnd()) {
    message = "=====================\n"+message+"\n====================="
  }
  console.error(message)
  if(getenv(envNames.BUGSNAG_API_KEY)) {
    getBugsnag().notify(obfuscateStringify(message), metaData)
  }
}

export function info(message: string, object?: any, maxCharacters?: any) {
  console.info(obfuscateStringify(message, object, maxCharacters))
}

export function debug(message: string, object?: any, maxCharacters?: any) {
  if (isTruthy(process.env["BUILD_DEBUG"] || process.env["DEBUG_BUILD"])) {
    info("DEBUG: " + message, object, maxCharacters)
  }
}

export function addMetaData(metaData?: { environment?: any; subsystem?: any; client_id?: any; build_link?: any; }) {
  metaData = metaData || {}
  metaData.environment = obfuscateSecrets(process.env)
  //metaData.subsystem = {name: getCiProvider()}
  metaData.client_id = getQMClientIdIfSet()
  //metaData.build_link = getBuildLink()
  return metaData
}

export function obfuscateStringify(message: string, object?: object, maxCharacters?: number): string {
  maxCharacters = maxCharacters || 140
  let objectString = ""
  if (object) {
    object = obfuscateSecrets(object)
    objectString = ":  " + prettyJSONStringify(object)
  }
  if (maxCharacters && objectString.length > maxCharacters) {
    objectString = objectString.substring(0, maxCharacters) + "..."
  }
  message += objectString
  message = obfuscateString(message)
  return message
}

export function isSecretWord(propertyName: string) {
  const lowerCaseProperty = propertyName.toLowerCase()
  return lowerCaseProperty.indexOf("secret") !== -1 ||
    lowerCaseProperty.indexOf("password") !== -1 ||
    lowerCaseProperty.indexOf("key") !== -1 ||
    lowerCaseProperty.indexOf("database") !== -1 ||
    lowerCaseProperty.indexOf("token") !== -1
}

export function obfuscateString(str: string) {
  const env = process.env
  for (const propertyName in env) {
    if (env.hasOwnProperty(propertyName)) {
      const val = env[propertyName]
      if (val && isSecretWord(propertyName) && val.length > 6) {
        // @ts-ignore
        str = qm.stringHelper.replaceAll(str, val, "["+propertyName+" hidden by obfuscateString]")
      }
    }
  }
  return str
}

export function obfuscateSecrets(object: any) {
  if (typeof object !== "object") {
    return object
  }
  object = JSON.parse(JSON.stringify(object)) // Decouple so we don't screw up original object
  for (const propertyName in object) {
    if (object.hasOwnProperty(propertyName)) {
      if (isSecretWord(propertyName)) {
        object[propertyName] = "["+propertyName+" hidden by obfuscateSecrets]"
      } else {
        object[propertyName] = obfuscateSecrets(object[propertyName])
      }
    }
  }
  return object
}

export function prettyJSONStringify(object: any) {
  return JSON.stringify(object, null, "\t")
}

export function logBugsnagLink(suite: string, start: string, end: string) {
  const query = `filters[event.since][0]=` + start +
    `&filters[error.status][0]=open&filters[event.before][0]=` + end +
    `&sort=last_seen`
  console.error(`https://app.bugsnag.com/quantimodo/` + suite + `/errors?` + query)
}

export function getCurrentServerContext(): string {
  const env = JSON.parse(JSON.stringify(process.env))
  if (env["CIRCLE_BRANCH"]) {
    return "circleci"
  }
  if (env["BUDDYBUILD_BRANCH"]) {
    return "buddybuild"
  }
  if (env["HOSTNAME"]) {
    return env["HOSTNAME"]
  }
  if (env["COMPUTERNAME"]) {
    return env["COMPUTERNAME"]
  }
  throw Error("Could not determine current server context")
}

export function throwError(message: string, metaData?: any, maxCharacters?: number) {
  error(message, metaData, maxCharacters)
  throw Error(message)
}

export function slugify(str: string) {
  str = str.replace(/^\s+|\s+$/g, "") // trim
  str = str.toLowerCase()
  // remove accents, swap ñ for n, etc
  const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;"
  const to   = "aaaaeeeeiiiioooouuuunc------"
  for (let i=0, l=from.length; i<l; i++) {
    str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i))
  }
  str = str.replace(".", "-") // replace a dot by a dash
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by a dash
    .replace(/-+/g, "-") // collapse dashes
  return str
}

export function logErrorAndThrowException(message: string, object?: any) {
  error(message, object)
  throw message
}

export function logStartOfProcess(str: string) {
  console.log("STARTING "+str+"\n====================================")
}

export function logEndOfProcess(str: string) {
  console.log("====================================\n"+"DONE WITH "+str)
}
