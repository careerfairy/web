import * as actions from "./actionTypes"
import { firebaseServiceInstance } from "../../data/firebase/FirebaseService"

// Sign up action creator
export const signUp =
   (data) =>
   async (dispatch, getState, { getFirebase, getFirestore }) => {
      const firebase = getFirebase()
      const firestore = getFirestore()
      dispatch({ type: actions.AUTH_START })
      try {
         const res = await firebase
            .auth()
            .createUserWithEmailAndPassword(data.email, data.password)

         // Send the verfication email
         const user = firebase.auth().currentUser
         await user.sendEmailVerification()

         await firestore.collection("users").doc(res.user.uid).set({
            firstName: data.firstName,
            lastName: data.lastName,
         })
         dispatch({ type: actions.AUTH_SUCCESS })
      } catch (err) {
         dispatch({ type: actions.AUTH_FAIL, payload: err.message })
      }
      dispatch({ type: actions.AUTH_END })
   }

// Logout action creator
export const signOut =
   () =>
   async (dispatch, getState, { getFirebase }) => {
      const firebase = getFirebase()
      try {
         await firebase.auth().signOut()
      } catch (err) {
         console.log(err.message)
      }
   }

// Login action creator
export const signIn =
   (data) =>
   async (dispatch, getState, { getFirebase }) => {
      const firebase = getFirebase()
      dispatch({ type: actions.AUTH_START })
      try {
         await firebase
            .auth()
            .signInWithEmailAndPassword(data.email, data.password)
         dispatch({ type: actions.AUTH_SUCCESS })
      } catch (err) {
         dispatch({ type: actions.AUTH_FAIL, payload: err.message })
      }
      dispatch({ type: actions.AUTH_END })
   }

// Clean up messages
export const clean = () => ({
   type: actions.CLEAN_UP,
})

// Verify email actionTypes
export const verifyEmail =
   () =>
   async (dispatch, getState, { getFirebase }) => {
      const firebase = getFirebase()
      dispatch({ type: actions.VERIFY_START })
      try {
         const user = firebase.auth().currentUser
         await user.sendEmailVerification()
         dispatch({ type: actions.VERIFY_SUCCESS })
      } catch (err) {
         dispatch({ type: actions.VERIFY_FAIL, payload: err.message })
      }
   }

// Send recover password
export const recoverPassword =
   (data) =>
   async (dispatch, getState, { getFirebase }) => {
      const firebase = getFirebase()
      dispatch({ type: actions.RECOVERY_START })
      try {
         // send email ehre
         await firebase.auth().sendPasswordResetEmail(data.email)
         dispatch({ type: actions.RECOVERY_SUCCESS })
      } catch (err) {
         dispatch({ type: actions.RECOVERY_FAIL, payload: err.message })
      }
   }

// Edit profile
export const editUserProfile =
   (data) =>
   async (dispatch, getState, { getFirebase, getFirestore }) => {
      // const firebase = getFirebase();
      const firestore = getFirestore()
      // const user = firebase.auth().currentUser; // dont need it yet for updating email
      const {
         // uid: userId,
         email: userEmail,
      } = getState().firebase.auth
      dispatch({ type: actions.PROFILE_EDIT_START })
      try {
         //edit the user profile
         // if (data.email !== userEmail) {
         //     await user.updateEmail(data.email);
         // }

         await firestore.collection("userData").doc(userEmail).update(data)

         // if (data.password.length > 0) { // dont need it yet since we haven't implemented it on the front end
         //     await user.updatePassword(data.password);
         // }
         dispatch({ type: actions.PROFILE_EDIT_SUCCESS })
      } catch (err) {
         dispatch({ type: actions.PROFILE_EDIT_FAIL, payload: err.message })
      }
   }

// Delete user
export const deleteUser =
   () =>
   async (dispatch, getState, { getFirebase }) => {
      const firebase = getFirebase()

      dispatch({ type: actions.DELETE_USER_START })
      try {
         await firebaseServiceInstance.deleteUserAccount()
         await firebase.auth().signOut()

         dispatch({ type: actions.DELETE_USER_SUCCESS })
      } catch (err) {
         dispatch({ type: actions.DELETE_USER_FAIL, payload: err.message })
         throw new Error(err)
      }
   }
