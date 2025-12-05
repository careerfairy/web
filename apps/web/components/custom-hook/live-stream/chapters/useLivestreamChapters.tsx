import { LivestreamChapter } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query } from "firebase/firestore"
import { useMemo } from "react"
import { useFirestoreCollection } from "../../utils/useFirestoreCollection"

/**
 * Custom hook to listen to chapters of a livestream.
 * Chapters are ordered by their chapterIndex.
 *
 * @param {string} livestreamId - The ID of the livestream to fetch chapters for.
 * @returns {Object} - Returns an object with:
 *   - data: Array of LivestreamChapter objects (or undefined if loading)
 *   - status: Loading status ("loading" | "success" | "error")
 *   - error: Error object if an error occurred
 */
export const useLivestreamChapters = (livestreamId: string) => {
   const chaptersQuery = useMemo(() => {
      const baseCollection = collection(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "chapters"
      )

      return query(baseCollection, orderBy("chapterIndex", "asc"))
   }, [livestreamId])

   const { data, status, error } = useFirestoreCollection<LivestreamChapter>(
      chaptersQuery,
      {
         idField: "id",
         suspense: false,
      }
   )

   return {
      data: status === "loading" ? undefined : data,
      status,
      error,
   }
}
