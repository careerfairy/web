import rootReducer from "./reducers";

import thunk from "redux-thunk";
import { applyMiddleware, compose, createStore } from "redux";
import { getFirebase } from "react-redux-firebase";
import { getFirestore, reduxFirestore } from "redux-firestore";
import { createWrapper } from "next-redux-wrapper";
import firebaseApp from "../data/firebase/FirebaseInstance";

const initialState = {};

export const newStore = () => {
   let composeEnhancers = compose;
   const isServer = typeof window === "undefined";
   //Check if function running on the sever or client
   if (!isServer) {
      //Setup Redux Debugger
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
   }

   return createStore(
      rootReducer,
      initialState,
      composeEnhancers(
         applyMiddleware(
            thunk.withExtraArgument({ getFirebase, getFirestore })
         ),
         reduxFirestore(firebaseApp)
      )
   );
};

export const wrapper = createWrapper(
   newStore
   // ,{ debug: true }
);
