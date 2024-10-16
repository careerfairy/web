import React, { useEffect, useRef, useState } from "react"
import {
   ActivityIndicator,
   BackHandler,
   Linking,
   Platform,
   SafeAreaView,
} from "react-native"
import { WebView } from "react-native-webview"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import { app } from "../firebase"

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
   }),
})
interface WebViewScreenProps {
   onTokenInjected: () => void // Callback prop
}

const WebViewComponent: React.FC<WebViewScreenProps> = ({
   onTokenInjected,
}) => {
   const [loading, setLoading] = useState(true)
   const [initialUrl, setInitialUrl] = useState("https://careerfairy.io/portal") // Default WebView URL
   const webViewRef: any = useRef(null)

   // When we implement of event sending on client side on login or logout, we will be calling the method to handle it
   const handleMessage = (event: any) => {
      const receivedToken = event.nativeEvent.data // Token received from WebView
      setToken(receivedToken)
   }

   const setToken = async (token: string) => {
      await SecureStore.setItemAsync("authToken", token)
      onTokenInjected()
   }

   // When we have token in our storage, we will use it to inject in into the webview, as it will run always in incognito mode - because of potential web changes
   const injectToken = async (token: string | null) => {
      if (token && webViewRef.current) {
         const injectScript = `
        (function() {
          document.cookie = "token=${token}; path=/"; 
        })();
        true;
      `
         try {
            webViewRef.current.injectJavaScript(injectScript)
            webViewRef.current.loadUrl("https://careerfairy.io/portal")
         } catch (e) {
            console.log("Error with loading the url")
         }
         setLoading(false)
         onTokenInjected() // Notify the App component
      }
   }
   useEffect(() => {
      const checkUserToken = async () => {
         const token = await SecureStore.getItemAsync("authToken")
         if (token) {
            injectToken(token)
            setLoading(false)
            setInitialUrl("https://careerfairy.io/portal")
            if (webViewRef.current) {
               try {
                  webViewRef.current.loadUrl("https://careerfairy.io/portal")
               } catch (e) {
                  console.log("Error with loading the url")
               }
            }
         } else {
            setLoading(false)
            setInitialUrl("https://careerfairy.io/login")
            if (webViewRef.current) {
               try {
                  webViewRef.current.loadUrl("https://careerfairy.io/login")
               } catch (e) {
                  console.log("Error with loading the url")
               }
            }
         }
      }

      checkUserToken()
   }, [])

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

   // Handling opening of external links in default mobile browser
   const handleNavigation = (request: any) => {
      if (!request.url.includes("careerfairy.io")) {
         Linking.openURL(request.url)
         return false // Prevent WebView from loading the external link
      }
      return true // Allow WebView to load internal links
   }

   // Log Firebase connection status
   useEffect(() => {
      if (app) {
         console.log("Firebase connected successfully!")
      } else {
         console.log("Firebase connection failed.")
      }
   }, [])

   return (
      <SafeAreaView style={{ flex: 1, paddingTop: 30 }}>
         {loading ? (
            <ActivityIndicator
               style={{ flex: 1 }}
               size="large"
               color="#0000ff"
            />
         ) : (
            <WebView
               style={{ flex: 1 }}
               ref={webViewRef}
               source={{ uri: initialUrl }}
               javaScriptEnabled={true}
               allowsInlineMediaPlayback
               incognito={true}
               mediaPlaybackRequiresUserAction={false}
               onMessage={handleMessage}
               onShouldStartLoadWithRequest={handleNavigation}
               domStorageEnabled={true} // Enable DOM storage if needed
               startInLoadingState={true} // Show loading indicator
               onLoadEnd={() => setLoading(false)}
            />
         )}
      </SafeAreaView>
   )
}

export default WebViewComponent
