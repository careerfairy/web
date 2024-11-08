import { useEffect } from "react"
import { Platform } from "react-native"
import WebViewComponent from "./components/WebView"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { app, db, auth } from "./firebase"
import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import { signInWithEmailAndPassword } from "firebase/auth"
import { PROJECT_ID } from "@env"

export default function Native() {
   useEffect(() => {
      if (app) {
         console.log("Firebase connected successfully!")
      } else {
         console.log("Firebase connection failed.")
      }
      checkToken()
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

   const getTokenAndSave = async () => {
      try {
         const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: PROJECT_ID,
         })
         const token = tokenData.data
         saveUserPushTokenToFirestore(token)
      } catch (e) {
         console.log(e)
      }
   }

   const getPushToken = async () => {
      try {
         if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
               name: "default",
               importance: Notifications.AndroidImportance.MAX,
               vibrationPattern: [0, 250, 250, 250],
               lightColor: "#FF231F7C",
            })
         }

         const { status } = await Notifications.requestPermissionsAsync()
         if (status === "granted") {
            getTokenAndSave()
         } else {
            console.log("Notification permissions not granted")
         }
      } catch (e) {
         console.log(e)
      }
   }

   const onLogout = async (
      userId: string,
      userPassword: string,
      userToken: string | null
   ) => {
      try {
         return resetFireStoreData(userId, userPassword, userToken)
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

               await updateDoc(userDocRef, { fcmTokens: arrayUnion(pushToken) })
            }
            await SecureStore.setItemAsync("pushToken", pushToken)
         }
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   async function resetFireStoreData(
      userId: string,
      userPassword: string,
      userToken: string | null
   ) {
      try {
         if (!userToken) {
            return
         }
         if (!auth.currentUser?.email) {
            await signInWithEmailAndPassword(auth, userId, userPassword)
            // If there is still no current user after authentication, we are exiting the method
            if (!auth.currentUser?.email) {
               return
            }
         }

         const userDocRef = doc(db, "userData", auth.currentUser.email)
         await updateDoc(userDocRef, { fcmTokens: arrayRemove(userToken) })

         await SecureStore.deleteItemAsync("pushToken")
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   return (
      <WebViewComponent onTokenInjected={getPushToken} onLogout={onLogout} />
   )
}
