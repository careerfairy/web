import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';

import authReducer from './authReducer';
import todosReducer from './todosReducer';
import rtcClientReducer from './rtcClientReducer';
import rtmChannelReducer from "./rtmChannelReducer";
import externalTracksReducer from './externalTracksReducer';
import emotesReducer from "./emotesReducer";
import snackbarReducer from "./snackbarReducer";
import userDataSetReducer from "./userDataSetReducer";
import currentFilterGroupReducer from "./currentFilterGroupReducer";
import nextLivestreamsReducer from "./nextLivestreamsReducer";

export default combineReducers({
    auth: authReducer,
    todos: todosReducer,
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    rtcClient: rtcClientReducer,
    rtmChannel: rtmChannelReducer,
    externalMediaStreams: externalTracksReducer,
    emotes: emotesReducer,
    snackbars: snackbarReducer,
    userDataSet: userDataSetReducer,
    currentFilterGroup: currentFilterGroupReducer,
    nextLivestreams: nextLivestreamsReducer
});