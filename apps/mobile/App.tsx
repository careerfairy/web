import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import { firestore } from "./firebase"
import WebViewComponent from "./components/WebView"

export default function Native() {
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
         // Saving the data to Firestore with all relevant data we will use to filter out notification queue
         return saveUserDataToFirestore(
            1,
            { age: 25, email: "email@email.com" },
            token
         )
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
