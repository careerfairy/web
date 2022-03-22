import firebase from "firebase/app"
import firebaseApp from "./FirebaseInstance"
import { QuerySnapshot } from "@firebase/firestore-types"
import { HighLight } from "types/Highlight"

export interface IHighlightRepository {
   getDocumentData(documentSnapshot: QuerySnapshot): HighLight[] | null
   getHighlights(limit: number): Promise<HighLight[]>
}

class FirebaseHighlightRepository implements IHighlightRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getHighlights(limit: number): Promise<HighLight[]> {
      let ref: firebase.firestore.Query<firebase.firestore.DocumentData> =
         this.firestore.collection("highlights")
      if (limit) {
         ref = ref.limit(limit)
      }
      const snapshots = await ref.get()
      return this.getDocumentData(snapshots)
   }
   // @ts-ignore
   getDocumentData(documentSnapshot: QuerySnapshot): HighLight[] | null {
      let docs = null
      if (!documentSnapshot.empty) {
         docs = documentSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
         }))
      }
      return docs
   }
}

// Singleton
// @ts-ignore
const highlightRepo: IHighlightRepository = new FirebaseHighlightRepository(
   firebaseApp.firestore()
)

export default highlightRepo
