import {
   FirebaseCustomJobRepository,
   ICustomJobRepository,
} from "@careerfairy/shared-lib/dist/customJobs/CustomJobRepository"
import {
   CustomJob,
   JobType,
   jobTypeOptions,
} from "@careerfairy/shared-lib/dist/customJobs/customJobs"
import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import { faker } from "@faker-js/faker"
import { randomInt } from "crypto"
import * as admin from "firebase-admin"
import { v4 as uuidv4 } from "uuid"
import { fieldValue, firestore } from "./lib/firebase"
const INTEGRATION_ID = "testIntegrationId"

interface JobsSeed {
   /**
    * Creates the collection
    */
   createLivestreamCustomJobs(
      groupId: string,
      livestreamIds: string[]
   ): Promise<LivestreamJobAssociation[]>
   addLivestreamToCustomJobs(
      groupId: string,
      livestreamIds: string[],
      jobs: LivestreamJobAssociation[]
   )

   /**
    * TODO-WG: Add docs specifying does not create to database
    * @param groupId
    * @param livestreamIds
    * @param overrideFields
    */
   randomJob(
      groupId: string,
      livestreamIds: string[],
      overrideFields?: Partial<CustomJob>
   ): Promise<CustomJob>

   /**
    * TODO-WG: Add docs specifying does not create to database
    * @param groupId
    * @param livestreamIds
    * @param overrideFields
    */
   randomJobs(
      groupId: string,
      livestreamIds: string[],
      overrideFields?: Partial<CustomJob>
   ): Promise<CustomJob[]>

   getCustomJobs(groupId: string): Promise<CustomJob[]>

   getJobAssociations(jobs: CustomJob[]): LivestreamJobAssociation[]
}

class JobsFirebaseSeed implements JobsSeed {
   private customJobRepo: ICustomJobRepository

   /* eslint-disable  @typescript-eslint/no-explicit-any */
   constructor() {
      this.customJobRepo = new FirebaseCustomJobRepository(
         firestore as any,
         fieldValue
      )
   }
   /**
    * Creates the field or level of study collection
    */
   async createLivestreamCustomJobs(groupId: string, livestreamIds: string[]) {
      const batch = firestore.batch()

      const dummyData = await this.randomJobs(groupId, livestreamIds)
      dummyData.forEach((data) => {
         const ref = firestore.collection("customJobs").doc(data.id)
         batch.set(ref, data)
      })

      await batch.commit()
      return dummyData.map((customJob) => {
         return generateJobAssociation(groupId, customJob.id, customJob.title)
      })
   }

   async addLivestreamToCustomJobs(
      groupId: string,
      livestreamIds: string[],
      jobs: LivestreamJobAssociation[]
   ) {
      if (!jobs?.length) return
      const batch = firestore.batch()

      const dummyData = await Promise.all(
         jobs.map((jobAssociation) => {
            return this.randomJob(groupId, livestreamIds, {
               id: jobAssociation.jobId,
               title: jobAssociation.name,
               description: jobAssociation.description,
            })
         })
      )
      dummyData.forEach((data) => {
         const ref = firestore.collection("customJobs").doc(data.id)
         batch.set(ref, dummyData)
      })

      await batch.commit()
   }

   async randomJob(
      groupId: string,
      livestreamIds: string[],
      overrideFields?: Partial<CustomJob>
   ): Promise<CustomJob> {
      const data: CustomJob = {
         id: uuidv4(),
         groupId: groupId,
         documentType: "customJobs",
         title: faker.random.words(3),
         description: faker.random.words(10),
         jobType: jobTypeOptions.at(randomInt(0, jobTypeOptions.length))
            .id as JobType,
         postingUrl: faker.internet.url(),
         deadline: admin.firestore.Timestamp.fromDate(
            faker.date.soon(randomInt(5, 30))
         ),
         createdAt: admin.firestore.Timestamp.fromDate(new Date()),
         updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
         livestreams: livestreamIds,
         sparks: [],
         published: true,
         salary: `${faker.random.numeric(5, {
            allowLeadingZeros: false,
         })}-${faker.random.numeric(6, { allowLeadingZeros: false })}`,
         deleted: false,
         businessFunctionsTagIds: [],
      }

      return {
         ...data,
         ...overrideFields,
      }
   }
   async randomJobs(
      groupId: string,
      livestreamIds: string[],
      overrideFields?: Partial<CustomJob>
   ): Promise<CustomJob[]> {
      const jobs = [...Array(randomInt(1, 5)).keys()].map(() => {
         return this.randomJob(groupId, livestreamIds, overrideFields)
      })

      return Promise.all(jobs)
   }

   async getCustomJobs(groupId: string): Promise<CustomJob[]> {
      return this.customJobRepo.getGroupJobs(groupId)
   }

   getJobAssociations(jobs: CustomJob[]) {
      return jobs.map((job) => {
         return generateJobAssociation(job.groupId, job.id, job.title)
      })
   }
}

export const generateLivestreamJob = (
   groupId: string,
   jobId: string
): LivestreamJobAssociation => {
   return generateJobAssociation(jobId, groupId, faker.random.word())
}

export const generateJobAssociation = (
   groupId: string,
   jobId: string,
   name: string
): LivestreamJobAssociation => {
   return {
      integrationId: INTEGRATION_ID,
      groupId,
      jobId,
      name,
   }
}

const instance: JobsSeed = new JobsFirebaseSeed()

export default instance
