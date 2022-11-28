// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
import AWS from "aws-sdk"
import * as fs from "fs"
import * as https from "https"
import * as mime from "mime"
import * as path from "path"
import * as Q from "q"
import rimraf from "rimraf"
import {envNames, getEnvOrException} from "./env-helper"
import * as qmLog from "./qm.log"
const defaultS3Bucket = "qmimages"
// tslint:disable-next-line:no-var-requires
const appRoot = require("app-root-path")
export function assertDoesNotExist(relative: string) {
    const abs = getAbsolutePath(relative)
    if (fs.existsSync(abs)) {
        throw Error(abs + " exists!")
    }
}

export function assertExists(relative: string) {
    const abs = getAbsolutePath(relative)
    if (!fs.existsSync(abs)) {
        throw Error(abs + " does not exist!")
    }
}

// require untyped library file
// tslint:disable-next-line:no-var-requires
const qm = require("../src/js/qmHelpers.js")

export function exists(filename: string) {
    const filepath = getAbsolutePath(filename)
    return fs.existsSync(filepath)
}

export function createFile(filePath: string, contents: any) {
    return writeToFile(filePath, contents)
}

export function deleteFile(filename: string) {
    const deferred = Q.defer()
    const filepath = getAbsolutePath(filename)
    rimraf(filepath, function() {
        qmLog.info(filepath + "\n\tdeleted!")
        deferred.resolve()
    })
    return deferred.promise
}

export function getS3Client() {
    const s3Options = {
        accessKeyId: getEnvOrException([envNames.QM_AWS_ACCESS_KEY_ID, envNames.AWS_ACCESS_KEY_ID]),
        secretAccessKey: getEnvOrException([envNames.QM_AWS_SECRET_ACCESS_KEY, envNames.AWS_SECRET_ACCESS_KEY]),
    }
    return new AWS.S3(s3Options)
}

export function downloadFromS3(filePath: string, key: string, bucketName = defaultS3Bucket) {
    const s3 = getS3Client()
    const deferred = Q.defer()
    s3.getObject({
        Bucket: bucketName,
        Key: key,
    }, (err, data) => {
        if (err) {
            if (err.name === "NoSuchKey") {
                console.warn(key + " not found in bucket: " + bucketName)
                deferred.resolve(null)
                return
            }
            throw err
        }
        if (data && data.Body) {
            fs.writeFileSync(filePath, data.Body.toString())
            console.log(`${filePath} has been created!`)
            deferred.resolve(filePath)
        } else {
            throw Error(key + " not found in bucket: " + bucketName)
        }
    })
    return deferred.promise
}

export function uploadToS3InSubFolderWithCurrentDateTime(relative: string,
                                                         s3BasePath: string,
                                                         s3Bucket = defaultS3Bucket,
                                                         accessControlLevel = "public-read",
                                                         ContentType?: string | undefined) {
    const at = new Date()
    const dateTime = at.toISOString()
    return uploadToS3(relative, s3BasePath + "/" + dateTime+"/"+relative, s3Bucket, accessControlLevel, ContentType)
}

export function uploadToS3(
    filePath: string,
    s3Key: string,
    s3Bucket = defaultS3Bucket,
    accessControlLevel = "public-read",
    ContentType?: string | undefined | null,
) {
    const deferred = Q.defer()
    const s3 = getS3Client()
    const abs = getAbsolutePath(filePath)
    assertExists(abs)
    const fileContent = fs.readFileSync(abs)
    const params = {
        ACL: accessControlLevel,
        Body: fileContent,
        Bucket: s3Bucket,
        Key: s3Key,
    }
    if(!ContentType) {
        try {
            ContentType = mime.getType(s3Key)
        } catch (e) {
            qmLog.error(e)
        }
    }
    if (ContentType) {
        // @ts-ignore
        params.ContentType = ContentType
    }
    qmLog.info("\n\tuploading to s3: "+ s3Key)
    s3.upload(params, (err: any, SendData: any) => {
        if (err) {
            qmLog.error(s3Key + "\n\t FAILED to uploaded")
            deferred.reject(err)
        } else {
            qmLog.info(s3Key + "\n\tuploaded to\t\n"+ SendData.Location)
            deferred.resolve(SendData.Location)
        }
    })
    return deferred.promise
}

export function writeToFile(filePath: string, contents: any) {
    const deferred = Q.defer()
    function ensureDirectoryExistence(filePathToCheck: string) {
        const dirname = path.dirname(filePathToCheck)
        if (fs.existsSync(dirname)) {
            return true
        }
        ensureDirectoryExistence(dirname)
        fs.mkdirSync(dirname)
    }

    // tslint:disable-next-line:prefer-const
    let absolutePath = getAbsolutePath(filePath)
    ensureDirectoryExistence(absolutePath)
    qmLog.info("Writing to " + absolutePath)
    fs.writeFile(absolutePath, contents, (err) => {
        if (err) {
            deferred.reject(err)
        }
        // tslint:disable-next-line:no-console
        qmLog.info(absolutePath + " saved!")
        deferred.resolve(absolutePath)
    })
    return deferred.promise
}

export function getAbsolutePath(relativePath: string) {
    if (path.isAbsolute(relativePath)) {
        return relativePath
    } else {
        return path.resolve(appRoot.path, relativePath)
    }
}

export function download(url: string, relative: string) {
    const deferred = Q.defer()
    const absolutePath = getAbsolutePath(relative)
    const file = fs.createWriteStream(absolutePath)
    qmLog.info("Downloading " + url + " to " + absolutePath + "...")
    https.get(url, function(response) {
        response.pipe(file)
        file.on("finish", function() {
            file.on("close", function() {
                deferred.resolve(absolutePath)
            })
            file.close()
        })
    })
    return deferred.promise
}

export async function uploadFolderToS3(
    dir: string,
    s3BasePath: string,
    s3Bucket = defaultS3Bucket,
    accessControlLevel = "public-read",
    ContentType?: string | undefined,
) {
    const files = await listFilesRecursively(dir)
    qmLog.info("Uploading " + files.length + " files to " + s3Bucket + "/" + s3BasePath + "...")
    const urls = []
    // @ts-ignore
    for (const file of files) {
        const dirWithForwardSlashes = qm.stringHelper.replaceBackSlashes(dir, "/")
        const fileWithForwardSlashes = qm.stringHelper.replaceBackSlashes(file, "/")
        const relativePath = fileWithForwardSlashes.replace(dirWithForwardSlashes, "")
        let s3Key = s3BasePath + relativePath
        s3Key = s3Key.replace("\\", "/")
        urls.push(await uploadToS3(file, s3Key, s3Bucket, ContentType))
    }
    return urls
}

export async function listFilesRecursively(dirPath: string, arrayOfFiles?: string[]): Promise<string[]> {
    const fileNames = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    for (const fileName of fileNames) {
        const dirOrFile = path.join(dirPath, fileName)
        if (fs.statSync(dirOrFile).isDirectory()) {
            arrayOfFiles = await listFilesRecursively(dirOrFile, arrayOfFiles)
        } else {
            const filePath = path.join(dirPath, fileName)
            arrayOfFiles.push(filePath)
        }
    }
    return arrayOfFiles
}
