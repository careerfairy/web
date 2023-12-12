import { RtcRole, RtcTokenBuilder } from "agora-access-token"
import axios, { Method } from "axios"
import { MAX_RECORDING_HOURS } from "@careerfairy/shared-lib/livestreams/recordings"
import { isLocalEnvironment } from "../util"

// Project: Production
let appID = process.env.AGORA_APP_ID
let appCertificate = process.env.AGORA_APP_CERTIFICATE
let customerKey = process.env.AGORA_CUSTOMER_KEY
let customerSecret = process.env.AGORA_CUSTOMER_SECRET

if (isLocalEnvironment()) {
   // Project: CareerFairyStreaming
   console.log("Using AgoraSDK testing environment")
}

export const agoraCredentials = {
   appID,
   appCertificate,
   customerKey,
   customerSecret,
}

const staticUID = "1234232"

// AWS Storage
export const awsSecretKey = process.env.AWS_SECRET_KEY
export const awsAccessKey = process.env.AWS_ACCESS_KEY

export default class AgoraClient {
   private readonly authorizationHeader

   constructor() {
      const plainCredentials = `${customerKey}:${customerSecret}`
      const base64Credentials = Buffer.from(plainCredentials).toString("base64")

      this.authorizationHeader = `Basic ${base64Credentials}`
   }

   /**
    * Acquire a Resource ID
    * Each resource ID can only be used for one recording session
    *
    * The resource ID is valid for five minutes, so you need to start
    * recording with this resource ID with it before it expires.
    *
    * [link to docs](https://docs.agora.io/en/cloud-recording/cloud_recording_api_acquire?platform=RESTful)
    * @param cname
    */
   recordingAcquire(cname: string) {
      return this.authRequest(
         `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
         {
            cname: cname,
            uid: staticUID,
            clientRequest: {
               resourceExpiredHour: 24,
               scene: 1,
            },
         }
      )
   }

   /**
    * Start a recording
    * [link to docs](https://docs.agora.io/en/cloud-recording/cloud_recording_api_start?platform=RESTful)
    *
    * @param cname
    * @param resourceId
    * @param rtcToken
    * @param urlToRecord
    * @param bucketStoragePath
    * @param videoWidth
    * @param videoHeight
    * @param maxRecordingHour
    */
   recordingStart(
      cname: string,
      resourceId: string,
      rtcToken: string,
      urlToRecord: string,
      bucketStoragePath: string[],
      videoWidth = 1920,
      videoHeight = 1080,
      maxRecordingHour = MAX_RECORDING_HOURS
   ) {
      return this.authRequest(
         `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resourceId}/mode/web/start`,
         {
            cname: cname,
            uid: staticUID,
            clientRequest: {
               token: rtcToken,
               extensionServiceConfig: {
                  errorHandlePolicy: "error_abort",
                  extensionServices: [
                     {
                        serviceName: "web_recorder_service",
                        errorHandlePolicy: "error_abort",
                        serviceParam: {
                           url: urlToRecord,
                           audioProfile: 1,
                           maxVideoDuration: 240, // split files by 4 hours
                           videoWidth,
                           videoHeight,
                           maxRecordingHour,
                        },
                     },
                  ],
               },
               recordingFileConfig: {
                  avFileType: ["hls", "mp4"],
               },
               storageConfig: {
                  vendor: 1, // AWS S3
                  region: 7, // EU_CENTRAL_1.
                  bucket: "agora-cf-cloud-recordings",
                  accessKey: awsAccessKey,
                  secretKey: awsSecretKey,
                  fileNamePrefix: bucketStoragePath,
               },
            },
         }
      )
   }

   recordingStop(cname: string, resourceId: string, sid: string) {
      return this.authRequest(
         `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/web/stop`,
         {
            cname: cname,
            uid: staticUID,
            clientRequest: {},
         }
      )
   }

   private authRequest(url: string, data?: any, method: Method = "post") {
      return axios({
         method,
         url,
         data,
         headers: {
            Authorization: this.authorizationHeader,
            "Content-Type": "application/json;charset=utf-8",
         },
      })
   }

   static createRTCToken(channelName: string, expirationTimeSeconds = 21600) {
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const privilegeExpiredTs = currentTimestamp + expirationTimeSeconds
      return RtcTokenBuilder.buildTokenWithUid(
         appID,
         appCertificate,
         channelName,
         staticUID as any,
         RtcRole.SUBSCRIBER,
         privilegeExpiredTs
      )
   }
}
