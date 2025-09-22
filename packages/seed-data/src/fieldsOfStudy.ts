import { FieldOfStudy } from "@careerfairy/shared-lib/dist/fieldOfStudy"
import { firestore } from "./lib/firebase"

interface FieldsOfStudySeed {
   /**
    * Creates the field or level of study collection
    */
   createCollection(
      type: "fieldsOfStudy" | "levelsOfStudy"
   ): Promise<FieldOfStudy[]>
   /**
    * Delete the basic university by country collection
    */
   deleteCollection(type: "fieldsOfStudy" | "levelsOfStudy"): Promise<void>
   getDummyFieldsOfStudy(): FieldOfStudy[]
   getDummyLevelsOfStudy(): FieldOfStudy[]
}

class FieldsOfStudyFirebaseSeed implements FieldsOfStudySeed {
   /**
    * Creates the field or level of study collection
    */
   async createCollection(type: "fieldsOfStudy" | "levelsOfStudy") {
      const batch = firestore.batch()

      const dummyData =
         type === "fieldsOfStudy"
            ? this.getDummyFieldsOfStudy()
            : this.getDummyLevelsOfStudy()
      dummyData.forEach((data) => {
         const ref = firestore.collection(type).doc(data.id)
         batch.set(ref, {
            name: data.name,
         })
      })

      await batch.commit()
      return dummyData
   }

   /**
    * Delete the field or level of study collection
    */
   async deleteCollection(type: "fieldsOfStudy" | "levelsOfStudy") {
      const batch = firestore.batch()
      const snaps = await firestore.collection(type).get()
      snaps.forEach((snap) => batch.delete(snap.ref))
      await batch.commit()
      return
   }

   getDummyFieldsOfStudy(): FieldOfStudy[] {
      return dummyFieldsOfStudy
   }
   getDummyLevelsOfStudy(): FieldOfStudy[] {
      return dummyLevelsOfStudy
   }
}

export const dummyLevelsOfStudy = [
   {
      id: "bachelor",
      name: "Bachelor",
   },
   {
      id: "master",
      name: "Master",
   },
   {
      id: "phd",
      name: "PhD",
   },
]
export const dummyFieldsOfStudy = [
   {
      id: "anthropology",
      name: "Anthropology",
   },
   {
      id: "archaeology",
      name: "Archaeology",
   },
   {
      id: "history",
      name: "History",
   },
   {
      id: "linguistics_and_languages",
      name: "Linguistics and Languages",
   },
   {
      id: "philosophy",
      name: "Philosophy",
   },
   {
      id: "religion",
      name: "Religion",
   },
   {
      id: "literature_arts",
      name: "Literature & Arts",
   },
   {
      id: "business_administration_economics",
      name: "Business Administration & Economics",
   },
   {
      id: "geography",
      name: "Geography",
   },
   {
      id: "political_science",
      name: "Political science",
   },
   {
      id: "psychology",
      name: "Psychology",
   },
   {
      id: "sociology",
      name: "Sociology",
   },
   {
      id: "life_sciences",
      name: "Life Sciences",
   },
   {
      id: "chemistry",
      name: "Chemistry",
   },
   {
      id: "earth_sciences",
      name: "Earth sciences",
   },
   {
      id: "physics",
      name: "Physics",
   },
   {
      id: "space_sciences",
      name: "Space sciences",
   },
   {
      id: "astronomy",
      name: "Astronomy",
   },
   {
      id: "computer_science",
      name: "Computer Science",
   },
   {
      id: "mathematics",
      name: "Mathematics",
   },
   {
      id: "systems_science",
      name: "Systems Science",
   },
   {
      id: "agriculture",
      name: "Agriculture",
   },
   {
      id: "architecture_and_design",
      name: "Architecture and Design",
   },
   {
      id: "divinity",
      name: "Divinity",
   },
   {
      id: "education",
      name: "Education",
   },
   {
      id: "chemical_engineering",
      name: "Chemical engineering",
   },
   {
      id: "materials_science_and_engineering",
      name: "Materials science and engineering",
   },
   {
      id: "mechanical_engineering",
      name: "Mechanical engineering",
   },
   {
      id: "civil_engineering",
      name: "Civil engineering",
   },
   {
      id: "electrical_engineering",
      name: "Electrical engineering",
   },
   {
      id: "environmental_studies_and_forestry",
      name: "Environmental studies and forestry",
   },
   {
      id: "human_physical_performance_and_recreation",
      name: "Human physical performance and recreation",
   },
   {
      id: "journalism_media_studies_and_communication",
      name: "Journalism, media studies and communication",
   },
   {
      id: "law",
      name: "Law",
   },
   {
      id: "medicine",
      name: "Medicine",
   },
   {
      id: "military_sciences",
      name: "Military sciences",
   },
   {
      id: "public_administration",
      name: "Public administration",
   },
   {
      id: "transportation",
      name: "Transportation",
   },
   {
      id: "finance",
      name: "Finance",
   },
   {
      id: "business_engineering",
      name: "Business Engineering",
   },
   {
      id: "luxury_fashion",
      name: "Luxury & Fashion",
   },
   {
      id: "other",
      name: "Other",
   },
]

const instance: FieldsOfStudySeed = new FieldsOfStudyFirebaseSeed()

export default instance
