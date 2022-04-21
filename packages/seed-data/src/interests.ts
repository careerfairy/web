import { firestore } from "./lib/firebase"
import {
   Interest,
   dummyInterests,
} from "@careerfairy/shared-lib/dist/interests"

interface InterestsSeed {
   /**
    * Creates a basic university by country collection With
    * each collection having a university of the country in mind
    */
   createBasicInterests(): Promise<void>
   /**
    * Delete the basic university by country collection
    */
   deleteInterests(): Promise<void>
   getBasicInterests(): Interest[]
}

class InterestsFirebaseSeed implements InterestsSeed {
   /**
    * Creates the interests collection
    */
   async createBasicInterests() {
      const batch = firestore.batch()

      this.getBasicInterests().forEach((interest) => {
         const interestRef = firestore.collection("interests").doc(interest.id)
         batch.set(interestRef, {
            name: interest.name,
         })
      })

      await batch.commit()
      return
   }

   getBasicInterests() {
      return Object.keys(dummyInterests).map((key) => ({
         id: dummyInterests[key].id,
         name: dummyInterests[key].name,
      }))
   }

   /**
    * Delete the basic university by country collection
    */
   async deleteInterests() {
      const batch = firestore.batch()
      const snaps = await firestore.collection("interests").get()
      snaps.forEach((snap) => batch.delete(snap.ref))
      await batch.commit()
      return
   }
}

const instance: InterestsSeed = new InterestsFirebaseSeed()

export default instance
