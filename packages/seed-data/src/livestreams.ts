import {
   LivestreamEvent,
   LivestreamQuestion,
   Speaker,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"

import { livestreamTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
import { faker } from "@faker-js/faker"
import { v4 as uuidv4 } from "uuid"
import * as admin from "firebase-admin"
import { firestore } from "./lib/firebase"
import { groupQuestions } from "./groups"

interface LivestreamSeed {
   create(overrideFields?: Partial<LivestreamEvent>): Promise<LivestreamEvent>

   createPast(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent>

   createLive(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent>

   getWithSubcollections(
      livestreamId: string,
      subCollections?: string[]
   ): Promise<LivestreamEventWithSubcollections>

   generateSecureToken(livestreamId: string): Promise<string>

   /**
    * Generate a random livestream event object
    *
    * Does not save to the database, used to fill forms
    */
   random(overrideFields?: Partial<LivestreamEvent>): Partial<LivestreamEvent>
}

class LivestreamFirebaseSeed implements LivestreamSeed {
   async getWithSubcollections(
      livestreamId: string,
      subCollections = ["userLivestreamData", "questions"]
   ): Promise<LivestreamEventWithSubcollections> {
      let res = {}

      subCollections.forEach((name) => {
         res[name] = null
      })

      const livestreamRef = firestore
         .collection("livestreams")
         .doc(livestreamId)

      const livestream = await livestreamRef.get()

      for (let subCollectionsKey in res) {
         const querySnapshot = await livestreamRef
            .collection(subCollectionsKey)
            .get()

         if (!querySnapshot.empty) {
            res[subCollectionsKey] = querySnapshot.docs.map((d) => ({
               ...d.data(),
               id: d.id,
            }))
         }
      }

      return {
         // @ts-ignore
         livestream: {
            ...livestream.data(),
            id: livestream.id,
         },
         ...res,
      }
   }

   createPast(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent> {
      return this.create(
         Object.assign(
            {
               start: admin.firestore.Timestamp.fromDate(
                  faker.date.recent(faker.datatype.number({ min: 1, max: 60 }))
               ),
               hasEnded: true,
            },
            overrideFields
         )
      )
   }

   createLive(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent> {
      const minutesBefore = faker.datatype.number({ min: 1, max: 25 })
      const pastDateMs = Date.now() - minutesBefore * 60 * 1000

      return this.create(
         Object.assign(
            {
               start: admin.firestore.Timestamp.fromDate(new Date(pastDateMs)),
               hasStarted: true,
            },
            overrideFields
         )
      )
   }

   async create(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent> {
      const registeredUsers = Array.from(
         {
            length: faker.datatype.number({ min: 0, max: 100 }),
         },
         () => faker.internet.email()
      )

      const groupId = uuidv4()

      const data = this.random({
         author: {
            email: faker.internet.email(),
            groupId: groupId,
         },
         lastUpdatedAuthorInfo: {
            email: faker.internet.email(),
            groupId: groupId,
         },
         registeredUsers,
         groupIds: [groupId],
         ...overrideFields,
      })

      await firestore.collection("livestreams").doc(data.id).set(data)

      return data
   }

   async generateSecureToken(livestreamId: string): Promise<string> {
      const token = uuidv4()
      await firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("tokens")
         .doc("secureToken")
         .set({
            value: token,
         })
      return token
   }

   random(overrideFields?: Partial<LivestreamEvent>): LivestreamEvent {
      const title = faker.lorem.sentence()
      const company = faker.company.companyName()

      let data: LivestreamEvent = {
         backgroundImageUrl: faker.image.abstract(),
         company,
         companyId: uuidv4(),
         companyLogoUrl: faker.image.business(),
         duration: faker.random.arrayElement([30, 60, 90, 120]),
         hidden: false,
         id: uuidv4().replace(/-/g, ""),
         language: {
            code: faker.address.countryCode(),
            name: faker.address.country(),
         },
         groupQuestionsMap: null,
         speakers: Array.from(
            {
               length: faker.datatype.number({ min: 1, max: 5 }),
            },
            generateSpeaker
         ),
         start: admin.firestore.Timestamp.fromDate(faker.date.soon()),
         lastUpdated: admin.firestore.Timestamp.fromDate(faker.date.recent()),
         created: admin.firestore.Timestamp.fromDate(faker.date.recent()),
         test: false,
         title,
         type: "upcoming",
         universities: [],
         triGrams: livestreamTriGrams(title, company),
      }

      return {
         ...data,
         ...overrideFields,
      }
   }
}
export const createLivestreamGroupQuestions = (groupId: string = uuidv4()) => {
   return {
      groupId: groupId,
      groupName: faker.company.companyName(),
      questions: groupQuestions.reduce((acc, curr) => {
         acc[curr.id] = curr
         return acc
      }, {}),
   }
}
const generateSpeaker = (): Speaker => ({
   id: uuidv4(),
   avatar: faker.image.people(),
   background: faker.lorem.paragraph(),
   firstName: faker.name.firstName(),
   lastName: faker.name.lastName(),
   position: faker.name.jobTitle(),
})

type LivestreamEventWithSubcollections = {
   livestream: LivestreamEvent
   userLivestreamData: UserLivestreamData[]
   questions: LivestreamQuestion[]
}

const instance: LivestreamSeed = new LivestreamFirebaseSeed()

export default instance
