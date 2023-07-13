import { RootState } from "../"
import { RTCConnectionState } from "../../types/streaming"

export const rtcConnectionStateSelector = (
   state: RootState
): RTCConnectionState => state.stream.agoraState.rtcConnectionState

export const showActionButtonsSelector = (state: RootState) =>
   state.stream.layout.showActionButtons

export const streamingSelector = (state: RootState) => state.stream.streaming

export const leftMenuOpenSelector = (state: RootState) =>
   state.stream.layout.leftMenuOpen

export const focusModeEnabledSelector = (state: RootState) =>
   state.stream.layout.focusModeEnabled

export const sessionIsUsingCloudProxySelector = (state: RootState) =>
   state.stream.agoraState.sessionIsUsingCloudProxy

export const sessionRTMFailedToJoin = (state: RootState) =>
   state.stream.agoraState.sessionRTMFailedToJoin

export const streamerBreakoutRoomModalOpen = (state: RootState) =>
   state.stream.layout.streamerBreakoutRoomModalOpen

export const videoOptionsSelector = (state: RootState) =>
   state.stream.videoOptions

export const emotesSelector = (state: RootState) => state.emotes.emotesData
