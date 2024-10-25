import React, { useEffect, useRef, useState } from "react"
import {
   Alert,
   BackHandler,
   Linking,
   Platform,
   RefreshControl,
   SafeAreaView,
   ScrollView,
} from "react-native"
import { WebView } from "react-native-webview"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import { BASE_URL, SEARCH_CRITERIA } from "@env"
import {
   MESSAGING_TYPE,
   USER_AUTH,
   HAPTIC,
   PERMISSIONS,
   NativeEventStringified,
   NativeEvent,
} from "@careerfairy/shared-lib/src/messaging"
import { UserData } from "@careerfairy/shared-lib/src/users"

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
   }),
})

interface WebViewScreenProps {
   onTokenInjected: () => void
   onPermissionsNeeded: (permissions: string[]) => void
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
               navigateToNewUrl(url)
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
         const receivedData = JSON.parse(event.nativeEvent.data)

         const { type, data } = receivedData as NativeEvent

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
      await SecureStore.setItemAsync("userId", data.userId)
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
      onPermissionsNeeded(data.permissions)
   }

   const handleLogout = async () => {
      try {
         const userId = await SecureStore.getItemAsync("userId")
         if (userId) {
            onLogout(userId)
         }
         await SecureStore.deleteItemAsync("authToken")
         await SecureStore.deleteItemAsync("userId")
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

   const handleBackButtonPress = () => {
      if (webViewRef.current) {
         webViewRef.current.goBack()
         return true
      }
      return false
   }

   const onRefresh = () => {
      if (webViewRef.current) {
         webViewRef.current.reload()
      }
   }

   const navigateToNewUrl = (newUrl: string) => {
      if (webViewRef.current) {
         const jsCode = `window.location.href = '${newUrl}';`
         webViewRef.current.injectJavaScript(jsCode)
      }
   }

   const isValidUrl = (url: string) => {
      const regex =
         /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
      return regex.test(url)
   }

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
         <ScrollView
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
               <RefreshControl refreshing={false} onRefresh={onRefresh} />
            }
         >
            <WebView
               style={{ flex: 1 }}
               ref={webViewRef}
               source={{ uri: baseUrl }}
               javaScriptEnabled={true}
               mediaPlaybackRequiresUserAction={false}
               onMessage={handleMessage}
               onShouldStartLoadWithRequest={handleNavigation}
               cacheEnabled={true}
               domStorageEnabled={true}
               startInLoadingState={true}
               allowsInlineMediaPlayback={true}
            />
         </ScrollView>
      </SafeAreaView>
   )
}

export default WebViewComponent
