import { useEffect, useState } from "react"
import {
   Platform,
   SafeAreaView,
   Text,
   TouchableOpacity,
   Image,
} from "react-native"
import WebViewComponent from "./components/WebView"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { app, db, auth } from "./firebase"
import * as SecureStore from "expo-secure-store"
import * as Notifications from "expo-notifications"
import { signInWithEmailAndPassword } from "firebase/auth"
import { PROJECT_ID } from "@env"
import NetInfo from "@react-native-community/netinfo"
import React from "react"
import {
   useFonts,
   Poppins_400Regular,
   Poppins_600SemiBold,
} from "@expo-google-fonts/poppins"

const styles: any = {
   image: {
      width: 100,
      height: 100,
      resizeMode: "contain",
   },
   title: {
      fontFamily: "PoppinsSemiBold",
      fontSize: "16px",
      color: "#3D3D47",
      marginTop: 20,
      marginBottom: 14,
   },
   description: {
      fontFamily: "PoppinsRegular",
      fontSize: "16px",
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
      fontSize: "16px",
   },
}

export default function Native() {
   const [connectedToInternet, setConnectedToInternet] = useState<
      boolean | null
   >(true)
   const [fontsLoaded] = useFonts({
      PoppinsRegular: Poppins_400Regular,
      PoppinsSemiBold: Poppins_600SemiBold,
   })

   useEffect(() => {
      if (app) {
         console.log("Firebase connected successfully!")
      } else {
         console.log("Firebase connection failed.")
      }
      checkToken()
   }, [])

   useEffect(() => {
      // Subscribe to network status updates
      const unsubscribe = NetInfo.addEventListener((state) => {
         setConnectedToInternet(state.isConnected)
      })

      // Clean up the listener when the component unmounts
      return () => unsubscribe()
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

   if (!fontsLoaded) {
      return <></>
   }

   return (
      <>
         {!connectedToInternet ? (
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
                  We can't load anything right now. Connect to the web, and
                  you'll be good to go!
               </Text>
               <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Try again</Text>
               </TouchableOpacity>
            </SafeAreaView>
         ) : (
            <WebViewComponent
               onTokenInjected={getPushToken}
               onLogout={onLogout}
            />
         )}
      </>
   )
}
