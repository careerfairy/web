import {
   Poppins_400Regular,
   Poppins_600SemiBold,
   useFonts,
} from "@expo-google-fonts/poppins"
import NetInfo from "@react-native-community/netinfo"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import { signInWithCustomToken } from "firebase/auth"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import React, { useEffect, useRef, useState } from "react"
import {
   Image,
   Platform,
   SafeAreaView,
   Text,
   TouchableOpacity,
} from "react-native"
import WebView from "react-native-webview"
import WebViewComponent from "./components/WebView"
import { app, auth, db } from "./firebase"
import { customerIO } from "./utils/customerio-tracking"
import { initializeFacebookTracking } from "./utils/facebook-tracking"
import { handleVerifyToken } from "./utils/firebase"
import { SECURE_STORE_KEYS } from "./utils/secure-store-constants"

const styles: any = {
   image: {
      width: 100,
      height: 100,
      resizeMode: "contain",
   },
   title: {
      fontFamily: "PoppinsSemiBold",
      fontSize: 16,
      color: "#3D3D47",
      marginTop: 20,
      marginBottom: 14,
   },
   description: {
      fontFamily: "PoppinsRegular",
      fontSize: 16,
      color: "#5C5C6A",
      textAlign: "center",
      marginBottom: 20,
   },
   button: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#2ABAA5",
      backgroundColor: "#FCFCFE",
      width: 285,
      paddingVertical: 8,
      paddingHorizontal: 24,
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
   },
   buttonText: {
      fontFamily: "PoppinsRegular",
      color: "#2ABAA5",
      fontSize: 16,
   },
}

