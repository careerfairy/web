import {
   CONSOLE,
   HAPTIC,
   IDENTIFY_CUSTOMER,
   MESSAGING_TYPE,
   NativeEvent,
   NativeEventStringified,
   PERMISSIONS,
   TRACK_EVENT,
   TRACK_SCREEN,
   USER_AUTH,
} from "@careerfairy/shared-lib/src/messaging"
import { BASE_URL, INCLUDES_PERMISSIONS, SEARCH_CRITERIA } from "@env"
import { Audio } from "expo-av"
import { Camera } from "expo-camera"
import * as Notifications from "expo-notifications"
import * as ScreenOrientation from "expo-screen-orientation"
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
import { customerIO } from "../utils/customerio-tracking"

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

const careerfairyUrls = [
   "https://www.careerfairy.io/terms",
   "https://www.careerfairy.io/data-protection",
   "http://127.0.0.1:3000/terms", // iOS Localhost
   "http://127.0.0.1:3000/data-protection", // iOS Localhost
   "http://10.0.2.2:3000/terms", // Android Localhost
   "http://10.0.2.2:3000/data-protection", // Android Localhost
   "https://support.careerfairy.io",
]

const agoraPages = ["/streaming/host", "/streaming/viewer"]

const nativeAppUrlsWhiteList = [
   "https://calendar.google.com",
   "https://outlook.live.com",
   "https://calendar.yahoo.com",
   "data:text/calendar",
   "https://europe-west1-careerfairy-e1fd9.cloudfunctions.net/getLivestreamICalendarEvent",
]

