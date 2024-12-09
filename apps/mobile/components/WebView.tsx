import {
   HAPTIC,
   MESSAGING_TYPE,
   NativeEvent,
   NativeEventStringified,
   PERMISSIONS,
   USER_AUTH,
} from "@careerfairy/shared-lib/src/messaging"
import { BASE_URL, INCLUDES_PERMISSIONS, SEARCH_CRITERIA } from "@env"
import { Audio } from "expo-av"
import { Camera } from "expo-camera"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import React, { useEffect, useRef, useState } from "react"
import {
   BackHandler,
   Linking,
   Platform,
   SafeAreaView,
   StatusBar,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native"
import { WebView } from "react-native-webview"

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
   }),
})

interface WebViewScreenProps {
   onTokenInjected: () => void
   onLogout: (
      userId: string,
      userPassword: string,
      userToken: string | null
   ) => void
}

const WebViewComponent: React.FC<WebViewScreenProps> = ({
   onTokenInjected,
   onLogout,
}) => {
   const [showPermissionsBanner, setShowPermissionsBanner] = useState(false)
   const [baseUrl, setBaseUrl] = useState(BASE_URL + "/portal")
   const webViewRef: any = useRef(null)
   const [hasAudioPermissions, setHasAudioPermissions] = useState(false)
   const [hasVideoPermissions, setHasVideoPermissions] = useState(false)
   const [isReloaded, setIsReloaded] = useState(false)

   useEffect(() => {
      checkPermissions()
   }, [])

   useEffect(() => {
      const handleDeepLink = (event: { url: string }) => {
         const deepLinkUrl = event.url
         if (deepLinkUrl.includes("careerfairy")) {
            setBaseUrl(deepLinkUrl)
         }
      }

      // Listen for deep links
      const subscription = Linking.addEventListener("url", handleDeepLink)

      // Check if the app was opened via a deep link
      Linking.getInitialURL().then((initialUrl) => {
         if (initialUrl && initialUrl.includes("careerfairy")) {
            setBaseUrl(initialUrl)
         }
      })

      return () => {
         subscription.remove()
      }
   }, [])

   useEffect(() => {
      const getInitialUrl = async () => {
         const response = await Notifications.getLastNotificationResponseAsync()
         if (response && response.notification.request.content.data.url) {
            setBaseUrl(response.notification.request.content.data.url)
         } else {
            setBaseUrl(BASE_URL + "/portal")
         }
      }

      getInitialUrl()
   }, [])

   const checkPermissions = async () => {
      const { status: audioStatus } = await Audio.getPermissionsAsync()
      const { status: videoStatus } = await Camera.getCameraPermissionsAsync()
      setHasAudioPermissions(audioStatus === "granted")
      setHasVideoPermissions(videoStatus === "granted")
   }

   useEffect(() => {
      const notificationListener =
         Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification)
         })

      const responseListener =
         Notifications.addNotificationResponseReceivedListener((response) => {
            const url = response.notification.request.content.data.url
            if (url) {
               navigateToNewUrl(url)
            }
         })

      return () => {
         Notifications.removeNotificationSubscription(notificationListener)
         Notifications.removeNotificationSubscription(responseListener)
      }
   }, [])

   const requestPermissions = async () => {
      try {
         const audioGranted = hasAudioPermissions
            ? hasAudioPermissions
            : (await Audio.requestPermissionsAsync()).status === "granted"
         const videoGranted = hasVideoPermissions
            ? hasVideoPermissions
            : (await Camera.requestCameraPermissionsAsync()).status ===
              "granted"
         const permissionsWereMissing =
            !hasAudioPermissions || !hasVideoPermissions

         if (audioGranted && videoGranted) {
            setShowPermissionsBanner(false)
            if (permissionsWereMissing) {
               setHasAudioPermissions(true)
               setHasVideoPermissions(true)
               onRefresh()
            }
         } else {
            setHasAudioPermissions(audioGranted)
            setHasVideoPermissions(videoGranted)
            setShowPermissionsBanner(true)
         }
      } catch (e) {
         console.log("ERROR")
         console.log(e)
      }
   }

   const openAppSettings = () => {
      if (Platform.OS === "ios") {
         Linking.openURL("app-settings:")
      } else {
         Linking.openSettings()
      }
   }

   const onRefresh = () => {
      if (webViewRef.current) {
         webViewRef.current.reload()
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
      await SecureStore.setItemAsync("userPassword", data.userPassword)
      onTokenInjected()
   }

   const handleHaptic = (data: HAPTIC) => {
      // Handling the haptic on mobile device
   }

   const handlePermissions = (data: PERMISSIONS) => {}

   const handleLogout = async () => {
      try {
         const userId = await SecureStore.getItemAsync("userId")
         const userPassword = await SecureStore.getItemAsync("userPassword")
         const userToken = await SecureStore.getItemAsync("pushToken")
         if (userId && userPassword) {
            onLogout(userId, userPassword, userToken)
         }
         await SecureStore.deleteItemAsync("authToken")
         await SecureStore.deleteItemAsync("userId")
         await SecureStore.deleteItemAsync("userPassword")
      } catch (error) {
         console.log(error)
      }
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

   const navigateToNewUrl = (newUrl: string) => {
      if (webViewRef.current) {
         const jsCode = `window.location.href = '${newUrl}';`
         webViewRef.current.injectJavaScript(jsCode)
      } else {
         setBaseUrl(newUrl)
      }
   }

   const isValidUrl = (url: string) => {
      const regex =
         /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
      return regex.test(url)
   }

   const handleNavigationStateChange = (navState: any) => {
      const { url } = navState
      if (
         url?.includes(INCLUDES_PERMISSIONS) &&
         (!hasAudioPermissions || !hasVideoPermissions)
      ) {
         return requestPermissions()
      } else {
         setShowPermissionsBanner(false)
      }
   }

   const handleNavigation = (request: any) => {
      if (!request.url.includes(SEARCH_CRITERIA)) {
         if (isValidUrl(request.url)) {
            // iOS calls for all types of navigation (including the non-restrictive
            // "other", which causes issues for internal links like cookies).
            if (Platform.OS === "ios" && request.navigationType !== "click") {
               return false
            }
            Linking.openURL(request.url)
         }
         return false // Prevent WebView from loading the external link
      }
      return true // Allow WebView to load internal links
   }

   return (
      <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
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
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
            mixedContentMode="always" // Allow HTTP/HTTPS mixed content
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            useWebKit={true}
            originWhitelist={[
               "https://*",
               "http://*",
               "file://*",
               "sms://*",
               "about:",
            ]}
            onNavigationStateChange={handleNavigationStateChange}
         />

         {showPermissionsBanner && (
            <View style={styles.banner}>
               <Text style={styles.bannerText}>
                  Permissions not granted. Allow them in settings and restart
                  the application
               </Text>
               <TouchableOpacity onPress={openAppSettings}>
                  <Text style={styles.bannerButton}>Click here to allow</Text>
               </TouchableOpacity>
            </View>
         )}
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
   banner: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: "#3bbba5",
      paddingTop: 10,
      paddingBottom: 10,
      paddingRight: 10,
      paddingLeft: 10,
      gap: 4,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
   },
   bannerText: {
      color: "#000000",
      fontSize: 14,
      fontWeight: "bold",
   },
   bannerButton: {
      color: "#ffffff",
      fontWeight: "bold",
      marginLeft: 5,
   },
})

export default WebViewComponent
