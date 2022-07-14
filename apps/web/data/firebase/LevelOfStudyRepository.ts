import firebase from "firebase/app"
import firebaseApp from "./FirebaseInstance"
import { mapFirestoreDocuments } from "../../util/FirebaseUtils"
import { LevelOfStudy } from "@careerfairy/shared-lib/dist/levelOfStudy"

export interface ILevelOfStudyRepository {
   getAllLevelsOfStudy(): Promise<LevelOfStudy[]>
}

class LevelOfStudyRepository implements ILevelOfStudyRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getAllLevelsOfStudy(): Promise<LevelOfStudy[]> {
      const snapshots = await this.firestore.collection("levelsOfStudy").get()
      return mapFirestoreDocuments<LevelOfStudy>(snapshots)
   }
}

// Singleton
const levelOfStudyRepo: ILevelOfStudyRepository = new LevelOfStudyRepository(
   firebaseApp.firestore()
)

export default levelOfStudyRepo