const isUrlInNativeWhitelist = (url: string): boolean => {
   try {
      return nativeAppUrlsWhiteList.some((whitelistedUrl) =>
         url.startsWith(whitelistedUrl)
      )
   } catch {
      return false
   }
}

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
   const [currentUrl, setCurrentUrl] = useState(baseUrl)
   const webViewRef = useRef<WebView>(null)
   const [hasAudioPermissions, setHasAudioPermissions] = useState(false)
   const [hasVideoPermissions, setHasVideoPermissions] = useState(false)
   const [refreshKey, setRefreshKey] = useState(0)
   const refreshAfterExternalActivityRef = useRef(false)

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

         console.debug(`🚀 ~ handleMessage ~ type: ${type} ~ data: ${data}`)
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
            case MESSAGING_TYPE.CLEAR_CUSTOMER:
               return handleClearCustomer()
            case MESSAGING_TYPE.IDENTIFY_CUSTOMER:
               return handleIdentifyCustomer(data)
            case MESSAGING_TYPE.TRACK_EVENT:
               return handleTrackEvent(data)
            case MESSAGING_TYPE.TRACK_SCREEN:
               return handleTrackScreen(data)
            default:
               break
         }
      } catch (error) {
         console.error("Failed to parse message from WebView:", error)
      }
   }

   const handleClearCustomer = async () => {
      try {
         await customerIO.clearCustomer()
      } catch (error) {
         console.error(`Failed to clear customer: ${error}`)
      }
   }

   const handleIdentifyCustomer = async (data: IDENTIFY_CUSTOMER) => {
      try {
         await customerIO.identifyCustomer(data.userAuthId)
      } catch (error) {
         console.error(`Failed to identify customer: ${error}`)
      }
   }

   const handleTrackEvent = async (data: TRACK_EVENT) => {
      try {
         await customerIO.trackEvent(data.eventName, data.properties)
      } catch (error) {
         console.error(`Failed to track event: ${error}`)
      }
   }

   const handleTrackScreen = async (data: TRACK_SCREEN) => {
      try {
         await customerIO.trackScreen(data.screenName, data.properties)
      } catch (error) {
         console.error(`Failed to track screen: ${error}`)
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
      setCurrentUrl(url)
      if (
         url?.includes(INCLUDES_PERMISSIONS) &&
         (!hasAudioPermissions || !hasVideoPermissions)
      ) {
         return requestPermissions()
      }
   }

   const isExternalNavigation = (request: InterceptedRequest) => {
      if (careerfairyUrls.some((link) => request.url.startsWith(link))) {
         return true
      }

      // Special case for auth iframe and blank pages
      if (request.url === "about:blank") {
         return false
      }

      // Check if it's a localhost URL
      if (isLocalHost(request.url)) {
         return false
      }

      try {
         const urlObj = new URL(request.url)
         // Check if the URL is within your domain
         return !urlObj.hostname.includes(SEARCH_CRITERIA) && request.loading
      } catch {
         return false // Invalid URL
      }
   }

   const isAndroid = Platform.OS === "android"

   const isAgoraPage = agoraPages.some((page) => currentUrl.includes(page))

   const openOnWebBrowser = useCallback(
      async (url: string) => {
         const options: WebBrowser.WebBrowserOpenOptions = {}

         // Must do double bang to ensure boolean, sometimes in react native booleans don't evaluate until some operation is performed on them
         if (isAndroid && isAgoraPage) {
            refreshAfterExternalActivityRef.current = true
         }

         if (isAndroid && defaultBrowser) {
            options.browserPackage = defaultBrowser
         }

         WebBrowser.openBrowserAsync(url, options)
      },
      [defaultBrowser, isAgoraPage]
   )

   const handleNavigation = (request: InterceptedRequest) => {
      const isIframe = request.isTopFrame === false

      if (
         request.url.includes(
            "careerfairy-e1fd9.firebaseapp.com/__/auth/iframe"
         )
      ) {
         // Blocking auth iframe navigation for security
         return false
      }

      if (request.url === "about:blank") {
         // Blocking about:blank page load
         return false
      } else if (isUrlInNativeWhitelist(request.url)) {
         // Opening mailto link externally
         if (isAndroid && isAgoraPage) {
            refreshAfterExternalActivityRef.current = true
         }
         Linking.openURL(request.url)
         return false
      } else {
         if (!request.url.includes(SEARCH_CRITERIA)) {
            if (isValidUrl(request.url)) {
               if (
                  isIframe && // Skip iframe navigation requests (e.g. cookie consent, tracking pixels, etc)
                  Platform.OS === "ios" &&
                  request.navigationType !== "click"
               ) {
                  // Blocking non-click navigation to prevent cookie issues
                  return false
               }
               openOnWebBrowser(request.url)
            }
            // Preventing WebView from loading external link
            return false
         }

         if (isExternalNavigation(request) && !isIframe) {
            openOnWebBrowser(request.url)
            return false
         }
      }
      return true
   }

   const handleContentProcessTerminate = () => {
      console.error("[WebView] Content process terminated", {
         timestamp: new Date().toISOString(),
         url: baseUrl,
      })
      setRefreshKey((prev) => prev + 1)
      refreshAfterExternalActivityRef.current = true
      refreshWebAppOnResume()
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
      refreshAfterExternalActivityRef.current = true
      refreshWebAppOnResume()
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
         refreshAfterExternalActivityRef.current
      ) {
         refreshWebAppOnResume()
         refreshAfterExternalActivityRef.current = false
      }
   }

   const refreshWebAppOnResume = () => {
      if (!webViewRef.current) return

      // Send message to web app that the app has resumed from external link
      const message: NativeEvent = {
         type: MESSAGING_TYPE.WEBVIEW_RESUMED,
         data: null,
      }
      const messageString = JSON.stringify(message)

      webViewRef.current.postMessage(messageString)
   }

   /**
    * Only allow landscape orientation when on streaming page
    */
   useEffect(() => {
      const handleScreenOrientation = async () => {
         try {
            if (isAgoraPage) {
               await ScreenOrientation.unlockAsync()
            } else {
               await ScreenOrientation.lockAsync(
                  ScreenOrientation.OrientationLock.PORTRAIT_UP
               )
            }
         } catch (error) {
            console.error("Failed to update screen orientation:", error)
         }
      }

      handleScreenOrientation()
   }, [isAgoraPage, baseUrl])

   return (
      <SafeAreaView style={styles.container}>
         <WebView
            key={refreshKey + 1}
            style={styles.flex}
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
   container: {
      flex: 1,
      paddingTop: StatusBar.currentHeight,
   },
   flex: {
      flex: 1,
   },
})

export default WebViewComponent
