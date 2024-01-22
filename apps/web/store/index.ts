import rootReducer from "./reducers"

import thunk from "redux-thunk"
import { ThunkAction, Action } from "@reduxjs/toolkit"

import { applyMiddleware, compose, createStore } from "redux"
import { getFirebase } from "react-redux-firebase"
import { getFirestore, reduxFirestore } from "redux-firestore"
import { createWrapper } from "next-redux-wrapper"
import firebaseApp from "../data/firebase/FirebaseInstance"

const initialState = {}

const newStore = () => {
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

export const store = newStore()

// Optional: You can define the schema of your Firebase Redux store.
// This will give you type-checking for state.firebase.data.livestreams and state.firebase.ordered.livestreams

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
   ReturnType,
   RootState,
   unknown,
   Action<string>
>

export const wrapper = createWrapper(() => store)
