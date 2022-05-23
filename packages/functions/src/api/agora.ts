import { RtcRole, RtcTokenBuilder } from "agora-access-token"
import axios, { Method } from "axios"

export const appID = "53675bc6d3884026a72ecb1de3d19eb1"
export const appCertificate = "286a21681469490783ab75247de35f37"
export const customerKey = "fd45e86c6ffe445ebb87571344e945b1"
export const customerSecret = "3e56ecf0a5ef4eaaa5d26cf8543952d0"

const staticUID = 1234232

// AWS Storage
export const awsSecretKey = "tenlla/MPorZigMkl+wa7OGoxe63MuVYn7lgwrhW"
export const awsAccessKey = "AKIAIUSA7ZDE4TYSY3RA"

export default class AgoraClient {
   private readonly authorizationHeader

   constructor() {
      const plainCredentials = `${customerKey}:${customerSecret}`
      const base64Credentials = Buffer.from(plainCredentials).toString("base64")

      this.authorizationHeader = `Basic ${base64Credentials}`
   }

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

   recordingStart(
      cname: string,
      resourceId: string,
      rtcToken: string,
      urlToRecord: string,
      videoWidth = 1280,
      videoHeight = 720,
      maxRecordingHour = 72
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
                           audioProfile: 0,
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
                  vendor: 1,
                  region: 7,
                  bucket: "agora-cf-cloud-recordings",
                  accessKey: awsAccessKey,
                  secretKey: awsSecretKey,
                  fileNamePrefix: ["directory1", "directory5"],
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
            "Content-Type": "application/json",
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
         staticUID,
         RtcRole.SUBSCRIBER,
         privilegeExpiredTs
      )
   }
}
