import { LivestreamQuestion } from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, limit, orderBy, query, where } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"
import useSWRCountQuery from "../useSWRCountQuery"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

type Options = {
   type: "upcoming" | "answered"
   limit: number
}

const getBaseQuery = (livestreamId: string, type: Options["type"]) => {
   return query(
      collection(FirestoreInstance, "livestreams", livestreamId, "questions"),
      ...(type === "answered"
         ? [where("type", "==", "done")]
         : [
              where("type", "in", ["new", "current"]),
              orderBy("type", "asc"),
              orderBy("votes", "desc"),
           ]),
      orderBy("timestamp", "asc")
   )
}

/**
 * Custom hook to fetch a collection of livestream questions based on the specified type and limit.
 * @param livestreamId - The unique identifier for the livestream.
 * @param options - Configuration options including type and limit of questions.
 * @returns A collection of livestream questions.
 */
export const useLivestreamQuestions = (
   livestreamId: string,
   options: Options
) => {
   return useFirestoreCollection<LivestreamQuestion>(
      query(
         getBaseQuery(livestreamId, options.type),
         limit(options.limit || 10)
      ),
      reactFireOptions
   )
}

/**
 * Custom hook to fetch the total count of livestream questions based on the type.
 * @param livestreamId - The unique identifier for the livestream.
 * @param type - The type of questions to count, either "upcoming" or "answered".
 * @returns The total count of questions as a SWR response.
 */
export const useLivestreamQuestionsTotalCount = (
   livestreamId: string,
   type: Options["type"]
) => {
   return useSWRCountQuery(getBaseQuery(livestreamId, type))
}
