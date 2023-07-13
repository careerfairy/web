import { firebaseReducer } from "react-redux-firebase"
import { combineReducers } from "redux"
import { firestoreReducer } from "redux-firestore"

import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { HandRaise } from "types/handraise"
import adminSparksReducer from "./adminSparksReducer"
import authReducer from "./authReducer"
import emotesReducer from "./emotesReducer"
import generalLayoutReducer from "./generalLayoutReducer"
import groupAnalyticsReducer from "./groupAnalyticsReducer"
import nextLivestreamsReducer from "./nextLivestreamsReducer"
import snackbarReducer from "./snackbarReducer"
import streamAdminReducer from "./streamAdminReducer"
import streamReducer from "./streamReducer"
import todosReducer from "./todosReducer"
import userDataSetReducer from "./userDataSetReducer"

interface Profile {}
// Optional: You can define the schema of your Firebase Redux store.
// This will give you type-checking for state.firebase.data.livestreams and state.firebase.ordered.livestreams
interface Schema {
   livestreams: LivestreamEvent
   handRaises: HandRaise
}

export default combineReducers({
   auth: authReducer,
   todos: todosReducer,
   firebase: firebaseReducer<Profile, Schema>,
   firestore: firestoreReducer,
   emotes: emotesReducer,
   snackbars: snackbarReducer,
   userDataSet: userDataSetReducer,
   nextLivestreams: nextLivestreamsReducer,
   generalLayout: generalLayoutReducer,
   analyticsReducer: groupAnalyticsReducer,
   stream: streamReducer,
   streamAdmin: streamAdminReducer,
   adminSparks: adminSparksReducer,
})
