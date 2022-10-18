import React, {
   FC,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useRouter } from "next/router"
import { useAuth } from "../../HOCs/AuthProvider"
import useCrispSignature from "../../components/custom-hook/useCrispSignature"

declare global {
   interface Window {
      $crisp: any[]
      CRISP_READY_TRIGGER: () => void
      CRISP_TOKEN_ID: string
   }
}

type CrispContextType = {
   openChatBox: () => void
   closeChatBox: () => void
   toggleChatBox: () => void
   showChatBox: () => void
   openAndShowChatBot: () => void
   closeAndHideChatBot: () => void
   setHideChatOnClose: (hide: boolean) => void
   getNickname: (email: string) => string
   reverseChatBoxPosition: (reverse: boolean) => void
}
const CrispContext = React.createContext<CrispContextType>({
   openChatBox: () => {},
   closeChatBox: () => {},
   toggleChatBox: () => {},
   showChatBox: () => {},
   openAndShowChatBot: () => {},
   closeAndHideChatBot: () => {},
   setHideChatOnClose: () => {},
   getNickname: () => "",
   reverseChatBoxPosition: () => {},
})

const pathsToHideChatBox = []

const CrispProvider: FC = ({ children }) => {
   const { pathname } = useRouter()

   const { authenticatedUser } = useAuth()

   const data = useCrispSignature()

   const [crispLoaded, setCrispLoaded] = useState(false)

   useEffect(() => {
      window.CRISP_READY_TRIGGER = function () {
         setCrispLoaded(true)
      }
   }, [])

   useEffect(() => {
      window.CRISP_TOKEN_ID = authenticatedUser.uid || ""
   }, [authenticatedUser.uid, crispLoaded])

   const getNickname = useCallback((email: string) => {
      const str = email.split("@")[0]
      return str.charAt(0).toUpperCase() + str.slice(1)
   }, [])

   const showChatBox = useCallback(() => {
      if (crispLoaded) {
         window.$crisp.push(["do", "chat:show"])
      }
   }, [crispLoaded])

   const hideChatBox = useCallback(() => {
      if (crispLoaded) {
         window.$crisp.push(["do", "chat:hide"])
      }
   }, [crispLoaded])

   const openChatBox = useCallback(() => {
      if (crispLoaded) {
         window.$crisp.push(["do", "chat:open"])
      }
   }, [crispLoaded])

   const closeAndHideChatBot = useCallback(() => {
      if (crispLoaded) {
         window.$crisp.push(["do", "chat:close"])
         window.$crisp.push(["do", "chat:hide"])
      }
   }, [crispLoaded])

   const openAndShowChatBot = useCallback(() => {
      if (crispLoaded) {
         window.$crisp.push(["do", "chat:open"])
         window.$crisp.push(["do", "chat:show"])
      }
   }, [crispLoaded])

   const toggleChatBox = useCallback(() => {
      if (crispLoaded) {
         window.$crisp.push(["do", "chat:toggle"])
      }
   }, [crispLoaded])

   const closeChatBox = useCallback(() => {
      if (crispLoaded) {
         window.$crisp.push(["do", "chat:close"])
      }
   }, [crispLoaded])

   const setEmail = useCallback(
      (data: { email: string; signature: string }) => {
         if (crispLoaded) {
            window.$crisp.push([
               "set",
               "user:email",
               [data.email, data.signature],
            ])
            window.$crisp.push([
               "set",
               "user:nickname",
               [getNickname(data.email)],
            ])
         }
      },
      [crispLoaded, getNickname]
   )

   const setHideChatOnClose = useCallback(
      (hide: boolean) => {
         if (crispLoaded) {
            window.$crisp.push([
               "on",
               "chat:closed",
               hide ? hideChatBox : () => {},
            ])
         }
      },
      [crispLoaded, hideChatBox]
   )

   const reverseChatBoxPosition = useCallback(
      (reverse: boolean) => {
         if (crispLoaded) {
            window.$crisp.push(["config", "position:reverse", [reverse]])
         }
      },
      [crispLoaded]
   )

   useEffect(() => {
      // Update the signature if the user changes
      if (data?.email && data?.signature && crispLoaded) {
         // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/identity-verification/ (set email)
         setEmail(data)
      }
   }, [data, crispLoaded, setEmail])

   useEffect(() => {
      if (!crispLoaded) return

      if (pathsToHideChatBox.includes(pathname)) {
         hideChatBox()
         setHideChatOnClose(true)
      }

      return () => {
         showChatBox()
         setHideChatOnClose(false)
      }
   }, [pathname, crispLoaded, setHideChatOnClose, showChatBox, hideChatBox])

   const value = useMemo(
      () => ({
         openChatBox,
         closeChatBox,
         toggleChatBox,
         showChatBox,
         closeAndHideChatBot,
         openAndShowChatBot,
         setHideChatOnClose,
         getNickname,
         reverseChatBoxPosition,
      }),
      [
         closeAndHideChatBot,
         closeChatBox,
         getNickname,
         openAndShowChatBot,
         openChatBox,
         reverseChatBoxPosition,
         setHideChatOnClose,
         showChatBox,
         toggleChatBox,
      ]
   )

   return (
      <CrispContext.Provider value={value}>{children}</CrispContext.Provider>
   )
}

export const useCrisp = () => useContext(CrispContext) // To be used when we want to use crisp outside of the embedded chatbox iframe

export default CrispProvider // To be used when we want to use crisp outside of the embedded chatbox iframe
