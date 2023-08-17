import { sparkService } from "data/firebase/SparksService"
import { GetServerSideProps } from "next"

/**
 *  This page is used to redirect to the next spark if a user lands on the /sparks page.
 */
export default function Sparks() {
   // This will probably never be rendered if you always have sparks.
   return <div>No sparks available.</div>
}

export const getServerSideProps: GetServerSideProps = async (context) => {
   const sparks = await sparkService.fetchNextSparks(null, {
      numberOfSparks: 1,
      userId: null,
   })

   if (sparks.length > 0) {
      const ttl = process.env.NODE_ENV === "development" ? 1 : 60 * 60 * 24 * 1 // 1 day in production, 1 second in development

      context.res.setHeader(
         "Cache-Control",
         `public, s-maxage=${ttl}, stale-while-revalidate=${ttl}`
      )

      return {
         redirect: {
            destination: `/sparks/${sparks[0].id}`,
            permanent: false,
         },
      }
   }

   return {
      props: {},
   }
}
