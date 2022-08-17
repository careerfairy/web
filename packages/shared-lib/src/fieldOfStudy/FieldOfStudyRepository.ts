import firebase from "firebase/compat/app"
import {
   convertDocArrayToDict,
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { FieldOfStudy } from "./fieldOfStudy"
import { GroupQuestion } from "../groups"

export interface IFieldOfStudyRepository {
   getAllFieldsOfStudy(): Promise<FieldOfStudy[]>

   getAllLevelsOfStudy(): Promise<FieldOfStudy[]>

   getFieldsOfStudyAsGroupQuestion(
      categoryType: "fieldOfStudy" | "levelOfStudy"
   ): Promise<GroupQuestion>
}

export class FirebaseFieldOfStudyRepository implements IFieldOfStudyRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getAllFieldsOfStudy(): Promise<FieldOfStudy[]> {
      const snapshots = await this.firestore.collection("fieldsOfStudy").get()
      return mapFirestoreDocuments<FieldOfStudy>(snapshots)
   }

   async getAllLevelsOfStudy(): Promise<FieldOfStudy[]> {
      const snapshots = await this.firestore.collection("levelsOfStudy").get()
      return mapFirestoreDocuments<FieldOfStudy>(snapshots)
   }

   async getFieldsOfStudyAsGroupQuestion(
      categoryType: "fieldOfStudy" | "levelOfStudy"
   ): Promise<GroupQuestion> {
      const isFieldOfStudy = categoryType === "fieldOfStudy"
      const categories = isFieldOfStudy
         ? await this.getAllFieldsOfStudy()
         : await this.getAllLevelsOfStudy()
      return {
         name: isFieldOfStudy ? "Field of Study" : "Level of Study",
         id: isFieldOfStudy ? "fieldOfStudy" : "levelOfStudy",
         questionType: isFieldOfStudy ? "fieldOfStudy" : "levelOfStudy",
         options: convertDocArrayToDict(categories),
      }
   }
}
