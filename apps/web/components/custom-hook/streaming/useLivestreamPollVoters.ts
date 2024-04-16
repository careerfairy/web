import {
   LivestreamPoll,
   LivestreamPollVoter,
} from "@careerfairy/shared-lib/livestreams"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, query, where } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"
import { useFirestoreCollection } from "../utils/useFirestoreCollection"

const reactFireOptions: ReactFireOptions = {
   suspense: true,
   idField: "id",
}

export const useLivestreamPollVoters = (
   livestreamId: string,
   poll: LivestreamPoll
) => {
   const optionsIds = poll.options?.map((option) => option.id)

   return useFirestoreCollection<LivestreamPollVoter>(
      query(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "polls",
            poll.id,
            "voters"
         ),
         optionsIds ? where("optionId", "in", optionsIds) : undefined
      ),
      reactFireOptions
   )
}
