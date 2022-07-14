import firebase from "firebase/app"
import {
   convertDocArrayToDict,
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import {
   FieldOfStudy,
   RootFieldOfStudyCategory,
} from "@careerfairy/shared-lib/dist/fieldOfStudy"

export interface IFieldOfStudyRepository {
   getAllFieldsOfStudy(): Promise<FieldOfStudy[]>
   getFieldsOfStudyAsCategory(): Promise<RootFieldOfStudyCategory>
}

export class FirebaseFieldOfStudyRepository implements IFieldOfStudyRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getAllFieldsOfStudy(): Promise<FieldOfStudy[]> {
      const snapshots = await this.firestore.collection("fieldsOfStudy").get()
      return mapFirestoreDocuments<FieldOfStudy>(snapshots)
   }
   async getFieldsOfStudyAsCategory(): Promise<RootFieldOfStudyCategory> {
      const levelOfStudies = await this.getAllFieldsOfStudy()
      return {
         name: "Field of Study",
         id: "fieldOfStudy",
         options: convertDocArrayToDict(levelOfStudies),
      }
   }
}
