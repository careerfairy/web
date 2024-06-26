import { MessagingInstance } from "data/firebase/FirebaseInstance"
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
   return useSWRImmutable(
      MessagingInstance ? ["getMessagingToken", MessagingInstance] : null,
      async () => {
         const permission = await Notification.requestPermission()

         if (permission === "granted") {
            const token = await MessagingInstance.getToken({
               vapidKey:
                  "BBR82x2GvYK1kMOhbO-naONUGxueaLQ-DFMsXbecuLk_SLZMcXK6W50fMd6DDhljLYNKZFjvq8CK8cI9e7lRHvM",
            })
            console.log("🚀 ~ file: useMessagingToken.ts:23 ~ token:", token)

            return token
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
