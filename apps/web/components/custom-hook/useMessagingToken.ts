import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { useAuth } from "HOCs/AuthProvider"
import { MessagingInstance } from "data/firebase/FirebaseInstance"
import { arrayUnion, doc, updateDoc } from "firebase/firestore"
import { useFirestore } from "reactfire"
import useSWRImmutable from "swr/immutable"

/**
 * Custom hook to retrieve the messaging token using SWR (stale-while-revalidate).
 *
 * This hook uses the Firebase Messaging instance to get the token required for push notifications.
 * It leverages the `useSWRImmutable` hook to fetch the token and manage its state.
 *
 * @returns The messaging token response from Firebase
 */
export const useMessagingToken = () => {
   const { userData } = useAuth()
   const firestore = useFirestore()
   return useSWRImmutable(
      MessagingInstance && userData?.userEmail
         ? ["getMessagingToken", MessagingInstance]
         : null,
      async () => {
         const permission = await Notification.requestPermission()

         if (permission === "granted") {
            const token = await MessagingInstance.getToken({
               vapidKey:
                  "BBR82x2GvYK1kMOhbO-naONUGxueaLQ-DFMsXbecuLk_SLZMcXK6W50fMd6DDhljLYNKZFjvq8CK8cI9e7lRHvM",
            })

            const userDoc = doc(
               firestore,
               "userData",
               userData?.userEmail
            ).withConverter(createGenericConverter<UserData>())

            await updateDoc(userDoc, {
               messagingTokens: arrayUnion(token),
            })

            console.log("🚀 Token saved!")
         } else {
            alert("Permission denied")
         }
      },
      {
         onError: (error) => {
            console.error(error)
         },
      }
   )
}
