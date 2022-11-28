import Octokit from "@octokit/rest"
// @ts-ignore
import * as git from "simple-git"
import _str from "underscore.string"
import {envNames, getenv, getGithubAccessToken, loadEnv} from "./env-helper"
import * as qmLog from "./qm.log"
import * as qmShell from "./qm.shell"
import {getBuildLink} from "./test-helpers"
// tslint:disable-next-line:no-var-requires
const qm = require("../src/js/qmHelpers.js")
export function getOctoKit() {
    return new Octokit({auth: getGithubAccessToken()})
}
export function getCurrentGitCommitSha() {
    if (process.env.GIT_COMMIT_FOR_STATUS) {
        return process.env.GIT_COMMIT_FOR_STATUS
    }
    if (process.env.SOURCE_VERSION) {
        return process.env.SOURCE_VERSION
    }
    if (process.env.GIT_COMMIT) {
        return process.env.GIT_COMMIT
    }
    if (process.env.CIRCLE_SHA1) {
        return process.env.CIRCLE_SHA1
    }
    if (process.env.SHA) {
        return process.env.SHA
    }
    try {
        return require("child_process").execSync("git rev-parse HEAD").toString().trim()
    } catch (error) {
        console.info(error)
    }
}

export function getRepoUrl() {
    if (process.env.REPOSITORY_URL_FOR_STATUS) {
        return process.env.REPOSITORY_URL_FOR_STATUS
    }
    if (process.env.GIT_URL) {
        return process.env.GIT_URL
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
    if (process.env.REPO_NAME_FOR_STATUS) {
        return process.env.REPO_NAME_FOR_STATUS
    }
    if (process.env.CIRCLE_PROJECT_REPONAME) {
        return process.env.CIRCLE_PROJECT_REPONAME
    }
    const arr = getRepoParts()
    if (arr) {
        return arr[1]
    }
    throw new Error("Could not determine repo name!")
}
export function getRepoUserName() {
    if (process.env.REPO_USERNAME_FOR_STATUS) {
        return process.env.REPO_USERNAME_FOR_STATUS
    }
    if (process.env.CIRCLE_PROJECT_USERNAME) {
        return process.env.CIRCLE_PROJECT_USERNAME
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
        url = "No url from getBuildLink()"
        const message = "No build link or target url for status!"
        if(!qm.env.isLocal()) {
            console.error(message)
        }
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
    getOctoKit().repos.createStatus(params).then((data: any) => {
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
    const name = process.env.CIRCLE_BRANCH || process.env.BUDDYBUILD_BRANCH || process.env.TRAVIS_BRANCH || process.env.GIT_BRANCH
    if (!name) {
        return"Branch name not set!"
    }
    return name
}
export function createFeatureBranch(featureName: string) {
    const branchName = "feature/" + featureName
    try {
        qmShell.executeSynchronously(`git checkout -b ${branchName} develop`, false)
    } catch (e) {
        qmLog.error(e)
        return
    }
}