export default function Native() {
   const webViewRef = useRef<WebView>(null)
   const [isConnected, setIsConnected] = useState<boolean | null>(true)
   const [fontsLoaded] = useFonts({
      PoppinsRegular: Poppins_400Regular,
      PoppinsSemiBold: Poppins_600SemiBold,
   })

   useEffect(() => {
      initializeFacebookTracking()
   }, [])

   useEffect(() => {
      customerIO.initialize().catch(console.error)
   }, [])

   useEffect(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
         setIsConnected(state.isConnected)
      })

      // Check initial connectivity
      NetInfo.fetch()
         .then((state) => setIsConnected(state.isConnected))
         .catch((error) => {
            console.error("NetInfo fetch error: ", error)
            setIsConnected(false)
         })

      return () => unsubscribe()
   }, [])

   // Retry button action to check connectivity again
   const handleRetry = () => {
      NetInfo.fetch().then((state) => {
         setIsConnected(state.isConnected)
      })
   }

   useEffect(() => {
      if (app) {
         console.log("Firebase connected successfully!")
      } else {
         console.log("Firebase connection failed.")
      }
      checkToken()
   }, [])

   const checkToken = async () => {
      console.log("🚀 Checking Firebase ID token...")
      const firebaseIdToken = await SecureStore.getItemAsync(
         SECURE_STORE_KEYS.FIREBASE_ID_TOKEN
      )
      console.log(
         "🚀 Firebase ID token:",
         firebaseIdToken ? "exists" : "not found"
      )

      if (firebaseIdToken) {
         console.log("🚀 Getting saved CustomerIO push token...")
         const savedCustomerioPushToken = await SecureStore.getItemAsync(
            SECURE_STORE_KEYS.CUSTOMERIO_PUSH_TOKEN
         )
         console.log(
            "🚀 Saved CustomerIO push token:",
            savedCustomerioPushToken || "not found"
         )

         console.log("🚀 Getting current push token...")
         const currentPushToken = await customerIO.getPushToken()
         console.log("🚀 Current push token:", currentPushToken)

         if (
            !savedCustomerioPushToken ||
            currentPushToken !== savedCustomerioPushToken
         ) {
            console.log(
               "🚀 Push token mismatch or missing - getting new token..."
            )
            getPushToken()
         } else {
            console.log("🚀 Push tokens match - no update needed")
         }
      }
   }

   const getTokenAndSave = async () => {
      try {
         const customerioPushToken = await customerIO.getPushToken()

         saveUserPushTokenToFirestore(customerioPushToken)
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

         const status = await customerIO.showPromptForPushNotifications()

         if (status === "GRANTED") {
            getTokenAndSave()
         } else {
            console.log("Notification permissions not granted")
         }
      } catch (e) {
         console.log(e)
      }
   }

   const onLogout = async (
      idToken: string,
      customerioPushToken: string | null
   ) => {
      try {
         return resetFireStoreData(idToken, customerioPushToken)
      } catch (e) {
         console.log("Error with resetting firestore data", e)
      }
   }

   async function saveUserPushTokenToFirestore(customerioPushToken: string) {
      try {
         console.log("🔑 Getting Firebase ID token from secure store...")
         const idToken = await SecureStore.getItemAsync(
            SECURE_STORE_KEYS.FIREBASE_ID_TOKEN
         )
         console.log(
            "📱 Firebase ID token retrieved:",
            idToken ? "✅ Found" : "❌ Not found"
         )

         if (idToken) {
            console.log("🔍 Verifying token...")
            const credentials = await handleVerifyToken(idToken)
            console.log("✅ Token verified, got credentials")

            console.log("🔐 Signing in with custom token...")
            await signInWithCustomToken(auth, credentials.customToken)
            console.log("✅ Signed in successfully")

            if (auth.currentUser?.email) {
               console.log(
                  "📝 Updating Firestore for user:",
                  auth.currentUser.email
               )
               const userDocRef = doc(db, "userData", auth.currentUser.email)

               await updateDoc(userDocRef, {
                  cioPushTokens: arrayUnion(customerioPushToken),
               })
               console.log("✅ Updated push token in Firestore")
            }

            console.log("💾 Saving CustomerIO push token to secure store...")
            await SecureStore.setItemAsync(
               SECURE_STORE_KEYS.CUSTOMERIO_PUSH_TOKEN,
               customerioPushToken
            )
            console.log("✅ CustomerIO push token saved")

            console.log("🔄 Identifying customer with CustomerIO...")
            await customerIO.identifyCustomer(credentials.uid)
            console.log("✅ Customer identified with CustomerIO")
         }
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   async function resetFireStoreData(
      idToken: string,
      customerioPushToken: string | null
   ) {
      try {
         if (!customerioPushToken) {
            return
         }
         if (!auth.currentUser?.email) {
            const credentials = await handleVerifyToken(idToken)
            await signInWithCustomToken(auth, credentials.customToken)
            // If there is still no current user after authentication, we are exiting the method
            if (!auth.currentUser?.email) {
               return
            }
         }

         const userDocRef = doc(db, "userData", auth.currentUser.email)
         await updateDoc(userDocRef, {
            cioPushTokens: arrayRemove(customerioPushToken),
         })

         await SecureStore.deleteItemAsync(
            SECURE_STORE_KEYS.CUSTOMERIO_PUSH_TOKEN
         )

         await customerIO.clearCustomer()
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   if (!fontsLoaded) {
      return <></>
   }

   if (!isConnected) {
      return (
         <SafeAreaView
            style={{
               flex: 1,
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               backgroundColor: "#f7f8fc",
            }}
         >
            <Image
               source={require("./assets/images/internet_icon.png")}
               style={styles.icon}
            />
            <Text style={styles.title}>Whoops, no internet!</Text>
            <Text style={styles.description}>
               We can't load anything right now. Connect to the web, and you'll
               be good to go!
            </Text>
            <TouchableOpacity
               style={styles.button}
               onPress={() => handleRetry()}
            >
               <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
         </SafeAreaView>
      )
   }

   return (
      <WebViewComponent
         onTokenInjected={getPushToken}
         onLogout={onLogout}
         webViewRef={webViewRef}
      />
   )
}
