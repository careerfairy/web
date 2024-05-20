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
   let { sparks } = await sparkService.fetchFeed({
      numberOfSparks: 1,
      userId: null,
   })

   if (sparks.length === 0) {
      sparks = await sparkService.fetchNextSparks(null, {
         numberOfSparks: 1,
         userId: null,
      })
   }
   let cenas = "NADA"

   if (sparks) {
      console.log(
         "🚀 ~ constgetServerSideProps:GetServerSideProps= ~ sparks:",
         sparks
      )
      cenas = "VAMOS Lá ver"
   }

   const queryParamString = encode(context.query)

   if (sparks.length > 0) {
      return {
         redirect: {
            destination: `/sparks/${sparks[0].id}?cenas=${cenas}${
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
