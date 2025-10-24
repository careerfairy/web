import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import { useCallback } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

type ReactionType = "thumbsUp" | "heart" | "wow" | "laughing"

export const useToggleChatReaction = (
   livestreamId: string,
   userId: string | undefined
) => {
   const addReaction = useCallback(
      async (entryId: string, reactionType: ReactionType = "thumbsUp") => {
         if (!userId) {
            console.warn("Cannot add reaction: userId is undefined")
            return
         }

         const entryRef = doc(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "chatEntries",
            entryId
         )

         try {
            await updateDoc(entryRef, {
               [reactionType]: arrayUnion(userId),
            })
         } catch (error) {
            errorLogAndNotify(error, { action: "addReaction" })
         }
      },
      [livestreamId, userId]
   )

   const removeReaction = useCallback(
      async (entryId: string, reactionType: ReactionType = "thumbsUp") => {
         if (!userId) {
            console.warn("Cannot remove reaction: userId is undefined")
            return
         }

         const entryRef = doc(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "chatEntries",
            entryId
         )

         try {
            await updateDoc(entryRef, {
               [reactionType]: arrayRemove(userId),
            })
         } catch (error) {
            errorLogAndNotify(error, { action: "removeReaction" })
         }
      },
      [livestreamId, userId]
   )

   return {
      addReaction,
      removeReaction,
   }
}
