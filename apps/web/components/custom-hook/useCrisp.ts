import { useEffect } from "react"

const useCrisp = () => {
   useEffect(() => {
      window.$crisp = []
      window.CRISP_WEBSITE_ID = "b8c454ce-84e4-4039-b6b4-203b2c86ea66"
      ;(() => {
         const d = document
         const s = d.createElement("script")
         s.src = "https://client.crisp.chat/l.js"
         s.async = 1
         d.getElementsByTagName("body")[0].appendChild(s)
      })()
   })
   return {}
}

export default useCrisp
