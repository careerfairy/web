import {
   LivestreamEvent,
   getEarliestEventBufferTime,
} from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import {
   QueryFieldFilterConstraint,
   collection,
   limit,
   or,
   query,
   where,
} from "firebase/firestore"
import { ReactFireOptions } from "reactfire"

import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import useSWRCountQuery from "../useSWRCountQuery"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

type Options = {
   type: "upcomingEvents" | "pastEvents"
   tags: GroupedTags
   limit: number
}

const getBaseQuery = (
   type: Options["type"],
   tags: GroupedTags,
   limitItems: number
) => {
   const businessFunctions = Object.keys(tags.businessFunctions)
   const contentTopics = Object.keys(tags.contentTopics)
   const languages = Object.keys(tags.language)

   let baseQuery = query(
      collection(FirestoreInstance, "livestreams"),
      ...(type === "pastEvents"
         ? [where("hasEnded", "==", true), where("test", "==", false)]
         : [
              where("start", ">", getEarliestEventBufferTime()),
              where("test", "==", false),
           ])
   )

   const constraints: QueryFieldFilterConstraint[] = []

   if (businessFunctions.length) {
      constraints.push(
         where(
            "businessFunctionsTagIds",
            "array-contains-any",
            businessFunctions
         )
      )
   }

   if (contentTopics.length) {
      constraints.push(
         where("contentTopicsTagIds", "array-contains-any", contentTopics)
      )
   }

   if (languages.length) {
      constraints.push(where("language.code", "in", languages))
   }

   baseQuery = query(baseQuery, or(...constraints))

   return query(baseQuery, limit(limitItems))
}

/**
 * Custom hook to fetch a collection of live stream questions based on the specified type and limit.
 * @param livestreamId - The unique identifier for the live stream.
 * @param options - Configuration options including type and limit of questions.
 * @returns A collection of livestream questions.
 */
export const useLivestreamsByTags = (options: Options) => {
   return useFirestoreCollection<LivestreamEvent>(
      getBaseQuery(options.type, options.tags, options.limit),
      reactFireOptions
   )
}

/**
 * Custom hook to fetch the total count of livestream questions based on the type.
 * @param livestreamId - The unique identifier for the livestream.
 * @param type - The type of questions to count, either "upcoming" or "answered".
 * @returns The total count of questions as an SWR response.
 */
export const useLivestreamsByTagsCount = (options: Options) => {
   return useSWRCountQuery(
      getBaseQuery(options.type, options.tags, options.limit)
   )
}
