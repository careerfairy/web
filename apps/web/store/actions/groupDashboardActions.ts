import * as actions from "./actionTypes"
import { Dispatch } from "redux"

// Toggle the open state of the streamer breakoutModal
export const setGroupDashboardDrawer =
   (open: boolean) => (dispatch: Dispatch) => {
      dispatch({ type: actions.SET_GROUP_ADMIN_DRAWER, payload: open })
   }
