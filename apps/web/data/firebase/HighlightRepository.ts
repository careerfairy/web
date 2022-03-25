import firebase from "firebase/app"
import firebaseApp from "./FirebaseInstance"
import { HighLight } from "types/Highlight"
import { mapFirestoreDocuments } from "../../util/FirebaseUtils"

export interface IHighlightRepository {
   getHighlights(limit?: number): Promise<HighLight[]>
   shouldShowHighlightsCarousel(): Promise<Boolean>
}

class FirebaseHighlightRepository implements IHighlightRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getHighlights(limit?: number): Promise<HighLight[]> {
      let ref: firebase.firestore.Query<firebase.firestore.DocumentData> =
         this.firestore.collection("highlights")
      if (limit) {
         ref = ref.limit(limit)
      }
      const snapshots = await ref.get()
      return mapFirestoreDocuments<HighLight>(snapshots)
   }

   async shouldShowHighlightsCarousel(): Promise<Boolean> {
      const snap = await this.firestore
         .collection("userInterface")
         .doc("eventsPortal")
         .get()
      return Boolean(snap?.data?.()?.showHighlights)
   }
}

// Singleton
const highlightRepo: IHighlightRepository = new FirebaseHighlightRepository(
   firebaseApp.firestore()
)

export default highlightRepo
