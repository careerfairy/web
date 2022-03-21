import * as actions from "./actionTypes"
import { EMOTE_MESSAGE_TEXT_TYPE } from "../../components/util/constants"

// Send an emote through the channel reference in the store
export const startPublishingToCdn =
   (rtmpEndoint) => async (dispatch, getState) => {
      const { rtcClient, externalMediaStreams } = getState()

      try {
         dispatch({ type: actions.SET_CDN_PUBLISHING_STARTING })

         const stringMsg = JSON.stringify(message)
         await rtcClient.startLiveStreaming({
            messageType: "TEXT",
            text: stringMsg,
         })
         dispatch({ type: actions.SEND_EMOTE_SUCCESS })
      } catch (e) {
         dispatch({ type: actions.SEND_EMOTE_FAIL, payload: e })
         return e
      }
   }

// set an emote received from the channel socket listener
export const stopPublishingToCdn = (message, memberId) => async (dispatch) => {
   const emoteAction = buildEmoteAction(message, memberId)
   dispatch(emoteAction)
   return emoteAction
}

const buildLiveTranscodingConfig = (externalMediaStreams) => {
   // CDN transcoding configurations.

   return {
      // Width of the video (px). The default value is 640.
      width: 640,
      // Height of the video (px). The default value is 360.
      height: 360,
      // Bitrate of the video (Kbps). The default value is 400.
      videoBitrate: 400,
      // Frame rate of the video (fps). The default value is 15.
      videoFramerate: 15,
      audioSampleRate: AgoraRTC.AUDIO_SAMPLE_RATE_48000,
      audioBitrate: 48,
      audioChannels: 1,
      videoGop: 30,
      // Video codec profile. Choose to set as Baseline (66), Main (77), or High (100). If you set this parameter to other values, Agora adjusts it to the default value of 100.
      videoCodecProfile: AgoraRTC.VIDEO_CODEC_PROFILE_HIGH,
      userCount: 1,
      userConfigExtraInfo: {},
      backgroundColor: 0x000000,
      // Add an online PNG watermark image to the video. You can add more than one watermark image at the same time.
      watermark: {
         url: "http://www.com/watermark.png",
         x: 0,
         y: 0,
         width: 160,
         height: 160,
      },
      // Set the layout for each user.
      transcodingUsers: [
         {
            x: 0,
            y: 0,
            width: 640,
            height: 360,
            zOrder: 0,
            alpha: 1.0,
            // The uid must be identical to the uid used in AgoraRTCClient.join.
            uid: 1232,
         },
      ],
   }
}
