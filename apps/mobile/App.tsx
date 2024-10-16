import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import WebViewComponent from "./components/WebView"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { environment } from "./environments/environment"
import { useEffect } from "react"

const app = initializeApp(environment.firebaseConfig)

// Initialize Firestore
const firestore = getFirestore(app)

export default function Native() {
   // Log Firebase connection status
   useEffect(() => {
      if (app) {
         console.log("Firebase connected successfully!")
      } else {
         console.log("Firebase connection failed.")
      }
   }, [])
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
            alert("Failed to get push token for push notification!")
            return
         }

         const token = (await Notifications.getExpoPushTokenAsync()).data
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
      firestore().collection("users").doc(userId).set(
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
