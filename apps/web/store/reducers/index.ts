import { combineReducers } from "redux"
import { firestoreReducer } from "redux-firestore"

import adminSparksReducer from "./adminSparksReducer"
import sparksFeedReducer from "./sparksFeedReducer"
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
import firebaseReducer from "./firebaseReducer"

const reducers = {
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
   adminSparks: adminSparksReducer,
   sparksFeed: sparksFeedReducer,
} as const // only way to get type inference on firebaseReducer

export default combineReducers<typeof reducers>(reducers)
