import {
   LivestreamEvent,
   Speaker,
} from "@careerfairy/shared-lib/dist/livestreams"
import { faker } from "@faker-js/faker"
import { v4 as uuidv4 } from "uuid"
import * as admin from "firebase-admin"
import { firestore } from "./lib/firebase"

interface LivestreamSeed {
   createLivestream(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent>
}

class LivestreamFirebaseSeed implements LivestreamSeed {
   async createLivestream(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent> {
      const registeredUsers = Array.from(
         {
            length: faker.datatype.number({ min: 0, max: 100 }),
         },
         () => faker.internet.email()
      )

      let data: LivestreamEvent = {
         author: {
            email: faker.internet.email(),
            groupId: uuidv4(),
         },
         backgroundImageUrl: faker.image.abstract(),
         company: faker.company.companyName(),
         companyId: uuidv4(),
         companyLogoUrl: faker.image.business(),
         created: admin.firestore.Timestamp.fromDate(faker.date.recent()),
         duration: faker.random.arrayElement([30, 60, 90, 120]),
         groupIds: [uuidv4()],
         hidden: false,
         id: uuidv4(),
         language: {
            code: faker.address.countryCode(),
            name: faker.address.country(),
         },
         lastUpdated: admin.firestore.Timestamp.fromDate(faker.date.recent()),
         lastUpdatedAuthorInfo: {
            email: faker.internet.email(),
            groupId: uuidv4(),
         },
         registeredUsers,
         registrants: registeredUsers.map((s) => uuidv4()),
         speakers: Array.from(
            {
               length: faker.datatype.number({ min: 1, max: 5 }),
            },
            generateSpeaker
         ),
         start: admin.firestore.Timestamp.fromDate(faker.date.soon()),
         test: false,
         title: faker.lorem.sentence(),
         type: "upcoming",
         universities: [],
      }

      data = Object.assign(data, overrideFields)

      await firestore.collection("livestreams").doc(data.id).set(data)

      return data
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

const instance: LivestreamSeed = new LivestreamFirebaseSeed()

export default instance
