import {
   FEEDBACK,
   HAPTIC,
   MESSAGING_TYPE,
   NativeEvent,
   NativeEventStringified,
   PERMISSIONS,
   USER_AUTH,
} from "@careerfairy/shared-lib/src/messaging"
import {
   APPSTORE_LINK,
   BASE_URL,
   GOOGLE_STORE_LINK,
   INCLUDES_PERMISSIONS,
   SEARCH_CRITERIA,
} from "@env"
import { Audio } from "expo-av"
import { Camera } from "expo-camera"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"
import React, { useEffect, useRef, useState } from "react"
import {
   Alert,
   AppState,
   BackHandler,
   Linking,
   Modal,
   Platform,
   SafeAreaView,
   ScrollView,
   StatusBar,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native"
import { Rating } from "react-native-ratings"
import { WebView } from "react-native-webview"

const injectedCSS = `
    body :not(input):not(textarea) {
      -webkit-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    * {
      -webkit-touch-callout: none;
    }
  `

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
   onFeedbackSent: (
      ratingType: string,
      rating: number,
      feedback: string
   ) => void
}

const WebViewComponent: React.FC<WebViewScreenProps> = ({
   onTokenInjected,
   onFeedbackSent,
   onLogout,
}) => {
   const [baseUrl, setBaseUrl] = useState(BASE_URL + "/portal")
   const webViewRef: any = useRef(null)
   const [hasAudioPermissions, setHasAudioPermissions] = useState(false)
   const [hasVideoPermissions, setHasVideoPermissions] = useState(false)
   const [modalVisible, setModalVisible] = useState(false)
   const [redirectModalVisible, setRedirectModalVisible] = useState(false)
   const [rating, setRating] = useState(1)
   const [feedback, setFeedback] = useState("")
   const [ratingType, setRatingType] = useState("")
   const [modalTitle, setModalTitle] = useState("")
   const [modalSubtitle, setModalSubtitle] = useState("")

   const openStore = () => {
      closeRedirectModal()
      const url = Platform.select({
         ios: APPSTORE_LINK,
         android: GOOGLE_STORE_LINK,
      })

      if (url) {
         Linking.openURL(url)
      }
   }

   const closeRedirectModal = () => {
      setRedirectModalVisible(false)
      Alert.alert("Thank you for your feedback!")
   }

   const handleSubmit = () => {
      setModalVisible(false)
      if (rating >= 4) {
         setRedirectModalVisible(true)
      } else {
         Alert.alert("Thank you for your feedback!")
      }
      setRating(0)
      setFeedback("")
      setRatingType("")
      setModalTitle("")
      setModalSubtitle("")
      if (rating > 0) {
         onFeedbackSent(ratingType, rating, feedback)
      }
   }

   useEffect(() => {
      checkPermissions()
   }, [])

   // Method for checking if iOS application was closed (opened in the background) and return to it
   // If it happens, we rerender the webview, so it does not have blank screen
   useEffect(() => {
      const subscription = AppState.addEventListener("change", (state) => {
         if (state === "active" && webViewRef?.current) {
            webViewRef.current.injectJavaScript(`
               if (document.body.innerHTML.trim() === '') {
                  window.location.reload();
               }
               true;
            `)
         }
      })

      return () => subscription.remove()
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
            if (permissionsWereMissing) {
               setHasAudioPermissions(true)
               setHasVideoPermissions(true)
               onRefresh()
            }
         } else {
            setHasAudioPermissions(audioGranted)
            setHasVideoPermissions(videoGranted)
         }
      } catch (e) {
         console.log("ERROR")
         console.log(e)
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
            case MESSAGING_TYPE.FEEDBACK:
               return handleFeedback(data as FEEDBACK)
            default:
               break
         }
      } catch (error) {
         console.error("Failed to parse message from WebView:", error)
      }
   }

   const handleUserAuth = async (data: USER_AUTH) => {
      try {
         await Promise.all([
            SecureStore.setItemAsync("authToken", data.token),
            SecureStore.setItemAsync("userId", data.userId),
            SecureStore.setItemAsync("userPassword", data.userPassword),
         ])
         onTokenInjected()
      } catch (error) {
         console.error("Failed to store auth data:", error)
      }
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

   const handleFeedback = (feedback: FEEDBACK) => {
      setModalVisible(true)
      setRatingType(feedback.ratingType)
      setModalTitle(feedback.title)
      setModalSubtitle(feedback.subtitle)
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
      }
   }

   const handleNavigation = (request: any) => {
      if (request.url === "about:blank") {
         return false // Stop loading the blank page
      } else {
         if (!request.url.includes(SEARCH_CRITERIA)) {
            if (isValidUrl(request.url)) {
               // iOS calls for all types of navigation (including the non-restrictive
               // "other", which causes issues for internal links like cookies).
               if (
                  Platform.OS === "ios" &&
                  request.navigationType !== "click"
               ) {
                  return false
               }
               Linking.openURL(request.url)
            }
            return false // Prevent WebView from loading the external link
         }
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
            allowsFullscreenVideo={true}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleNavigation}
            cacheEnabled={true}
            incognito={false}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            cacheMode="LOAD_NO_CACHE"
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
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
            setSupportMultipleWindows={false}
            androidHardwareAccelerationDisabled={false} // Use hardware acceleration
            mixedContentMode="always"
            overScrollMode="never" // Disable over-scrolling for smoother behavior
            nestedScrollEnabled={true} // Improves nested scrolling behavior
            scrollEnabled={true}
            allowsBackForwardNavigationGestures={true}
            injectedJavaScript={`(function() {
                 window._hjSettings = null;
                 window.hj = null;
                 var style = document.createElement('style');
                 style.innerHTML = \`${injectedCSS}\`;
                 document.head.appendChild(style);
              })();`}
            allowFileAccess={true} // Allow service worker support for firebase offline caching
            allowUniversalAccessFromFileURLs={true} // Allow service worker support for firebase offline
            javaScriptCanOpenWindowsAutomatically={true} // Reduce delay in javascript execution
            renderToHardwareTextureAndroid={true} // Improve performance on android
         />

         <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
         >
            <View style={styles.modalOverlay}>
               <View style={styles.modalContent}>
                  <ScrollView contentContainerStyle={{ alignItems: "center" }}>
                     <Text style={styles.title}>{modalTitle}</Text>
                     <Text style={styles.subtitle}>{modalSubtitle}</Text>
                     <Rating
                        type="star"
                        startingValue={1}
                        imageSize={30}
                        onFinishRating={setRating}
                        minValue={1}
                        style={{ paddingVertical: 10 }}
                     />
                     <TextInput
                        style={styles.feedbackInput}
                        placeholder="Leave a comment if you want to..."
                        placeholderTextColor="#888"
                        value={feedback}
                        onChangeText={setFeedback}
                        multiline={true}
                        numberOfLines={6}
                     />
                     <TouchableOpacity
                        onPress={handleSubmit}
                        style={styles.submitButton}
                     >
                        <Text style={styles.submitButtonText}>Submit</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton}
                     >
                        <Text style={styles.closeButtonText}>Close</Text>
                     </TouchableOpacity>
                  </ScrollView>
               </View>
            </View>
         </Modal>

         <Modal
            animationType="slide"
            transparent={true}
            visible={redirectModalVisible}
            onRequestClose={() => setRedirectModalVisible(false)}
         >
            <View style={styles.modalOverlay}>
               <View style={styles.modalContent}>
                  <ScrollView contentContainerStyle={{ alignItems: "center" }}>
                     <Text style={styles.title}>
                        If you would like to rate us on Store as well?
                     </Text>
                     <Text style={styles.subtitle}>
                        We would appreciate it!
                     </Text>
                     <TouchableOpacity
                        onPress={openStore}
                        style={styles.submitButton}
                     >
                        <Text style={styles.submitButtonText}>Rate</Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                        onPress={closeRedirectModal}
                        style={styles.closeButton}
                     >
                        <Text style={styles.closeButtonText}>Close</Text>
                     </TouchableOpacity>
                  </ScrollView>
               </View>
            </View>
         </Modal>
      </SafeAreaView>
   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
   },
   rateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#3bbba5",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
   },
   rateText: {
      color: "white",
      fontSize: 16,
      marginLeft: 8,
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
   },
   modalContent: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "90%",
   },
   title: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
   },
   subtitle: {
      fontSize: 16,
      color: "#555",
      marginBottom: 20,
   },
   feedbackInput: {
      width: "100%",
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      color: "#333",
      marginTop: 10,
      textAlignVertical: "top", // Keeps text aligned at the top
   },
   submitButton: {
      marginTop: 20,
      backgroundColor: "#3bbba5",
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 25,
   },
   submitButtonText: {
      color: "white",
      fontSize: 16,
   },
   closeButton: {
      marginTop: 10,
      backgroundColor: "#ff6347",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
   },
   closeButtonText: {
      color: "white",
      fontSize: 16,
   },
})

export default WebViewComponent
