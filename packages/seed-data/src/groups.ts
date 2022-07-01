import { Group } from "@careerfairy/shared-lib/dist/groups"
import { v4 as uuidv4 } from "uuid"
import { faker } from "@faker-js/faker"
import { firestore } from "./lib/firebase"

interface GroupSeed {
   createGroup(overrideFields?: Partial<Group>): Promise<Group>
}

class GroupFirebaseSeed implements GroupSeed {
   async createGroup(overrideFields?: Partial<Group>): Promise<Group> {
      const id = uuidv4()
      let data: Group = {
         id,
         groupId: id,
         description: faker.company.bs(),
         logoUrl: faker.image.business(),
         adminEmails: [faker.internet.email()],

         categories: [
            generateCategory("Job Title", faker.name.jobTitle),
            generateCategory("Job Type", faker.name.jobType),
            generateCategory("Gender", faker.name.gender),
         ],

         test: false,
         universityName: faker.company.companyName() ?? "My university",
      }

      data = Object.assign(data, overrideFields)

      await firestore.collection("careerCenterData").doc(id).set(data)

      return data
   }
}

const generateCategory = (name, generatorFn) => ({
   id: uuidv4(),
   name,
   options: Array.from(
      { length: faker.datatype.number({ min: 1, max: 10 }) },
      () => generateCategoryOption(generatorFn)
   ),
})

const generateCategoryOption = (generatorFn) => ({
   id: uuidv4(),
   name: generatorFn(),
})

const instance: GroupSeed = new GroupFirebaseSeed()

export default instance
