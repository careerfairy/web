import { useEffect } from "react"
import WebViewComponent from "./components/WebView"
import { PROJECT_ID } from "@env"
import { doc, setDoc } from "firebase/firestore"
import { app, db, auth } from "./firebase"
import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import { signInWithEmailAndPassword } from "firebase/auth"

export default function Native() {
   useEffect(() => {
      if (app) {
         console.log("Firebase connected successfully!")
         checkToken()
      } else {
         console.log("Firebase connection failed.")
      }
   }, [])

   const checkToken = async () => {
      const token = await SecureStore.getItemAsync("authToken")
      if (token) {
         const pushToken = await SecureStore.getItemAsync("pushToken")
         if (!pushToken) {
            getPushToken()
         }
      }
   }

   const getPushToken = async () => {
      try {
         const { status: existingStatus } =
            await Notifications.getPermissionsAsync()
         let finalStatus = existingStatus

         if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status
         }
         if (finalStatus !== "granted") {
            return
         }

         const token = (
            await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })
         ).data

         // Saving the data to Firestore with all relevant data we will use to filter out notification queue
         return saveUserPushTokenToFirestore(token)
      } catch (e) {
         console.log(e)
      }
   }

   const onLogout = async (userId: string, userPassword: string) => {
      try {
         return resetFireStoreData(userId, userPassword)
      } catch (e) {
         console.log("Error with resetting firestore data", e)
      }
   }

   async function saveUserPushTokenToFirestore(pushToken: string) {
      try {
         const userId = await SecureStore.getItemAsync("userId")
         const userPassword = await SecureStore.getItemAsync("userPassword")

         if (userId && userPassword) {
            await signInWithEmailAndPassword(auth, userId, userPassword)
            if (auth.currentUser?.email) {
               const userDocRef = doc(db, "userData", auth.currentUser.email)

               await setDoc(
                  userDocRef,
                  { pushToken: pushToken },
                  { merge: true }
               )
            }
            await SecureStore.setItemAsync("pushToken", pushToken)
         }
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   async function resetFireStoreData(userId: string, userPassword: string) {
      try {
         if (auth.currentUser?.email) {
            const userDocRef = doc(db, "userData", auth.currentUser.email)
            await setDoc(userDocRef, { pushToken: null }, { merge: true })
         } else {
            await signInWithEmailAndPassword(auth, userId, userPassword)
            if (auth.currentUser?.email) {
               const userDocRef = doc(db, "userData", auth.currentUser.email)
               await setDoc(userDocRef, { pushToken: null }, { merge: true })
            }
         }
         await SecureStore.deleteItemAsync("pushToken")
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   return (
      <WebViewComponent
         onTokenInjected={getPushToken}
         onLogout={onLogout}
      ></WebViewComponent>
   )
}
