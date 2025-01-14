import {
   CONSOLE,
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
import * as WebBrowser from "expo-web-browser"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
   AppState,
   AppStateStatus,
   BackHandler,
   Linking,
   Platform,
   SafeAreaView,
   StatusBar,
   StyleSheet,
} from "react-native"
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
}

type InterceptedRequest = {
   hasTargetFrame: boolean
   mainDocumentURL: string
   canGoBack: boolean
   title: string
   isTopFrame: boolean
   canGoForward: boolean
   target: number
   lockIdentifier: number
   url: string
   loading: boolean
   navigationType: string
}

const externalLinks = [
   "https://www.careerfairy.io/terms",
   "https://www.careerfairy.io/data-protection",
   "http://127.0.0.1:3000/terms", // iOS Localhost
   "http://127.0.0.1:3000/data-protection", // iOS Localhost
   "http://10.0.2.2:3000/terms", // Android Localhost
   "http://10.0.2.2:3000/data-protection", // Android Localhost
]

const isLocalHost = (url: string) => {
   return (
      url.startsWith("http://127.0.0.1") ||
      url.startsWith("http://localhost") ||
      url.startsWith("http://10.0.2.2")
   )
}

const WebViewComponent: React.FC<WebViewScreenProps> = ({
   onTokenInjected,
   onLogout,
}) => {
   const [baseUrl, setBaseUrl] = useState(BASE_URL + "/portal")
   const webViewRef = useRef<WebView>(null)
   const [hasAudioPermissions, setHasAudioPermissions] = useState(false)
   const [hasVideoPermissions, setHasVideoPermissions] = useState(false)
   const [refreshKey, setRefreshKey] = useState(0)
   const [shouldRefreshAppWhenReOpened, setShouldRefreshAppWhenReOpened] =
      useState(false)

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

   const [defaultBrowser, setDefaultBrowser] = useState<string | null>(null)

   useEffect(() => {
      const getDefaultBrowser = async () => {
         const browsers =
            await WebBrowser.getCustomTabsSupportingBrowsersAsync()
         if (browsers.browserPackages?.length > 0) {
            setDefaultBrowser(
               browsers.defaultBrowserPackage || browsers.browserPackages[0]
            )
         }
      }
      getDefaultBrowser()
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

   const handleWebAppConsoleMessage = (data: CONSOLE) => {
      console[data.type](
         `[WebView]:`,
         ...data.args.map((arg) => {
            try {
               return JSON.parse(arg)
            } catch (e) {
               return arg
            }
         })
      )
   }

   const handleMessage = (event: NativeEventStringified) => {
      try {
         const receivedData = JSON.parse(event.nativeEvent.data)

         const { type, data } = receivedData as NativeEvent

         switch (type) {
            case MESSAGING_TYPE.CONSOLE:
               return handleWebAppConsoleMessage(data)
            case MESSAGING_TYPE.USER_AUTH:
               return handleUserAuth(data)
            case MESSAGING_TYPE.HAPTIC:
               return handleHaptic(data)
            case MESSAGING_TYPE.PERMISSIONS:
               return handlePermissions(data)
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
      try {
         return Boolean(new URL(url))
      } catch {
         return false
      }
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

   const isExternalNavigation = (request: InterceptedRequest) => {
      if (externalLinks.includes(request.url)) {
         return true
      }

      if (isLocalHost(request.url)) {
         return false
      }

      return (
         !request.url.startsWith(`https://${SEARCH_CRITERIA}`) &&
         !request.url.startsWith(`https://www.${SEARCH_CRITERIA}`) &&
         !request.url.startsWith("about:") &&
         request.loading
      )
   }

   const isAndroid = Platform.OS === "android"

   const openOnWebBrowser = useCallback(
      (url: string) => {
         const options: WebBrowser.WebBrowserOpenOptions = {}

         if (isAndroid) {
            setShouldRefreshAppWhenReOpened(true)
         }

         if (isAndroid && defaultBrowser) {
            options.browserPackage = defaultBrowser
         }

         WebBrowser.openBrowserAsync(url, options)
      },
      [defaultBrowser]
   )

   const handleNavigation = (request: InterceptedRequest) => {
      if (
         request.url.includes(
            "careerfairy-e1fd9.firebaseapp.com/__/auth/iframe"
         )
      ) {
         // Block auth iframe navigation, we don't want to allow this
         return false
      }

      if (request.url === "about:blank") {
         openOnWebBrowser(request.url)
         return false // Stop loading the blank page
      } else if (request.url.startsWith("mailto:")) {
         isAndroid && setShouldRefreshAppWhenReOpened(true)
         Linking.openURL(request.url)
         return false
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
               openOnWebBrowser(request.url)
            }
            return false // Prevent WebView from loading the external link
         }

         if (isExternalNavigation(request)) {
            openOnWebBrowser(request.url)
            return false
         }
      }
      return true // Allow WebView to load internal links
   }

   const handleContentProcessTerminate = () => {
      console.error("[WebView] Content process terminated", {
         timestamp: new Date().toISOString(),
         url: baseUrl,
      })
      setRefreshKey((prev) => prev + 1)
   }

   const handleRenderProcessGone = (syntheticEvent: any) => {
      const { nativeEvent } = syntheticEvent
      console.error("[WebView] Render process crashed", {
         timestamp: new Date().toISOString(),
         didCrash: nativeEvent.didCrash,
         url: baseUrl,
         details: nativeEvent,
      })
      setRefreshKey((prev) => prev + 1)
   }

   useEffect(() => {
      const subscription = AppState.addEventListener(
         "change",
         handleAppStateChange
      )
      return () => {
         subscription.remove()
      }
   }, [])

   const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
         nextAppState === "active" &&
         webViewRef.current &&
         shouldRefreshAppWhenReOpened
      ) {
         // Send message to web app that the app has resumed from external link
         const message: NativeEvent = {
            type: MESSAGING_TYPE.WEBVIEW_RESUMED,
            data: null,
         }
         const messageString = JSON.stringify(message)
         webViewRef.current.postMessage(messageString)
         setShouldRefreshAppWhenReOpened(false) // Reset the state
      }
   }

   return (
      <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
         <WebView
            key={refreshKey + 1}
            style={{ flex: 1 }}
            ref={webViewRef}
            source={{ uri: baseUrl }}
            javaScriptEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={true}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={(request) => {
               return handleNavigation(request as InterceptedRequest)
            }}
            cacheEnabled={true}
            incognito={false}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            cacheMode="LOAD_NO_CACHE"
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            // @ts-ignore
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
            onContentProcessDidTerminate={handleContentProcessTerminate} // Automatically reload WebView when iOS/Android kills its process to free memory
            onRenderProcessGone={handleRenderProcessGone} // Recover from WebView crashes on Android by refreshing the view
         />
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
