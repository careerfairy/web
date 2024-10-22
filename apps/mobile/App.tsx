import { useEffect } from "react"
import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import WebViewComponent from "./components/WebView"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { Camera } from "expo-camera"
import { Audio } from "expo-av"
import { firebaseConfig } from "./constants/constants"
import { PROJECT_ID } from "@env"

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export default function Native() {
   // Log Firebase connection status
   useEffect(() => {
      // Request camera and audio permissions when the component mounts
      ;(async () => {
         const { status: cameraStatus } =
            await Camera.getCameraPermissionsAsync()
         if (cameraStatus !== "granted") {
            await Camera.requestCameraPermissionsAsync()
         }
         const { status: audioStatus } = await Audio.getPermissionsAsync()
         if (audioStatus !== "granted") {
            await Audio.requestPermissionsAsync()
         }
      })()

      if (app) {
         console.log("Firebase connected successfully!")
      } else {
         console.log("Firebase connection failed.")
      }
   }, [])

   useEffect(() => {}, [])
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

         // Warning: Calling getExpoPushTokenAsync without specifying a projectId is deprecated and will no longer be supported in SDK 49+
         // Will be removed when we connect to expo dashboard and get project id from there
         const token = (
            await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID })
         ).data
         const userId = 1
         const dummyData = {
            age: 30,
            email: "test@email.com",
         }

         // Saving the data to Firestore with all relevant data we will use to filter out notification queue
         return saveUserDataToFirestore(userId, dummyData, token)
      } catch (e) {
         console.log(e)
      }
   }

   async function saveUserDataToFirestore(
      userId: number | string,
      userData: any,
      pushToken: string
   ) {
      const token = await SecureStore.getItemAsync("authToken")

      // @ts-ignore
      db().collection("users").doc(userId).set(
         {
            age: userData.age,
            token,
            email: userData.email,
            pushToken: pushToken,
         },
         { merge: true }
      )
   }

   return <WebViewComponent onTokenInjected={getPushToken}></WebViewComponent>
}
