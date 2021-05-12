import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';

import authReducer from './authReducer';
import todosReducer from './todosReducer';
import rtmChannelReducer from "./rtmChannelReducer";
import rtmClientReducer from "./rtmClientReducer";
import emotesReducer from "./emotesReducer";
import snackbarReducer from "./snackbarReducer";
import userDataSetReducer from "./userDataSetReducer";
import currentFilterGroupReducer from "./currentFilterGroupReducer";
import nextLivestreamsReducer from "./nextLivestreamsReducer";
import rtcClientReducer from "./rtcClientReducer";

export default combineReducers({
    auth: authReducer,
    todos: todosReducer,
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    rtmChannel: rtmChannelReducer,
    rtcClient: rtcClientReducer,
    rtmClient: rtmClientReducer,
    emotes: emotesReducer,
    snackbars: snackbarReducer,
    userDataSet: userDataSetReducer,
    currentFilterGroup: currentFilterGroupReducer,
    nextLivestreams: nextLivestreamsReducer
});