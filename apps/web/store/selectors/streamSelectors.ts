import RootState from "../reducers"

export const rtcConnectionStateSelector = (state: RootState) =>
   state.stream.agoraState.rtcConnectionState
