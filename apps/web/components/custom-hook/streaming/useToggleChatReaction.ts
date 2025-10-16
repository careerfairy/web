import { doc, arrayUnion, arrayRemove, updateDoc } from "firebase/firestore"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { useCallback } from "react"

type ReactionType = "thumbsUp" | "heart" | "wow"

export const useToggleChatReaction = (
   livestreamId: string,
   userId: string | undefined
) => {
   const toggleReaction = useCallback(
      async (entryId: string, reactionType: ReactionType = "thumbsUp") => {
         if (!userId) {
            console.warn("User ID is required to toggle reactions")
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
            // First, check if user already reacted
            // We'll optimistically toggle the reaction
            // The Firestore update will handle adding or removing based on current state
            
            // Note: Since we can't easily check the current state without fetching,
            // we'll need to fetch the current entry to determine if we should add or remove
            // For now, let's use a simple approach where we try to remove first,
            // and if the user wasn't in the array, it won't do anything
            
            // Alternative: We can pass the current reactions array from the component
            // Let's implement a smarter version in the component that determines add/remove
            
            // For now, this is a placeholder - we'll handle the logic in the component
            await updateDoc(entryRef, {
               [reactionType]: arrayUnion(userId),
            })
         } catch (error) {
            console.error("Error toggling chat reaction:", error)
            throw error
         }
      },
      [livestreamId, userId]
   )

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
            console.log("Adding reaction:", { entryId, reactionType, userId })
            await updateDoc(entryRef, {
               [reactionType]: arrayUnion(userId),
            })
            console.log("Reaction added successfully")
         } catch (error) {
            console.error("Error adding chat reaction:", error)
            throw error
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
            console.log("Removing reaction:", { entryId, reactionType, userId })
            await updateDoc(entryRef, {
               [reactionType]: arrayRemove(userId),
            })
            console.log("Reaction removed successfully")
         } catch (error) {
            console.error("Error removing chat reaction:", error)
            throw error
         }
      },
      [livestreamId, userId]
   )

   return {
      toggleReaction,
      addReaction,
      removeReaction,
   }
}
