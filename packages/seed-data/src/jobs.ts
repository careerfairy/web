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
   createCustomJobs(
      groupId: string,
      livestreamIds: string[]
   ): Promise<LivestreamJobAssociation[]>

   /**
    * Creates a random customJob with the possibility of overriding the customJob fields.
    * Does not actually created data on the database.
    */
   randomJob(
      groupId: string,
      livestreamIds: string[],
      overrideFields?: Partial<CustomJob>
   ): Promise<CustomJob>

   /**
    * Creates multiple random customJob objects, with the possibility of overriding the customJob fields.
    * Does not actually created data on the database.
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
   async createCustomJobs(groupId: string, livestreamIds: string[]) {
      const promise = (await this.randomJobs(groupId, livestreamIds)).map(
         (randomJob) => {
            return this.customJobRepo.createCustomJob(randomJob)
         }
      )

      const dummyData = await Promise.all(promise)
      return dummyData.map((customJob) => {
         return generateJobAssociation(groupId, customJob.id, customJob.title)
      })
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
         isPermanentlyExpired: false,
         group: null,
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
      const query = firestore
         .collection("customJobs")
         .where("groupId", "==", groupId)

      const snap = await query.get()

      return snap?.docs.map((doc) => doc.data() as CustomJob)
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
