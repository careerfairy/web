import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from 'redux-firestore';

import authReducer from './authReducer';
import todosReducer from './todosReducer';
import rtmChannelReducer from "./rtmChannelReducer";
import emotesReducer from "./emotesReducer";
import snackbarReducer from "./snackbarReducer";
import userDataSetReducer from "./userDataSetReducer";

export default combineReducers({
    auth: authReducer,
    todos: todosReducer,
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    rtmChannel: rtmChannelReducer,
    emotes: emotesReducer,
    snackbars: snackbarReducer,
    userDataSet: userDataSetReducer,
});