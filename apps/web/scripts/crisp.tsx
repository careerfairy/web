declare global {
   interface Window {
      $crisp: any[]
      CRISP_READY_TRIGGER: () => void
      CRISP_TOKEN_ID: string
   }
}

if (typeof window !== "undefined") {
   window.$crisp = window.$crisp || []
}

const CRISP_WEBSITE_ID = "b8c454ce-84e4-4039-b6b4-203b2c86ea66"

export const getNickname = (email: string) => {
   const str = email.split("@")[0]
   return str.charAt(0).toUpperCase() + str.slice(1)
}

export const showChatBox = () => {
   window.$crisp.push(["do", "chat:show"])
}

export const hideChatBox = () => {
   window.$crisp.push(["do", "chat:hide"])
}

export const openChatBox = () => {
   window.$crisp.push(["do", "chat:open"])
}

export const closeAndHideChatBot = () => {
   window.$crisp.push(["do", "chat:close"])
   window.$crisp.push(["do", "chat:hide"])
}

export const openAndShowChatBot = () => {
   window.$crisp.push(["do", "chat:open"])
   window.$crisp.push(["do", "chat:show"])
}

export const toggleChatBox = () => {
   window.$crisp.push(["do", "chat:toggle"])
}

export const closeChatBox = () => {
   window.$crisp.push(["do", "chat:close"])
}

export const setCrispEmail = (email: string, signature: string) => {
   window.$crisp.push(["set", "user:email", [email, signature]])
   window.$crisp.push(["set", "user:nickname", [getNickname(email)]])
}

export const reverseChatBoxPosition = (reverse: boolean) => {
   window.$crisp.push(["config", "position:reverse", [reverse]])
}

export const buildCrispEmbedURL = (email: string, uid: string) => {
   const baseUrl = new URL(
      `https://go.crisp.chat/chat/embed/?website_id=${CRISP_WEBSITE_ID}`
   )

   if (email) {
      baseUrl.searchParams.append("user_email", email)
   }

   if (uid) {
      baseUrl.searchParams.append("token_id", uid)
      baseUrl.searchParams.append("session_merge", "true")
   }

   return baseUrl.toString()
}
