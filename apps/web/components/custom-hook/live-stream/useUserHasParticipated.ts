import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { doc, onSnapshot } from "firebase/firestore"
import { useAuth } from "HOCs/AuthProvider"
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire"

type Options = {
   disabled?: boolean
}

/**
 * Hook to check if the authenticated user has participated in a live stream in real-time.
 * @param {string} livestreamId - The ID of the live stream to check participation for.
 * @param {Options} options - The options to use.
 * @returns {boolean} - Whether the user has participated in the live stream.
 */
export const useUserHasParticipated = (
   livestreamId: string,
   { disabled = false }: Options = {}
): boolean => {
   const firestore = useFirestore()
   const { authenticatedUser } = useAuth()
   const [hasParticipated, setHasParticipated] = useState(false)

   useEffect(() => {
      if (livestreamId && authenticatedUser.email && !disabled) {
         const unsubscribe = onSnapshot(
            doc(
               firestore,
               "livestreams",
               livestreamId,
               "userLivestreamData",
               authenticatedUser.email
            ).withConverter(createGenericConverter<UserLivestreamData>()),
            (doc) => {
               setHasParticipated(Boolean(doc.data()?.participated?.date))
            }
         )

         return () => {
            setHasParticipated(false)
            unsubscribe()
         }
      }
   }, [livestreamId, authenticatedUser.email, firestore, disabled])

   if (!livestreamId || !authenticatedUser.email || disabled) {
      return false
   }

   return hasParticipated
}
