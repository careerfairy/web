import RootState from "../reducers"
import { RTCConnectionState } from "../../types/streaming"

export const rtcConnectionStateSelector = (
   state: RootState
): RTCConnectionState => state.stream.agoraState.rtcConnectionState

export const showActionButtonsSelector = (state: RootState) =>
   state.stream.layout.showActionButtons

export const streamingSelector = (state: RootState) => state.stream.streaming
