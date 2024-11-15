import { combineReducers } from "redux"
import { firestoreReducer } from "redux-firestore"

import adminJobsReducer from "./adminJobsReducer"
import adminSparksReducer from "./adminSparksReducer"
import authReducer from "./authReducer"
import emotesReducer from "./emotesReducer"
import firebaseReducer from "./firebaseReducer"
import generalLayoutReducer from "./generalLayoutReducer"
import groupAnalyticsReducer from "./groupAnalyticsReducer"
import groupPlanReducer from "./groupPlanReducer"
import nextLivestreamsReducer from "./nextLivestreamsReducer"
import snackbarReducer from "./snackbarReducer"
import sparksFeedReducer from "./sparksFeedReducer"
import streamAdminReducer from "./streamAdminReducer"
import streamReducer from "./streamReducer"
import { streamingAppReducer } from "./streamingAppReducer"
import talentProfileReducer from "./talentProfileReducer"
import todosReducer from "./todosReducer"
import userDataSetReducer from "./userDataSetReducer"

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
   groupPlan: groupPlanReducer,
   sparksFeed: sparksFeedReducer,
   adminJobs: adminJobsReducer,
   streamingApp: streamingAppReducer,
   talentProfile: talentProfileReducer,
} as const // only way to get type inference on firebaseReducer

export default combineReducers<typeof reducers>(reducers)
