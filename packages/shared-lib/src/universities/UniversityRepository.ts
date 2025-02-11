import firebase from "firebase/compat/app"
import { mapFirestoreDocuments } from "../BaseFirebaseRepository"
import { University, UniversityCountry } from "./universities"

export interface IUniversityRepository {
   getAllUniversitiesByCountries(): Promise<UniversityCountry[]>

   getUniversityById(
      countryCode: string,
      universityId: string
   ): Promise<University>
}

export class FirebaseUniversityRepository implements IUniversityRepository {
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   async getAllUniversitiesByCountries(): Promise<UniversityCountry[]> {
      const snapshots = await this.firestore
         .collection("universitiesByCountry")
         .get()
      return mapFirestoreDocuments<UniversityCountry>(snapshots)
   }

   async getUniversityById(
      countryCode: string,
      universityId: string
   ): Promise<University> {
      const snapshot = await this.firestore
         .collection("universitiesByCountry")
         .doc(countryCode)
         .get()

      const universityCountry = snapshot.data() as UniversityCountry

      return universityCountry.universities.find(
         (university) => university.id === universityId
      )
   }
}
