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
   Button,
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
import { errorLogAndNotify } from "./utils/error-handler"
import { initializeFacebookTracking } from "./utils/facebook-tracking"
import { handleVerifyToken } from "./utils/firebase"
import { SECURE_STORE_KEYS } from "./utils/secure-store-constants"
import { initSentry } from "./utils/sentry"

const sentry = initSentry()

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

function Native() {
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
      const firebaseIdToken = await SecureStore.getItemAsync(
         SECURE_STORE_KEYS.FIREBASE_ID_TOKEN
      )

      if (firebaseIdToken) {
         const savedCustomerioPushToken = await SecureStore.getItemAsync(
            SECURE_STORE_KEYS.CUSTOMERIO_PUSH_TOKEN
         )
         const currentPushToken = await customerIO.getPushToken()

         if (
            !savedCustomerioPushToken ||
            currentPushToken !== savedCustomerioPushToken
         ) {
            getPushToken()
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
         await resetFireStoreData(idToken, customerioPushToken)
         sentry.setUser(null)
      } catch (e) {
         console.log("Error with resetting firestore data", e)
      }
   }

   async function saveUserPushTokenToFirestore(customerioPushToken: string) {
      try {
         const idToken = await SecureStore.getItemAsync(
            SECURE_STORE_KEYS.FIREBASE_ID_TOKEN
         )

         if (idToken) {
            const credentials = await handleVerifyToken(idToken)

            await signInWithCustomToken(auth, credentials.customToken)

            if (auth.currentUser?.email) {
               const userDocRef = doc(db, "userData", auth.currentUser.email)

               await updateDoc(userDocRef, {
                  cioPushTokens: arrayUnion(customerioPushToken),
               })
            }

            await SecureStore.setItemAsync(
               SECURE_STORE_KEYS.CUSTOMERIO_PUSH_TOKEN,
               customerioPushToken
            )

            await customerIO.identifyCustomer(credentials.uid)
            sentry.setUser({
               id: credentials.uid,
               email: credentials.email,
            })
         }
      } catch (error) {
         console.error(
            `Failed to send data to the Firestore: ${JSON.stringify(
               error,
               null,
               2
            )}`
         )
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
         console.error(
            `Failed to send data to the Firestore: ${JSON.stringify(
               error,
               null,
               2
            )}`
         )
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
      <>
         <SafeAreaView
            style={{
               position: "absolute",
               top: "50%",
               left: 0,
               right: 0,
               zIndex: 1000,
               alignItems: "center",
            }}
         >
            <Button
               title="Press me to crash"
               onPress={() => {
                  throw new Error("Hello, again, Sentry!")
               }}
            />
            <Button
               title="Press me to log error"
               onPress={() => {
                  errorLogAndNotify(
                     new Error("Hello, this is the error message"),
                     {
                        message: "Hello, this is extra message!",
                     }
                  )
               }}
            />
         </SafeAreaView>
         <WebViewComponent
            onTokenInjected={getPushToken}
            onLogout={onLogout}
            webViewRef={webViewRef}
         />
      </>
   )
}

export default sentry.wrap(Native)
