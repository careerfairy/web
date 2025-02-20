import { MESSAGING_TYPE } from "@careerfairy/shared-lib/src/messaging"
import {
   Poppins_400Regular,
   Poppins_600SemiBold,
   useFonts,
} from "@expo-google-fonts/poppins"
import NetInfo from "@react-native-community/netinfo"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import { signInWithEmailAndPassword } from "firebase/auth"
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
import { SECURE_STORE_KEYS } from "./utils/secure-store-constants"
import { sendToWebView } from "./utils/webview.utils"

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
      const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.AUTH_TOKEN)

      if (token) {
         const savedCustomerioPushToken = await SecureStore.getItemAsync(
            SECURE_STORE_KEYS.CUSTOMERIO_PUSH_TOKEN
         )

         const currentPushToken = await customerIO.getPushToken()

         if (
            !savedCustomerioPushToken ||
            currentPushToken !== savedCustomerioPushToken
         ) {
            console.log(
               `🚀 ~ checkToken ~ currentPushToken: ${currentPushToken} customerioPushToken: ${savedCustomerioPushToken} are equal: ${
                  currentPushToken === savedCustomerioPushToken
               }`
            )
            getPushToken()
         }
      } else {
         // If there is no token it means the user is not considered logged in on mobile
         // So we need to log them out on web to ensure consistency
         sendToWebView(webViewRef, {
            type: MESSAGING_TYPE.LOGOUT_WEB_VIEW,
            data: null,
         })
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

         console.log(`🚀 ~ status from prompt ~ status: ${status}`)

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
      userId: string,
      userPassword: string,
      customerioPushToken: string | null
   ) => {
      try {
         return resetFireStoreData(userId, userPassword, customerioPushToken)
      } catch (e) {
         console.log("Error with resetting firestore data", e)
      }
   }

   async function saveUserPushTokenToFirestore(customerioPushToken: string) {
      try {
         const userId = await SecureStore.getItemAsync(
            SECURE_STORE_KEYS.USER_ID
         )
         const userPassword = await SecureStore.getItemAsync(
            SECURE_STORE_KEYS.USER_PASSWORD
         )

         if (userId && userPassword) {
            const credentials = await signInWithEmailAndPassword(
               auth,
               userId,
               userPassword
            )
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

            await customerIO.identifyCustomer(credentials.user.uid)
         }
      } catch (error) {
         console.error("Failed to send data to the Firestore:", error)
      }
   }

   async function resetFireStoreData(
      userId: string,
      userPassword: string,
      customerioPushToken: string | null
   ) {
      try {
         if (!customerioPushToken) {
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
