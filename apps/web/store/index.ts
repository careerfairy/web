import {
   FirebaseReducer,
   FirestoreReducer,
   getFirebase,
} from "react-redux-firebase"
import { applyMiddleware, compose, createStore } from "redux"
import { getFirestore, reduxFirestore } from "redux-firestore"

import { HandRaise } from "types/handraise"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { createWrapper } from "next-redux-wrapper"
import firebaseApp from "../data/firebase/FirebaseInstance"
import rootReducer from "./reducers"
import thunk from "redux-thunk"

const initialState = {}

export const newStore = () => {
   let composeEnhancers = compose
   const isServer = typeof window === "undefined"
   //Check if function running on the sever or client
   if (!isServer) {
      //Setup Redux Debugger
      // @ts-ignore
      composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
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
   )
}

// Optional: You can define the schema of your Firebase Redux store.
// This will give you type-checking for state.firebase.data.livestreams and state.firebase.ordered.livestreams
interface Schema {
   livestreams: LivestreamEvent
   handRaises: HandRaise
}

interface ExtendedFirestore {
   firebase: FirebaseReducer.Reducer<{}, Schema>
   firestore: FirestoreReducer.Reducer
}

export type RootState = ReturnType<typeof rootReducer>

export const wrapper = createWrapper(
   newStore
   // ,{ debug: true }
)
