import {
   EventRating,
   LivestreamEvent,
   LivestreamQuestion,
   Speaker,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"

import { CreatorRoles } from "@careerfairy/shared-lib/dist/groups/creators"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import { livestreamTriGrams } from "@careerfairy/shared-lib/dist/utils/search"
import { faker } from "@faker-js/faker"
import * as admin from "firebase-admin"
import { v4 as uuidv4 } from "uuid"
import { groupQuestions } from "./groups"
import { firestore } from "./lib/firebase"

type SetupUserLivestreamDataOptions = {
   user: UserData
   livestream: LivestreamEvent
   userLivestreamDataOverride?: Partial<UserLivestreamData>
   registered?: boolean
   joinedTalentPool?: boolean
   participated?: boolean
}

interface LivestreamSeed {
   create(overrideFields?: Partial<LivestreamEvent>): Promise<LivestreamEvent>

   createPast(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent>

   createLive(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent>

   createUpcoming(
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
   random(overrideFields?: Partial<LivestreamEvent>): LivestreamEvent

   /**
    * Generate a random draft livestream event object, meaning it might not contain some
    * mandatory fields.
    *
    * Does not save to the database, used to fill forms
    */
   randomDraft(overrideFields?: Partial<LivestreamEvent>): LivestreamEvent

   /**
    * Make a user as registered/participated to the livestream
    * Updates his userLivestreamData
    */
   userData(
      options: SetupUserLivestreamDataOptions
   ): Promise<Partial<UserLivestreamData>>

   /**
    * Setup the required documents for the recording access
    */
   setRecordingSid(livestreamId: string): Promise<void>

   /**
    * Add questions to a livestream/id/questions sub-collection
    **/
   addUserQuestionsToLivestream(
      livestreamId: string,
      questions: string[]
   ): Promise<void>

   /**
    * Add ratings to a livestream/id/ratings sub-collection
    **/
   addFeedbackQuestionsToLivestream(
      livestreamId: string,
      ratings: string[]
   ): Promise<void>
}

class LivestreamFirebaseSeed implements LivestreamSeed {
   async userData(
      options: SetupUserLivestreamDataOptions
   ): Promise<Partial<UserLivestreamData>> {
      const livestreamRef = firestore
         .collection("livestreams")
         .doc(options.livestream.id)

      const userLivestreamDataRef = livestreamRef
         .collection("userLivestreamData")
         .doc(options.user.userEmail)

      const partialData: Partial<UserLivestreamData> = {
         livestreamId: options.livestream.id,
         userId: options.user.authId,
         user: options.user,
      }

      // user registration/participation date is a bit behind the livestream date
      const relativeDate = options.livestream.start.toDate()
      relativeDate.setDate(relativeDate.getDate() - 1)

      if (options.registered) {
         partialData.registered = {
            date: admin.firestore.Timestamp.fromDate(relativeDate),
         }
      } else {
         partialData.registered = null
      }

      if (options.joinedTalentPool) {
         partialData.talentPool = {
            date: admin.firestore.Timestamp.fromDate(relativeDate),
            companyId: options.livestream.groupIds?.[0],
         }
      } else {
         partialData.talentPool = null
      }

      if (options.participated) {
         partialData.participated = {
            date: admin.firestore.Timestamp.fromDate(relativeDate),
         }
      } else {
         partialData.participated = null
      }

      const finalData: Partial<UserLivestreamData> = Object.assign(
         partialData,
         options.userLivestreamDataOverride
      )

      await userLivestreamDataRef.set(finalData, { merge: true })

      return finalData
   }

   async getWithSubcollections(
      livestreamId: string,
      subCollections = ["userLivestreamData", "questions"]
   ): Promise<LivestreamEventWithSubcollections> {
      const res = {}

      subCollections.forEach((name) => {
         res[name] = null
      })

      const livestreamRef = firestore
         .collection("livestreams")
         .doc(livestreamId)

      const livestream = await livestreamRef.get()

      for (const subCollectionsKey in res) {
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

      // @ts-ignore
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
            } as Partial<LivestreamEvent>,
            overrideFields
         )
      )
   }

   createUpcoming(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent> {
      return this.create(
         Object.assign(
            {
               start: admin.firestore.Timestamp.fromDate(
                  faker.date.future(faker.datatype.number({ min: 1, max: 60 }))
               ),
               hasEnded: false,
            } as Partial<LivestreamEvent>,
            overrideFields
         )
      )
   }

   async create(
      overrideFields?: Partial<LivestreamEvent>
   ): Promise<LivestreamEvent> {
      const batch = firestore.batch()

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
         groupIds: [groupId],
         hasEnded: false,
         ...overrideFields,
      })

      const livestreamRef = firestore.collection("livestreams").doc(data.id)

      batch.set(livestreamRef, data)

      await batch.commit()

      return data
   }

   async addUserQuestionsToLivestream(
      livestreamId: string,
      userQuestions: string[]
   ): Promise<void> {
      const batch = firestore.batch()

      userQuestions.forEach((question) => {
         const newQuestion = generateLiveStreamUserQuestion(question)
         batch.set(
            firestore
               .collection("livestreams")
               .doc(livestreamId)
               .collection("questions")
               .doc(newQuestion.id),
            newQuestion
         )
      })

      await batch.commit()

      return
   }

   async addFeedbackQuestionsToLivestream(
      livestreamId: string,
      feedbackQuestions: string[]
   ): Promise<void> {
      const batch = firestore.batch()

      feedbackQuestions.forEach((rating) => {
         const newRating = generateLivestreamFeedbackQuestion(rating)
         batch.set(
            firestore
               .collection("livestreams")
               .doc(livestreamId)
               .collection("rating")
               .doc(newRating.id),
            newRating
         )
      })

      await batch.commit()

      return
   }

   async setRecordingSid(livestreamId: string) {
      const livestreamRef = firestore
         .collection("livestreams")
         .doc(livestreamId)

      await livestreamRef.collection("recordingToken").doc("token").set(
         {
            sid: uuidv4(),
         },
         { merge: true }
      )
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

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const livestreamId = firestore.collection("livestreams").doc().id

      const data: LivestreamEvent = {
         backgroundImageUrl: faker.image.abstract(),
         company,
         companyId: uuidv4(),
         companyLogoUrl: faker.image.business(),
         duration: faker.helpers.arrayElement([30, 60, 90, 120]),
         summary: faker.lorem.paragraph(),
         reasonsToJoinLivestream: faker.lorem.paragraphs(),
         reasonsToJoinLivestream_v2: [
            faker.lorem.sentences(2),
            faker.lorem.sentences(2),
            faker.lorem.sentences(2),
         ],
         hidden: false,
         id: livestreamId,
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
         start: admin.firestore.Timestamp.fromDate(
            faker.date.soon(15, tomorrow)
         ), // 15 days from tomorrow
         lastUpdated: admin.firestore.Timestamp.fromDate(faker.date.recent()),
         created: admin.firestore.Timestamp.fromDate(faker.date.recent()),
         test: false,
         title,
         type: "upcoming",
         universities: [],
         triGrams: livestreamTriGrams(title, company),
         contentTopicsTagIds: ["ApplicationProcess"],
         businessFunctionsTagIds: ["BusinessDevelopment", "Consulting"],
      }

      const overrideFieldsCopy = { ...overrideFields }

      // override the start date if present
      if (
         overrideFieldsCopy?.start &&
         overrideFieldsCopy.start instanceof Date
      ) {
         data.start = admin.firestore.Timestamp.fromDate(
            // @ts-ignore start should be a date object
            overrideFieldsCopy.start
         )
         delete overrideFieldsCopy.start
      }

      return {
         ...data,
         ...overrideFieldsCopy,
      }
   }

   randomDraft(overrideFields?: Partial<LivestreamEvent>): LivestreamEvent {
      const randomEvent = this.random(overrideFields)
      return {
         ...randomEvent,
         isDraft: true,
         contentTopicsTagIds: [],
         summary: "",
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

export const generateLivestreamFeedbackQuestion = (
   name: string
): EventRating => ({
   question: name,
   appearAfter: faker.datatype.number({ min: 5, max: 60 }),
   id: uuidv4(),
   hasText: true,
   isForEnd: false,
   noStars: true,
   isSentimentRating: false,
   title: name,
})

export const generateLiveStreamUserQuestion = (
   question: string
): LivestreamQuestion => ({
   author: "test",
   id: uuidv4(),
   timestamp: admin.firestore.Timestamp.fromDate(faker.date.recent()),
   badges: [],
   title: question,
   type: "new",
   votes: 0,
   voterIds: [],
   emailOfVoters: [],
   numberOfComments: 0,
   firstComment: null,
   displayName: faker.name.firstName(),
})

const generateSpeaker = (): Speaker => ({
   id: uuidv4().replace(/-/g, ""),
   avatar: faker.image.people(),
   background: faker.lorem.paragraph(),
   firstName: faker.name.firstName(),
   lastName: faker.name.lastName(),
   position: faker.name.jobTitle(),
   email: faker.internet.email(),
   roles: [CreatorRoles.Speaker],
})

type LivestreamEventWithSubcollections = {
   livestream: LivestreamEvent
   userLivestreamData: UserLivestreamData[]
   questions: LivestreamQuestion[]
}

const instance: LivestreamSeed = new LivestreamFirebaseSeed()

export default instance
