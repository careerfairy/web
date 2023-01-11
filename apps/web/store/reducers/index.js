import { combineReducers } from "redux"
import { firebaseReducer } from "react-redux-firebase"
import { firestoreReducer } from "redux-firestore"

import authReducer from "./authReducer"
import todosReducer from "./todosReducer"
import emotesReducer from "./emotesReducer"
import snackbarReducer from "./snackbarReducer"
import userDataSetReducer from "./userDataSetReducer"
import nextLivestreamsReducer from "./nextLivestreamsReducer"
import streamReducer from "./streamReducer"
import generalLayoutReducer from "./generalLayoutReducer"
import groupAnalyticsReducer from "./groupAnalyticsReducer"
import streamAdminReducer from "./streamAdminReducer"

export default combineReducers({
   auth: authReducer,
   todos: todosReducer,
   firebase: firebaseReducer,
   firestore: firestoreReducer,
   emotes: emotesReducer,
   snackbars: snackbarReducer,
   userDataSet: userDataSetReducer,
   nextLivestreams: nextLivestreamsReducer,
   generalLayout: generalLayoutReducer,
   analyticsReducer: groupAnalyticsReducer,
   stream: streamReducer,
   streamAdmin: streamAdminReducer,
})
