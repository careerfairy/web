import { useEffect } from "react"
import WebViewComponent from "./components/WebView"
import { Camera } from "expo-camera"
import { Audio } from "expo-av"
import { PROJECT_ID } from "@env"
import { doc, setDoc } from "firebase/firestore"
import { app, db } from "./firebase"
import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import { UserData } from "@careerfairy/shared-lib/src/users"

export default function Native() {
   useEffect(() => {
      if (app) {
         console.log("Firebase connected successfully!")
      } else {
         console.log("Firebase connection failed.")
      }
   }, [])

   const askCameraPermissions = async () => {
      const { status: cameraStatus } = await Camera.getCameraPermissionsAsync()
      if (cameraStatus !== "granted") {
         await Camera.requestCameraPermissionsAsync()
      }
   }

   const askAudioPermissions = async () => {
      const { status: audioStatus } = await Audio.getPermissionsAsync()
      if (audioStatus !== "granted") {
         await Audio.requestPermissionsAsync()
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

   const onPermissions = (permissions: string[]) => {
      permissions.forEach((permission) => {
         if (permission === "Audio") {
            askAudioPermissions()
         } else if (permission === "Video") {
            askCameraPermissions()
         }
      })
   }

   const onLogout = async (userId: string) => {
      try {
         return ResetFireStoreData(userId)
      } catch (e) {
         console.log("Error with resetting firestore data", e)
      }
   }

   async function saveUserPushTokenToFirestore(pushToken: string) {
      try {
         let data: UserData
         const userData = await SecureStore.getItemAsync("userData")

         if (userData) {
            data = JSON.parse(userData)

            if (data) {
               const userDocRef = doc(db, "userData", data.id)

               // Use setDoc to update the document
               await setDoc(
                  userDocRef,
                  { pushToken: pushToken },
                  { merge: true } // Use merge to update without overwriting the entire document
               )
            }
         }
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   async function ResetFireStoreData(userId: string) {
      try {
         const userDocRef = doc(db, "userData", userId)
         await setDoc(userDocRef, { pushToken: "" }, { merge: true })
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   return (
      <WebViewComponent
         onTokenInjected={getPushToken}
         onPermissionsNeeded={onPermissions}
         onLogout={onLogout}
      ></WebViewComponent>
   )
}
