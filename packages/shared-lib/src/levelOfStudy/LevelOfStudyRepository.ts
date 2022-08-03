import firebase from "firebase/compat/app"
import { LevelOfStudy } from "./levelOfStudy"
import {
   convertDocArrayToDict,
   mapFirestoreDocuments,
} from "../BaseFirebaseRepository"
import { RootLevelOfStudyCategory } from "./levelOfStudy"

export interface ILevelOfStudyRepository {
   getAllLevelsOfStudy(): Promise<LevelOfStudy[]>
   getLevelsOfStudyAsCategory(): Promise<RootLevelOfStudyCategory>
}

export class FirebaseLevelOfStudyRepository implements ILevelOfStudyRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getAllLevelsOfStudy(): Promise<LevelOfStudy[]> {
      const snapshots = await this.firestore.collection("levelsOfStudy").get()
      return mapFirestoreDocuments<LevelOfStudy>(snapshots)
   }

   async getLevelsOfStudyAsCategory(): Promise<RootLevelOfStudyCategory> {
      const levelOfStudies = await this.getAllLevelsOfStudy()
      return {
         name: "Level of Study",
         id: "levelOfStudy",
         options: convertDocArrayToDict(levelOfStudies),
      }
   }
}
