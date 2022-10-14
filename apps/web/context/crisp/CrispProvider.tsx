import React, { FC, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import useCrispSignature from "../../components/custom-hook/useCrispSignature"

declare global {
   interface Window {
      $crisp: any[]
      CRISP_WEBSITE_ID: string
      CRISP_READY_TRIGGER: () => void
   }
}
const websiteId = "b8c454ce-84e4-4039-b6b4-203b2c86ea66"

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

const getNickname = (email: string) => {
   const str = email.split("@")[0]
   return str.charAt(0).toUpperCase() + str.slice(1)
}

const showChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:show"])
   }
}

const hideChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:hide"])
   }
}

const openChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:open"])
   }
}

const closeAndHideChatBot = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:close"])
      window.$crisp.push(["do", "chat:hide"])
   }
}

const openAndShowChatBot = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:open"])
      window.$crisp.push(["do", "chat:show"])
   }
}

const toggleChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:toggle"])
   }
}

const closeChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:close"])
   }
}

const setEmail = (data: { email: string; signature: string }) => {
   if (window.$crisp) {
      window.$crisp.push(["set", "user:email", [data.email, data.signature]])
      window.$crisp.push(["set", "user:nickname", [getNickname(data.email)]])
   }
}

const setHideChatOnClose = (hide: boolean) => {
   if (window.$crisp) {
      window.$crisp.push(["on", "chat:closed", hide ? hideChatBox : () => {}])
   }
}

const reverseChatBoxPosition = (reverse: boolean) => {
   if (window.$crisp) {
      window.$crisp.push(["config", "position:reverse", [reverse]])
   }
}

const pathsToHideChatBox = [
   "/streaming/[livestreamId]/viewer",
   "/streaming/[livestreamId]/joining-streamer",
   "/streaming/[livestreamId]/main-streamer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/viewer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/joining-streamer",
   "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/main-streamer",
]

const CrispProvider: FC = ({ children }) => {
   const { pathname } = useRouter()

   const data = useCrispSignature()

   const [crispLoaded, setCrispLoaded] = useState(false)

   useEffect(() => {
      // Update the signature if the user changes
      if (data?.email && data?.signature) {
         // https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/identity-verification/ (set email)
         setEmail(data)
      }
   }, [data, data?.email, data?.signature])

   useEffect(() => {
      if (!crispLoaded) return

      if (pathsToHideChatBox.includes(pathname)) {
         setHideChatOnClose(true)
      }

      return () => {
         showChatBox()
         setHideChatOnClose(false)
      }
   }, [pathname, crispLoaded])

   useEffect(() => {
      window.$crisp = []
      window.CRISP_WEBSITE_ID = websiteId

      //https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/dollar-crisp/#use-crisp-before-it-is-ready
      window.CRISP_READY_TRIGGER = function () {
         setCrispLoaded(true)
         hideChatBox()
      }
      ;(() => {
         const d = document
         const s = d.createElement("script")
         s.src = "https://client.crisp.chat/l.js"
         s.async = Boolean(1)
         d.getElementsByTagName("body")[0].appendChild(s)
      })()

      return () => {
         window.$crisp = []
      }
   }, [])

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
      []
   )

   return (
      <CrispContext.Provider value={value}>{children}</CrispContext.Provider>
   )
}

export const useCrisp = () => useContext(CrispContext) // To be used when we want to use crisp outside of the embedded chatbox iframe

export default CrispProvider // To be used when we want to use crisp outside of the embedded chatbox iframe
