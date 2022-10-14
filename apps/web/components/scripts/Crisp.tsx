import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import useCrispSignature from "../custom-hook/useCrispSignature"
import { useAuth } from "../../HOCs/AuthProvider"

declare global {
   interface Window {
      $crisp: any[]
      CRISP_WEBSITE_ID: string
      CRISP_TOKEN_ID: string
      CRISP_READY_TRIGGER: () => void
   }
}

const websiteId = "b8c454ce-84e4-4039-b6b4-203b2c86ea66"

const pathsToHideChatBox = [
   // "/streaming/[livestreamId]/viewer",
   // "/streaming/[livestreamId]/joining-streamer",
   // "/streaming/[livestreamId]/main-streamer",
   // "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/viewer",
   // "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/joining-streamer",
   // "/streaming/[livestreamId]/breakout-room/[breakoutRoomId]/main-streamer",
]

const Crisp = () => {
   const { pathname } = useRouter()

   const { authenticatedUser } = useAuth()

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
      if (!authenticatedUser.isLoaded) return

      window.$crisp = []
      window.CRISP_WEBSITE_ID = websiteId
      window.CRISP_TOKEN_ID = authenticatedUser.uid || ""

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [authenticatedUser.isLoaded])

   return null
}

/*
 * To be dynamically imported into _app.tsx with ssr=false when we want to use crisp
 * throughout the app instead of just the iframe in the stream left menu
 * */
export default Crisp

export const getNickname = (email: string) => {
   const str = email.split("@")[0]
   return str.charAt(0).toUpperCase() + str.slice(1)
}

export const showChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:show"])
   }
}

export const hideChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:hide"])
   }
}

export const openChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:open"])
   }
}

export const closeAndHideChatBot = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:close"])
      window.$crisp.push(["do", "chat:hide"])
   }
}

export const openAndShowChatBot = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:open"])
      window.$crisp.push(["do", "chat:show"])
   }
}

export const toggleChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:toggle"])
   }
}

export const closeChatBox = () => {
   if (window.$crisp) {
      window.$crisp.push(["do", "chat:close"])
   }
}

export const setEmail = (data: { email: string; signature: string }) => {
   if (window.$crisp) {
      window.$crisp.push(["set", "user:email", [data.email, data.signature]])
      window.$crisp.push(["set", "user:nickname", [getNickname(data.email)]])
   }
}

export const setHideChatOnClose = (hide: boolean) => {
   if (window.$crisp) {
      window.$crisp.push(["on", "chat:closed", hide ? hideChatBox : () => {}])
   }
}

export const reverseChatBoxPosition = (reverse: boolean) => {
   if (window.$crisp) {
      window.$crisp.push(["config", "position:reverse", [reverse]])
   }
}
