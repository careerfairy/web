import { Reducer } from "redux"
import {
   ENQUEUE_SNACKBAR,
   CLOSE_SNACKBAR,
   REMOVE_SNACKBAR,
} from "../actions/actionTypes"

interface ISnackbarState {
   notifications: {
      key: string
      message: string
      options: any
      dismissed: boolean
   }[]
}

const defaultState: ISnackbarState = {
   notifications: [],
}

const snackbarReducer: Reducer<ISnackbarState> = (
   state = defaultState,
   action
) => {
   switch (action.type) {
      case ENQUEUE_SNACKBAR:
         return {
            ...state,
            notifications: [
               ...state.notifications,
               {
                  key: action.key,
                  ...action.notification,
               },
            ],
         }

      case CLOSE_SNACKBAR:
         return {
            ...state,
            notifications: state.notifications.map((notification) =>
               action.dismissAll || notification.key === action.key
                  ? { ...notification, dismissed: true }
                  : { ...notification }
            ),
         }

      case REMOVE_SNACKBAR:
         return {
            ...state,
            notifications: state.notifications.filter(
               (notification) => notification.key !== action.key
            ),
         }

      default:
         return state
   }
}

export default snackbarReducer
