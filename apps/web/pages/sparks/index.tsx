import { sparkService } from "data/firebase/SparksService"
import { GetStaticProps } from "next"

/**
 *  This page is used to redirect to the next spark if a user lands on the /sparks page.
 */
export default function Sparks() {
   // This will probably never be rendered if you always have sparks.
   return <div>No sparks available.</div>
}

export const getStaticProps: GetStaticProps = async () => {
   const sparks = await sparkService.fetchNextSparks(null, {
      numberOfSparks: 1,
      userId: null,
   })

   // If there are no sparks, return empty props or handle accordingly
   if (sparks.length === 0) {
      return { props: {}, revalidate: 1 } // Revalidate after 1 second to check for new sparks
   }

   // Redirect to the first spark found
   return {
      redirect: {
         destination: `/sparks/${sparks[0].id}`,
         permanent: false,
      },
      revalidate: 10, // Revalidate page every 10 seconds
   }
}
