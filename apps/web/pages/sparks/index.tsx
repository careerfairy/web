import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps } from "next"
import { encode } from "querystring"

/**
 *  This page is used to redirect to the next spark if a user lands on the /sparks page.
 */
export default function Sparks() {
   // This will probably never be rendered if you always have sparks.
   return <div>No sparks available.</div>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
   // const { lookup } = await import("geoip-lite")
   const { req, query } = context

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

   // const ipAddress =
   // context.req.headers["x-forwarded-for"] || context.req.connection.remoteAddress || context.req.socket.remoteAddress

   console.log(
      "🚀 ~ constgetServerSideProps:GetServerSideProps= ~ ipAddress:",
      ipAddress
   )

   // Use geoip-lite to get geolocation data based on the IP address
   // const geo = lookup(ipAddress as string)

   // const anonymousUserCountryCode = geo ? geo.country : null
   // console.log(
   //    "🚀 ~ constgetServerSideProps:GetServerSideProps= ~ anonymousUserCountryCode:",
   //    anonymousUserCountryCode
   // )

   const sparks = await sparkService.fetchNextSparks(null, {
      numberOfSparks: 1,
      userId: null,
      anonymousUserCountryCode: "AL",
   })

   const queryParamString = encode(query)

   if (sparks.length > 0) {
      return {
         redirect: {
            destination: `/sparks/${sparks[0].id}${
               queryParamString && `?${queryParamString}&ipAddress=${ipAddress}`
            }`,
            permanent: false,
         },
      }
   }

   return {
      props: {},
   }
}
