import React, { useEffect, useMemo } from "react"
import { useAuth } from "../HOCs/AuthProvider"
import * as crypto from "crypto"
import Script from "next/script"
declare global {
   interface Window {
      Beacon?: (...args: any[]) => void
   }
}
const HelpScoutBeaconScript = () => {
   const { authenticatedUser, userData, isLoggedIn, isLoggedOut } = useAuth()
   console.log("-> authenticatedUser", authenticatedUser)
   console.log("-> userData", userData)

   const signature = useMemo(
      () =>
         crypto
            .createHmac(
               "sha256",
               process.env.NEXT_PUBLIC_HELP_SCOUT_STREAMING_SECRET_BEACON_KEY
            )
            .update(authenticatedUser?.email || "")
            .digest("hex"),
      [authenticatedUser?.email]
   )
   console.log("-> signature", signature)

   const info = useMemo(
      () => ({
         email: authenticatedUser?.email || "",
         name: [userData?.firstName, userData?.lastName]
            .filter(Boolean)
            .join(" "),
      }),
      [authenticatedUser?.email, userData?.firstName, userData?.lastName]
   )
   console.log("-> info", info)

   useEffect(() => {
      window?.Beacon?.("identify", {
         email: info.email,
         name: info.name,
         signature: signature,
      })
      console.log("-> window?.Beacon", window?.Beacon)
   }, [info.email, info.name, signature])
   console.log("-> isLoggedIn", isLoggedIn)
   console.log("-> isLoggedOut", isLoggedOut)

   if ((!isLoggedIn && !isLoggedOut) || (isLoggedIn && !info.name)) return null

   console.log("-> In the script")

   return (
      <>
         <Script type="text/javascript" id="hs-loader" strategy="lazyOnload">
            {`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}
         </Script>
         <Script type="text/javascript" id="hs-init" strategy="lazyOnload">
            {`window.Beacon('init', '1143c2ec-d427-4f1f-819d-94cb29bda4ff');`}
         </Script>
         {/*<Script*/}
         {/*   key={JSON.stringify(info)}*/}
         {/*   type="text/javascript"*/}
         {/*   id="hs-identify"*/}
         {/*   strategy="lazyOnload"*/}
         {/*>*/}
         {/*   {` window.Beacon('identify', {*/}
         {/*         email: '${info.email}',*/}
         {/*         name: '${info.name}',*/}
         {/*         signature: '${signature}',*/}
         {/*         });`}*/}
         {/*</Script>*/}
      </>
   )
   return (
      <>
         <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
               __html: `!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`,
            }}
         />
         <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
               __html: `
                window.Beacon('identify', {
                  email: '${info.email}',
                  name: '${info.name}',
                  signature: '${signature}',
                  })`,
            }}
         />
         <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
               __html: `window.Beacon('init', '1143c2ec-d427-4f1f-819d-94cb29bda4ff')`,
            }}
         />
      </>
   )
}

export default HelpScoutBeaconScript
