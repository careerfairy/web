import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import UAParser from "ua-parser-js"

const APP_STORE_LINK =
   "https://play.google.com/store/apps/details?id=com.admin_product_team.careerfairymobileapp"
const GOOGLE_STORE_LINK =
   "https://play.google.com/store/apps/details?id=com.admin_product_team.careerfairymobileapp"

export const getServerSideProps: GetServerSideProps = async (context) => {
   const userAgent = context.req.headers["user-agent"] || ""
   // @ts-ignore
   const parser = new UAParser(userAgent)
   const os = parser.getOS().name || ""

   // Redirection logic based on OS
   let destination: string | null = null
   if (os?.includes("iOS") || os?.includes("macOS")) {
      destination = APP_STORE_LINK
   } else {
      destination = GOOGLE_STORE_LINK
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
      props: {},
   }
}

const DetectOS: React.FC = () => {
   const router = useRouter()

   useEffect(() => {
      router.push("/")
   })

   return null
}

export default DetectOS
