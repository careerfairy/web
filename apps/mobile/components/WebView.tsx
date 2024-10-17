import React, { useEffect, useRef } from "react"
import { BackHandler, Linking, Platform, SafeAreaView } from "react-native"
import { WebView } from "react-native-webview"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import { environment } from "../environments/environment"

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
   const baseUrl = environment.basePageUrl + "/portal"
   const webViewRef: any = useRef(null)

   // When we implement of event sending on client side on login or logout, we will be calling the method to handle it
   const handleMessage = (event: any) => {
      const receivedToken = event.nativeEvent.data // Token and potential data received from WebView
      setToken(receivedToken)
   }

   const injectedJavaScript = `
    (function() {
      window.ReactNativeWebView.postMessage(document.cookie);
    })();
  `

   const setToken = async (token: string) => {
      await SecureStore.setItemAsync("authToken", token)
      onTokenInjected()
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

   // Handling opening of external links in default mobile browser
   const handleNavigation = (request: any) => {
      if (!request.url.includes(environment.searchCriteria)) {
         Linking.openURL(request.url)
         return false // Prevent WebView from loading the external link
      }
      return true // Allow WebView to load internal links
   }

   return (
      <SafeAreaView style={{ flex: 1, paddingTop: 30 }}>
         <WebView
            style={{ flex: 1 }}
            ref={webViewRef}
            source={{ uri: baseUrl }}
            javaScriptEnabled={true}
            incognito={true}
            mediaPlaybackRequiresUserAction={false}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleNavigation}
            domStorageEnabled={true} // Enable DOM storage if needed
            startInLoadingState={true} // Show loading indicator
            injectedJavaScript={injectedJavaScript}
            allowsInlineMediaPlayback={true} // Required for iOS
         />
      </SafeAreaView>
   )
}

export default WebViewComponent
