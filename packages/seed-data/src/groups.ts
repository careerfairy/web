import { Group } from "@careerfairy/shared-lib/dist/groups"
import { faker } from "@faker-js/faker"
import { firestore } from "./lib/firebase"
import { LivestreamGroupQuestion } from "@careerfairy/shared-lib/dist/livestreams"
import { generateId } from "./utils/utils"
import { groupTriGrams } from "@careerfairy/shared-lib/dist/utils/search"

interface GroupSeed {
   createGroup(overrideFields?: Partial<Group>): Promise<Group>
}

class GroupFirebaseSeed implements GroupSeed {
   async createGroup(overrideFields?: Partial<Group>): Promise<Group> {
      const batch = firestore.batch()
      const id = generateId()
      const universityName = faker.company.companyName() ?? "My university"

      let data: Group = {
         id,
         groupId: id,
         description: faker.company.bs(),
         logoUrl: faker.image.business(),
         test: false,
         universityName,
         triGrams: groupTriGrams(universityName),
      }

      data = Object.assign(data, overrideFields)

      groupQuestions.forEach((questionData) => {
         const questionRef = firestore
            .collection("careerCenterData")
            .doc(id)
            .collection("groupQuestions")
            .doc(questionData.id)
         batch.set(questionRef, questionData)
      })

      const groupRef = firestore.collection("careerCenterData").doc(id)
      batch.set(groupRef, data)
      await batch.commit()
      return data
   }
}
const generateQuestionOption = (generatorFn) => ({
   id: generateId(),
   name: generatorFn(),
})

export const generateQuestion = (
   name,
   generatorFn
): LivestreamGroupQuestion => ({
   id: generateId(),
   questionType: "custom",
   hidden: false,
   name,
   options: Array.from(
      { length: faker.datatype.number({ min: 1, max: 10 }) },
      () => generateQuestionOption(generatorFn)
   ).reduce((acc, curr) => {
      acc[curr.id] = curr
      return acc
   }, {}),
})
export const groupQuestions = [
   generateQuestion("Job Title", faker.name.jobTitle),
   generateQuestion("Job Type", faker.name.jobType),
   generateQuestion("Gender", faker.name.gender),
]

const instance: GroupSeed = new GroupFirebaseSeed()

export default instance
