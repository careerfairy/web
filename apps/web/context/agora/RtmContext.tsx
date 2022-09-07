import { createContext } from "react"
import { RtmChannel, RtmClient, RtmEvents } from "agora-rtm-sdk"

export type RTMTextMessageType = "CONTROL" | "NORMAL" | "EMOTE" | "TRANSCRIBE"

export type EmoteType = "clapping" | "like" | "heart"

export type ControlMessageType =
   | "muteAudio"
   | "muteVideo"
   | "muteSingleVideo"
   | "muteSingleAudio"
   | "kickUser"
   | "cloudRecordingActive"
   | "cloudRecordingInactive"

export interface EmoteMessage {
   textType: RTMTextMessageType
   emoteType: EmoteType
   timestamp: number
   memberId: string
}
/**
 * Callbacks to pass to RTM events
 */
export type rtmCallbacks = {
   channel?: Partial<RtmEvents.RtmChannelEvents>
   client?: Partial<RtmEvents.RtmClientEvents>
}
// export interface messageStoreInterface {
//    ts: string;
//    uid: string;
//    msg: string;
// }

export interface AgoraRTMContextInterface {
   // messageStore: messageStoreInterface | any;
   // privateMessageStore: any;
   // sendMessageToUid: (msg: string, uid: number) => void;
   // sendControlMessage: (msg: string) => void;
   // sendControlMessageToUid: (msg: string, uid: number) => void;
   // sendMessage: (msg: string) => void;
   createEmote: (msg: string) => void
   rtmClient: RtmClient
   rtmChannel: RtmChannel
   agoraHandlers: {
      getChannelMemberCount: (channelIds: string[]) => Promise<any>
      handleDisconnect: () => Promise<any>
      joinChannel: (
         targetRoomId: string,
         handleMemberJoined: (joinerId: string) => Promise<any>,
         handleMemberLeft: (leaverId: string) => Promise<any>,
         updateMemberCount: (
            roomId: string,
            newMemberCount: number
         ) => Promise<any>
      ) => Promise<any>
      getChannelMembers: (channel: RtmChannel) => Promise<any>
      leaveChannel: (channel: RtmChannel) => Promise<any>
   }
   // localUid: string;
   // userList: any;
   // peersRTM: Array<string>;
}

const RtmContext = createContext(null as unknown as AgoraRTMContextInterface)

export default RtmContext
