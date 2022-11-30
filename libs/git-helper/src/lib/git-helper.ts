import { Octokit } from "@octokit/rest"
// @ts-ignore
import * as git from "simple-git"
import * as _str from "underscore.string"
import * as envHelper from "@curedao/env-helper"
import * as qmLog from "@curedao/qm-log"
// tslint:disable-next-line:no-var-requires
export function getOctoKit() {
  return new Octokit({auth: envHelper.getGithubAccessToken()})
}
export function getCurrentGitCommitSha() {
  const val =  envHelper.getenv([
    "GIT_COMMIT_FOR_STATUS",
    "SOURCE_VERSION",
    "GIT_COMMIT",
    "CIRCLE_SHA1",
    "SHA",
                                ], null)
  if (val) {
    return val
  }
  try {
    return require("child_process").execSync("git rev-parse HEAD").toString().trim()
  } catch (error) {
    console.info(error)
  }
}

export function getRepoUrl() {
  const val =  envHelper.getenv([
                                  "REPOSITORY_URL_FOR_STATUS",
                                  "GIT_URL",
                                ], null)
  if (val) {
    return val
  }
  return "https://github.com/curedao/curedao-web-android-chrome-ios-app-template.git"
}
export function getRepoParts() {
  let gitUrl = getRepoUrl()
  gitUrl = _str.strRight(gitUrl, "github.com/")
  gitUrl = gitUrl.replace(".git", "")
  const parts = gitUrl.split("/")
  if (!parts || parts.length > 2) {
    throw new Error("Could not parse repo name!")
  }
  return parts
}
export function getRepoName() {
  const val =  envHelper.getenv([
                                  "REPO_NAME_FOR_STATUS",
                                  "CIRCLE_PROJECT_REPONAME",
                                ], null)
  if (val) {
    return val
  }
  const arr = getRepoParts()
  if (arr) {
    return arr[1]
  }
  throw new Error("Could not determine repo name!")
}
export function getRepoUserName() {
  const val =  envHelper.getenv([
                                  "REPO_USERNAME_FOR_STATUS",
                                  "CIRCLE_PROJECT_USERNAME",
                                ], null)
  if (val) {
    return val
  }
  const arr = getRepoParts()
  if (arr) {
    return arr[0]
  }
  try {
    return require("child_process").execSync("git rev-parse HEAD").toString().trim()
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.info(error)
  }
}

export const githubStatusStates = {
  error: "error",
  failure: "failure",
  pending: "pending",
  success: "success",
}

/**
 * state can be one of `error`, `failure`, `pending`, or `success`.
 */
// tslint:disable-next-line:max-line-length
export function setGithubStatus(testState: "error" | "failure" | "pending" | "success", context: string,
                                description: string, url?: string | null, cb?: ((arg0: any) => void) | undefined) {
  if(testState === "pending") {qmLog.logStartOfProcess(context)}
  const message1 = "Setting status on Github: "+ testState +
    "\n\tdescription: "+ description +
    "\n\tcontext: " + context
  if (testState === "error") {
    qmLog.error(message1)
  } else {
    qmLog.info(message1)
  }
  description = _str.truncate(description, 135)
  url = url || getBuildLink()
  if(!url) {
    const message = "No build link or target url for status!"
    console.error(message)
    if (cb) {cb(message)}
    return
  }
  // @ts-ignore
  const params: Octokit.ReposCreateStatusParams = {
    context,
    description,
    owner: getRepoUserName(),
    repo: getRepoName(),
    sha: getCurrentGitCommitSha(),
    state: testState,
    target_url: url,
  }
  console.log(`${context} - ${description} - ${testState} at ${url}`)
  if(testState !== "pending") {qmLog.logEndOfProcess(context)}
  getOctoKit().repos.createCommitStatus(params).then((data: any) => {
    if (cb) {
      cb(data)
    }
  }).catch((err: any) => {
    qmLog.error(err)
    if (cb) {
      cb(err)
    }
    // Don't fail when we trigger abuse detection mechanism
    // process.exit(1)
    // throw err
  })
}
// tslint:disable-next-line:max-line-length
export function createCommitComment(context: string, body: string, cb?: ((arg0: any) => void) | undefined) {
  body += "\n### "+context+"\n"
  body += "\n[BUILD LOG]("+getBuildLink()+")\n"
  // @ts-ignore
  const params: Octokit.ReposCreateCommitCommentParams = {
    body,
    commit_sha: getCurrentGitCommitSha(),
    owner: getRepoUserName(),
    repo: getRepoName(),
  }
  console.log(body)
  getOctoKit().repos.createCommitComment(params).then((data: any) => {
    if (cb) {
      cb(data)
    }
  }).catch((err: any) => {
    console.error(err)
    // Don't fail when we trigger abuse detection mechanism
    // process.exit(1)
    // throw err
  })
}
export function getBranchName() {
  // tslint:disable-next-line:max-line-length
  const val =  envHelper.getenv([
                                  "CIRCLE_BRANCH",
                                  "BUDDYBUILD_BRANCH",
                                  "TRAVIS_BRANCH",
                                  "GIT_BRANCH",
                                ], null)
  if (val) {
    return val
  }
  return "Branch name not set!"
}
export function executeSynchronously(cmd: string , catchExceptions: boolean) {
  const execSync = require("child_process").execSync
  console.info(cmd)
  try {
    const res = execSync(cmd)
    qmLog.info(res)
  } catch (error) {
    if (catchExceptions) {
      console.error(error)
    } else {
      throw error
    }
  }
}
export function createFeatureBranch(featureName: string) {
  const branchName = "feature/" + featureName
  try {
    executeSynchronously(`git checkout -b ${branchName} develop`, false)
  } catch (e) {
    qmLog.error(e)
    return
  }
}
export function getBuildLink() {
  const val =  envHelper.getenv([
                                  "BUILD_URL_FOR_STATUS",
                                  "BUILD_URL",
                                ], null)
  if (val) {
    return val
  }
  if (process.env["CIRCLE_BUILD_NUM"]) {
    return "https://circleci.com/gh/curedao/curedao-web-android-chrome-ios-app-template/" +
      process.env["CIRCLE_BUILD_NUM"]
  }
  if (process.env["TRAVIS_BUILD_ID"]) {
    return "https://travis-ci.org/" + process.env["TRAVIS_REPO_SLUG"] + "/builds/" + process.env["TRAVIS_BUILD_ID"]
  }
  throw Error("Could not determine build link!")
}
