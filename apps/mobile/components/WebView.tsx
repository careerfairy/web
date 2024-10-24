import React, { useEffect, useRef, useState } from "react"
import {
   Alert,
   BackHandler,
   Linking,
   Platform,
   SafeAreaView,
} from "react-native"
import { WebView } from "react-native-webview"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import { BASE_URL, SEARCH_CRITERIA } from "@env"
import {
   USER_AUTH,
   USER_DATA,
} from "@careerfairy/webapp/scripts/mobile_communication"
import {
   HAPTIC,
   MESSAGING_TYPE,
   NativeEvent,
   NativeEventStringified,
   PERMISSIONS,
} from "../constants/constants"

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
   }),
})
interface WebViewScreenProps {
   onTokenInjected: () => void // Callback prop
   onPermissionsNeeded: (permissions: string[]) => void // Callback prop
   onLogout: (userId: string) => void
}

const WebViewComponent: React.FC<WebViewScreenProps> = ({
   onTokenInjected,
   onPermissionsNeeded,
   onLogout,
}) => {
   const [baseUrl, setBaseUrl] = useState(BASE_URL + "/portal")
   const webViewRef: any = useRef(null)
   const [subscriptionListener, setSubscriptionListener] = useState(null)

   useEffect(() => {
      checkAuthentication()
   }, [])

   const checkAuthentication = () => {
      const token = SecureStore.getItem("authToken")
      if (token) {
         subscribeToNotifications()
      } else {
         unsubscribeToNotifications()
      }
   }

   const subscribeToNotifications = () => {
      const subscription: any =
         Notifications.addNotificationResponseReceivedListener((response) => {
            const url = response.notification.request.content.data.url
            if (url) {
               if (webViewRef.current) {
                  setBaseUrl(url)
               }
            }
         })
      setSubscriptionListener(subscription)
      Alert.alert("Subscribing to notifications...")
   }

   const unsubscribeToNotifications = () => {
      if (subscriptionListener) {
         Notifications.removeNotificationSubscription(subscriptionListener)
         setSubscriptionListener(null)
         Alert.alert("Unsubscribing to notifications...")
      }
   }

   const handleMessage = (event: NativeEventStringified) => {
      try {
         // Parse the received message
         const receivedData = JSON.parse(event.nativeEvent.data)

         // Access the `type` and `data` fields
         const { type, data } = receivedData as NativeEvent

         // Handling operations according to defined types
         switch (type) {
            case MESSAGING_TYPE.USER_AUTH:
               return handleUserAuth(data as USER_AUTH)
            case MESSAGING_TYPE.HAPTIC:
               return handleHaptic(data as HAPTIC)
            case MESSAGING_TYPE.PERMISSIONS:
               return handlePermissions(data as PERMISSIONS)
            case MESSAGING_TYPE.LOGOUT:
               return handleLogout()
            default:
               break
         }
      } catch (error) {
         console.error("Failed to parse message from WebView:", error)
      }
   }

   const handleUserAuth = async (data: USER_AUTH) => {
      await SecureStore.setItemAsync("authToken", data.token)
      await SecureStore.setItemAsync("userData", JSON.stringify(data.userData))
      Alert.alert("Saving data...")
      subscribeToNotifications()
      onTokenInjected()
   }

   const handleHaptic = (data: HAPTIC) => {
      // Handling the haptic on mobile device
      Alert.alert("Haptic activating...")
   }

   const handlePermissions = (data: PERMISSIONS) => {
      console.log("Handling permissions...")
      onPermissionsNeeded(data.types)
   }

   const handleLogout = async () => {
      try {
         const userData = await SecureStore.getItemAsync("userData")
         if (userData) {
            const user: USER_DATA = JSON.parse(userData)
            onLogout(user.id)
         }
         await SecureStore.deleteItemAsync("authToken")
         await SecureStore.deleteItemAsync("userData")
         Alert.alert("Handling logout...")
         unsubscribeToNotifications()
      } catch (e) {}
   }

   // Handle back button in WebView
   useEffect(() => {
      if (Platform.OS === "android") {
         BackHandler.addEventListener(
            "hardwareBackPress",
            handleBackButtonPress
         )
         return () =>
            BackHandler.removeEventListener(
               "hardwareBackPress",
               handleBackButtonPress
            )
      }
   }, [])

   // Handling of back button press inside the webview for natural native behavior
   const handleBackButtonPress = () => {
      if (webViewRef.current) {
         webViewRef.current.goBack()
         return true
      }
      return false
   }

   const isValidUrl = (url: string) => {
      const regex =
         /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
      return regex.test(url)
   }

   // Handling opening of external links in default mobile browser
   const handleNavigation = (request: any) => {
      if (!request.url.includes(SEARCH_CRITERIA)) {
         if (isValidUrl(request.url)) {
            Linking.openURL(request.url)
         }
         return false // Prevent WebView from loading the external link
      }
      return true // Allow WebView to load internal links
   }

   return (
      <SafeAreaView style={{ flex: 1 }}>
         <WebView
            style={{ flex: 1 }}
            ref={webViewRef}
            source={{ uri: baseUrl }}
            javaScriptEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleNavigation}
            cacheEnabled={true}
            domStorageEnabled={true} // Enable DOM storage if needed
            startInLoadingState={true} // Show loading indicator
            allowsInlineMediaPlayback={true} // Required for iOS
         />
      </SafeAreaView>
   )
}

export default WebViewComponent
