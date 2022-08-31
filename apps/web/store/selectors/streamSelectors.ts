import RootState from "../reducers"

export const rtcConnectionStateSelector = (state: RootState) =>
   state.stream.agoraState.rtcConnectionState

export const leftMenuOpenSelector = (state: RootState) =>
   state.stream.layout.leftMenuOpen

export const focusModeEnabledSelector = (state: RootState) =>
   state.stream.layout.focusModeEnabled
