import React from "react"
import { GetServerSidePropsContext } from "next"

const CheckoutButton = ({ groupId }) => {
   console.log(groupId)
   return <></>
}

export async function getServerSideProps({
   params: { groupId },
}: GetServerSidePropsContext) {
   console.log(groupId)

   return
   ;<></>
   //    props: {
   //       serverStream: serializeLivestream(serverStream),
   //       groupId: groupId || null,U
   //       // allows the client side to know in the first render if the user
   //       // has bought access to the recording or not
   //       userStatsPlain: userStats || null,
   //       // improve UX by allowing the client side to know beforehand the
   //       // user was signed in before fetching the firestore auth data
   //       userEmail: token?.email ?? null,
   //    }, // will be passed to the page component as props
   // }
   // if (serverStream) {

   // } else {
   //    return {
   //       notFound: true,
   //    }
   // }
}
export default CheckoutButton
