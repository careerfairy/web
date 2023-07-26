import { Reducer } from "redux"
import * as actions from "../actions/actionTypes"

interface IStreamAdminState {
   recording: {
      recordingRequestOngoing: boolean
   }
}

const initialState: IStreamAdminState = {
   recording: {
      recordingRequestOngoing: false,
   },
}

const streamAdminReducer: Reducer<IStreamAdminState> = (
   state = initialState,
   { type, payload }
) => {
   switch (type) {
      case actions.SET_RECORDING_REQUEST_STARTED:
         return {
            ...state,
            recording: { ...state.recording, recordingRequestOngoing: true },
         }
      case actions.SET_RECORDING_REQUEST_STOPPED:
         return {
            ...state,
            recording: { ...state.recording, recordingRequestOngoing: false },
         }
      default:
         return state
   }
}

export default streamAdminReducer
