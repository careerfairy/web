import firebase from "firebase/app"
import firebaseApp from "./FirebaseInstance"
import { HighLight } from "types/Highlight"
import { mapFirestoreDocuments } from "../../util/FirebaseUtils"
import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"

export interface IFieldOfStudyRepository {
   getAllFieldsOfStudy(): Promise<FieldOfStudy[]>
}

class FieldOfStudyRepository implements IFieldOfStudyRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getAllFieldsOfStudy(): Promise<FieldOfStudy[]> {
      const snapshots = await this.firestore.collection("fieldsOfStudy").get()
      return mapFirestoreDocuments<FieldOfStudy>(snapshots)
   }
}

// Singleton
const fieldOfStudyRepo: IFieldOfStudyRepository = new FieldOfStudyRepository(
   firebaseApp.firestore()
)

export default fieldOfStudyRepo
