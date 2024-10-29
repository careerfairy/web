import React, { useEffect, useRef, useState } from "react"
import {
   BackHandler,
   Linking,
   Platform,
   StyleSheet,
   SafeAreaView,
   View,
   Text,
   TouchableOpacity,
} from "react-native"
import { WebView } from "react-native-webview"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import { BASE_URL, INCLUDES_PERMISSIONS, SEARCH_CRITERIA } from "@env"
import {
   MESSAGING_TYPE,
   USER_AUTH,
   HAPTIC,
   PERMISSIONS,
   NativeEventStringified,
   NativeEvent,
} from "@careerfairy/shared-lib/src/messaging"
import { Camera } from "expo-camera"
import { Audio } from "expo-av"

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
   }),
})

interface WebViewScreenProps {
   onTokenInjected: () => void
   onLogout: (userId: string, userPassword: string) => void
}

const WebViewComponent: React.FC<WebViewScreenProps> = ({
   onTokenInjected,
   onLogout,
}) => {
   const [showPermissionsBanner, setShowPermissionsBanner] = useState(false)
   const [baseUrl, setBaseUrl] = useState(BASE_URL + "/portal")
   const webViewRef: any = useRef(null)
   const cameraRef: any = useRef(null)
   const audioRef: any = useRef(null)
   const [subscriptionListener, setSubscriptionListener] = useState(null)
   const [hasAudioPermissions, setHasAudioPermissions] = useState(false)
   const [hasVideoPermissions, setHasVideoPermissions] = useState(false)
   const [mediaStarted, setMediaStarted] = useState(false)

   useEffect(() => {
      checkAuthentication()
      checkPermissions()
   }, [])

   const checkPermissions = async () => {
      const { status: audioStatus } = await Audio.getPermissionsAsync()
      const { status: videoStatus } = await Camera.getCameraPermissionsAsync()
      setHasAudioPermissions(audioStatus === "granted")
      setHasVideoPermissions(videoStatus === "granted")
   }

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
   }

   const unsubscribeToNotifications = () => {
      if (subscriptionListener) {
         Notifications.removeNotificationSubscription(subscriptionListener)
         setSubscriptionListener(null)
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
   const startCamera = async () => {
      if (hasVideoPermissions) {
         // Open the camera using ref without rendering it in the UI
         cameraRef.current = await Camera.requestCameraPermissionsAsync()
      } else {
         console.log("No permissions")
      }
   }

   const stopCamera = async () => {
      if (cameraRef.current) {
         console.log("There is camera ref")
         cameraRef.current.stopRecording()
         cameraRef.current = null // Release camera ref
      }
   }

   // Functions to start and stop audio recording
   const startAudio = async () => {
      if (hasAudioPermissions) {
         await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
         })

         const recording = new Audio.Recording()
         try {
            await recording.prepareToRecordAsync()
            await recording.startAsync()
            audioRef.current = recording
         } catch (error) {
            console.error("Failed to start recording:", error)
         }
      } else {
         console.log("Audio permission is required.")
      }
   }

   const stopAudio = async () => {
      if (audioRef.current) {
         console.log("THERE IS AUDIO REF")
         try {
            await audioRef.current.stopAndUnloadAsync()
            audioRef.current = null // Release recording ref
         } catch (error) {
            console.error("Failed to stop recording:", error)
         }
      }
   }

   const handleUserAuth = async (data: USER_AUTH) => {
      await SecureStore.setItemAsync("authToken", data.token)
      await SecureStore.setItemAsync("userId", data.userId)
      await SecureStore.setItemAsync("userPassword", data.userPassword)
      subscribeToNotifications()
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
         if (userId && userPassword) {
            onLogout(userId, userPassword)
         }
         await SecureStore.deleteItemAsync("authToken")
         await SecureStore.deleteItemAsync("userId")
         await SecureStore.deleteItemAsync("userPassword")
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

   const handleNavigationStateChange = (navState: any) => {
      const { url } = navState
      if (
         url?.includes(INCLUDES_PERMISSIONS) &&
         (!hasAudioPermissions || !hasVideoPermissions)
      ) {
         return requestPermissions()
      } else {
         if (url?.includes(INCLUDES_PERMISSIONS) && !mediaStarted) {
            setMediaStarted(true)
            startCamera()
            startAudio()
            console.log("Starting media")
         } else {
            if (mediaStarted) {
               console.log("Stop media")
               setMediaStarted(false)
               stopCamera()
               stopAudio()
            }
            setShowPermissionsBanner(false)
         }
      }
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
