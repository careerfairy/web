import { GetServerSideProps } from "next"
import React, { useEffect } from "react"
import UAParser from "ua-parser-js"

export const getServerSideProps: GetServerSideProps = async (context) => {
   const userAgent = context.req.headers["user-agent"] || ""
   // @ts-ignore
   const parser = new UAParser(userAgent)
   const os = parser.getOS().name || ""

   // Redirection logic based on OS
   let destination: string | null = null
   if (os?.includes("iOS") || os?.includes("macOS")) {
      destination =
         "https://play.google.com/store/apps/details?id=com.admin_product_team.careerfairymobileapp" // Replace with your App Store link
   } else {
      destination =
         "https://play.google.com/store/apps/details?id=com.admin_product_team.careerfairymobileapp" // Replace with your Google Play link
   }

   if (destination) {
      return {
         redirect: {
            destination,
            permanent: false,
         },
      }
   }

   return {
      props: { os }, // Pass the OS to the client as a fallback
   }
}

const DetectOS: React.FC<{ os: string }> = ({ os }) => {
   useEffect(() => {
      if (!os) {
         const userAgent = navigator.userAgent
         // @ts-ignore
         const parser = new UAParser(userAgent)
         const detectedOS = parser.getOS().name || ""

         // Redirect logic on the client
         if (detectedOS.includes("iOS") || detectedOS.includes("macOS")) {
            window.location.href = "https://www.sportsport.ba"
         } else {
            window.location.href =
               "https://play.google.com/store/apps/details?id=com.admin_product_team.careerfairymobileapp"
         }
      }
   }, [os])

   return null
}

export default DetectOS
