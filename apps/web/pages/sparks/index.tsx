import { sparkService } from "data/firebase/SparksService"
import geoip from "geoip-lite"
import { GetServerSideProps } from "next"
import path from "path"
import { encode } from "querystring"

/**
 *  This page is used to redirect to the next spark if a user lands on the /sparks page.
 */
export default function Sparks() {
   // This will probably never be rendered if you always have sparks.
   return <div>No sparks available.</div>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
   const { req, query } = context

   console.log(`Current working directory: ${process.cwd()}`)

   const dataPath = path.join(process.cwd(), "public/geoip-countries")
   geoip.setDataPath(dataPath)

   // default to using req.socket.remoteAddress
   let ipAddress = req.socket.remoteAddress

   if (req.headers["x-forwarded-for"]) {
      const forwarded = req.headers["x-forwarded-for"]
      if (Array.isArray(forwarded)) {
         ipAddress = forwarded[0].split(",")[0].trim()
      } else {
         ipAddress = forwarded.split(",")[0].trim()
      }
   }

   console.log(
      "🚀 ~ constgetServerSideProps:GetServerSideProps= ~ ipAddress:",
      ipAddress
   )

   // Use geoip-lite to get geolocation data based on the IP address
   const geo = geoip.lookup(ipAddress)

   const anonymousUserCountryCode = geo ? geo.country : ""
   console.log(
      "🚀 ~ constgetServerSideProps:GetServerSideProps= ~ anonymousUserCountryCode:",
      anonymousUserCountryCode
   )

   let sparks = await sparkService.fetchNextSparks(null, {
      numberOfSparks: 1,
      userId: null,
      anonymousUserCountryCode: anonymousUserCountryCode,
   })

   console.log(
      "🚀 ~ constgetServerSideProps:GetServerSideProps= ~ sparks:",
      sparks
   )

   if (sparks.length === 0) {
      sparks = await sparkService.fetchNextSparks(null, {
         numberOfSparks: 1,
         userId: null,
      })
   }

   const queryParamString = encode(query)

   if (sparks.length > 0) {
      return {
         redirect: {
            destination: `/sparks/${sparks[0].id}?ipAddress=${ipAddress}${
               queryParamString && `&${queryParamString}`
            }`,
            permanent: false,
         },
      }
   }

   return {
      props: {},
   }
}
