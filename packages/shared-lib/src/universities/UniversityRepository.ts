import firebase from "firebase/compat/app"
import { mapFirestoreDocuments } from "../BaseFirebaseRepository"
import { UniversityCountry } from "./universities"

export interface IUniversityRepository {
   getAllUniversitiesByCountries(): Promise<UniversityCountry[]>
}

export class FirebaseUniversityRepository implements IUniversityRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getAllUniversitiesByCountries(): Promise<UniversityCountry[]> {
      const snapshots = await this.firestore
         .collection("universitiesByCountry")
         .get()
      return mapFirestoreDocuments<UniversityCountry>(snapshots)
   }
}
