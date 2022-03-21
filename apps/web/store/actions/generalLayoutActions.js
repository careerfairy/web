import * as actions from "./actionTypes"

// Toggle the open state of the streamer breakoutModal
export const openNavDrawer = () => async (dispatch) => {
   dispatch({ type: actions.OPEN_NAV_DRAWER })
}

// Toggle the open state of the streamer breakoutModal
export const closeNavDrawer = () => async (dispatch) => {
   dispatch({ type: actions.CLOSE_NAV_DRAWER })
}

// Toggle the open state of the streamer breakoutModal
export const toggleNavDrawer = () => async (dispatch) => {
   dispatch({ type: actions.TOGGLE_NAV_DRAWER })
}
