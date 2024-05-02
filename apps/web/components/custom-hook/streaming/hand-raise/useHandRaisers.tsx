import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { useFirestoreCollection } from "components/custom-hook/utils/useFirestoreCollection"
import { FirestoreInstance } from "data/firebase/FirebaseInstance"
import { collection, orderBy, query, where } from "firebase/firestore"
import { ReactFireOptions } from "reactfire"

const reactFireOptions: ReactFireOptions = {
   idField: "id",
   suspense: true,
}

const getQuery = (livestreamId: string) => {
   return query(
      collection(FirestoreInstance, "livestreams", livestreamId, "handRaises"),
      where("state", "in", [
         HandRaiseState.requested,
         HandRaiseState.invited,
         HandRaiseState.connecting,
         HandRaiseState.connected,
      ]),
      orderBy("timeStamp", "desc")
   )
}

export const useHandRaisers = (livestreamId: string) => {
   return useFirestoreCollection<HandRaise>(
      getQuery(livestreamId),
      reactFireOptions
   )
}
