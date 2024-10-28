import { useEffect } from "react"
import WebViewComponent from "./components/WebView"
import { PROJECT_ID } from "@env"
import { doc, setDoc } from "firebase/firestore"
import { app, db, auth } from "./firebase"
import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import { Alert } from "react-native"
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
         Alert.alert("Has token")
         getPushToken()
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
         return ResetFireStoreData(userId, userPassword)
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
            Alert.alert("User signed in")
            const userDocRef = doc(db, "userData", userId)

            // Use setDoc to update the document
            await setDoc(
               userDocRef,
               { pushToken: pushToken },
               { merge: true } // Use merge to update without overwriting the entire document
            )
         }
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   async function ResetFireStoreData(userId: string, userPassword: string) {
      try {
         await signInWithEmailAndPassword(auth, userId, userPassword)
         Alert.alert("User signed out")
         const userDocRef = doc(db, "userData", userId)
         await setDoc(userDocRef, { pushToken: "" }, { merge: true })
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
