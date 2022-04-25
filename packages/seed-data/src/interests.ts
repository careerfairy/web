import { firestore } from "./lib/firebase"
import { Interest } from "@careerfairy/shared-lib/dist/interests"

interface InterestsSeed {
   /**
    * Creates a basic university by country collection With
    * each collection having a university of the country in mind
    */
   createBasicInterests(): Promise<Interest[]>
   /**
    * Delete the basic university by country collection
    */
   deleteInterests(): Promise<void>
   getBasicInterests(): Interest[]
   getDummyInterests(): DummyInterestsTypes
}

class InterestsFirebaseSeed implements InterestsSeed {
   /**
    * Creates the interests collection
    */
   async createBasicInterests() {
      const batch = firestore.batch()

      const interests = this.getBasicInterests()
      interests.forEach((interest) => {
         const interestRef = firestore.collection("interests").doc(interest.id)
         batch.set(interestRef, {
            name: interest.name,
         })
      })

      await batch.commit()
      return interests
   }

   getBasicInterests() {
      const dummyInterests = this.getDummyInterests()
      return Object.keys(this.getDummyInterests()).map((key) => ({
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

   getDummyInterests(): DummyInterestsTypes {
      return {
         Startups: { id: "Le9yVcgRtkReAdwyh6tq", name: "Startups" },
         "Research & Development": {
            id: "MPY3KTjYH1GiePa4I0kZ",
            name: "Research & Development",
         },
         Business: { id: "OjIkyLu7oxICHqweTT04", name: "Business" },
         "Resume & Cover Letter": {
            id: "ZXvJo51KI8HHXbUiC7Jl",
            name: "Resume & Cover Letter",
         },
         Marketing: { id: "bcs4xerUoed6G28AVjSZ", name: "Marketing" },
         "Large Companies": {
            id: "njgCUBkijDTSlKtAkAYx",
            name: "Large Companies",
         },
         "Career Development": {
            id: "pyfkBYzhJ3ewnmGAoz1l",
            name: "Career Development",
         },
         "Interview Preparation": {
            id: "wMn0IAckmeK7bNSads0V",
            name: "Interview Preparation",
         },
         "Public Sector": { id: "yl0wwi5wQ6oHEt8ovoRb", name: "Public Sector" },
         "Product Management": {
            id: "zzBbeQvTajFdx10kz6X0",
            name: "Product Management",
         },
      }
   }
}

interface DummyInterestsTypes {
   Startups: { name: string; id: string }
   "Resume & Cover Letter": { name: string; id: string }
   "Interview Preparation": { name: string; id: string }
   "Large Companies": { name: string; id: string }
   "Product Management": { name: string; id: string }
   "Public Sector": { name: string; id: string }
   "Research & Development": { name: string; id: string }
   "Career Development": { name: string; id: string }
   Business: { name: string; id: string }
   Marketing: { name: string; id: string }
}

const instance: InterestsSeed = new InterestsFirebaseSeed()

export default instance
