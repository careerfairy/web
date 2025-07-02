/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { Timestamp } from "firebase-admin/firestore"
import { DateTime } from "luxon"
import { v4 as uuidv4 } from "uuid"

type NewLivestreamDataOptions = {
   linkedCustomJobsTagIds?: string[]
}

type NewSparkDataOptions = {
   linkedCustomJobsTagIds?: string[]
}

type NewCustomJobDataOptions = {
   businessFunctionTagIds?: string[]
   livestreams?: string[]
   sparks?: string[]
}

type NewAndOldCustomJobDataOptions = {
   livestreams?: string[]
   sparks?: string[]
   businessFunctionTagIds?: string[]
}

export const createNewAndOldCustomJobData = (
   newCustomJobOptions: NewAndOldCustomJobDataOptions = {},
   oldCustomJobOUserOptions?: NewAndOldCustomJobDataOptions
): {
   newCustomJobData: CustomJob
   oldCustomJobData: CustomJob
} => {
   const jobId = uuidv4()
   const newJob: CustomJob = {
      id: jobId,
      groupId: "i8NjOiRu85ohJWDuFPwo",
      documentType: "customJobs",
      title: "Custom Job test - NEW customJob",
      description: "Generated customJob for unit testing tags.",
      jobType: "Full-time",
      postingUrl: "",
      deadline: Timestamp.fromDate(
         DateTime.fromJSDate(new Date()).plus({ days: 6 }).toJSDate()
      ),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      livestreams: newCustomJobOptions.livestreams ?? [],
      sparks: newCustomJobOptions.sparks ?? [],
      published: true,
      salary: "23000",
      deleted: false,
      businessFunctionsTagIds: newCustomJobOptions.businessFunctionTagIds ?? [],
      isPermanentlyExpired: false,
      group: null,
   }

   const oldJob: CustomJob = {
      id: jobId,
      groupId: "i8NjOiRu85ohJWDuFPwo",
      documentType: "customJobs",
      title: "Custom Job test - OLD customJob",
      description: "Generated customJob for unit testing tags.",
      jobType: "Full-time",
      postingUrl: "",
      deadline: Timestamp.fromDate(
         DateTime.fromJSDate(new Date()).plus({ days: 4 }).toJSDate()
      ),
      createdAt: newJob.createdAt,
      updatedAt: Timestamp.fromDate(new Date()),
      livestreams: oldCustomJobOUserOptions?.livestreams ?? [],
      sparks: oldCustomJobOUserOptions?.sparks ?? [],
      published: true,
      salary: "6000",
      deleted: false,
      businessFunctionsTagIds:
         oldCustomJobOUserOptions?.businessFunctionTagIds ?? [],
      isPermanentlyExpired: false,
      group: null,
   }

   return {
      newCustomJobData: newJob,
      oldCustomJobData: oldJob,
   }
}

export const createNewLivestreamsData = (
   limit = 5,
   options: NewLivestreamDataOptions = { linkedCustomJobsTagIds: [] }
): LivestreamEvent[] => {
   return [...Array(limit).keys()].map((_) => generateLivestreamData(options))
}

export const createNewSparksData = (
   limit = 5,
   options: NewSparkDataOptions = { linkedCustomJobsTagIds: [] }
): Spark[] => {
   return [...Array(limit).keys()].map((_) => generateSparkData(options))
}

export const createNewCustomJobsData = (
   limit = 5,
   options: NewCustomJobDataOptions = { businessFunctionTagIds: [] }
): CustomJob[] => {
   return [...Array(limit).keys()].map((_) => generateCustomJobsData(options))
}

const generateLivestreamData = (
   options: NewLivestreamDataOptions
): LivestreamEvent => {
   return {
      id: uuidv4(),
      linkedCustomJobsTagIds: options.linkedCustomJobsTagIds,
      hidden: false,
      test: true,
      start: Timestamp.fromDate(new Date()),
      triGrams: null,
   }
}

const generateSparkData = (options: NewSparkDataOptions): Spark => {
   return {
      id: uuidv4(),
      linkedCustomJobsTagIds: options.linkedCustomJobsTagIds ?? [],
      group: undefined,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      publishedAt: Timestamp.fromDate(new Date()),
      addedToFeedAt: Timestamp.fromDate(new Date()),
      creator: undefined,
      published: false,
      category: undefined,
      language: undefined,
      video: undefined,
      question: undefined,
   }
}

const generateCustomJobsData = (
   options: NewCustomJobDataOptions
): CustomJob => {
   return {
      id: uuidv4(),
      groupId: "i8NjOiRu85ohJWDuFPwo",
      documentType: "customJobs",
      title: "Custom Job for Unit test",
      description: "Test custom job used during unit tests",
      jobType: "Full-time",
      postingUrl: "",
      deadline: Timestamp.fromDate(
         DateTime.fromJSDate(new Date()).plus({ days: 7 }).toJSDate()
      ),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      published: true,
      livestreams: options.livestreams ?? [],
      sparks: options.sparks ?? [],
      businessFunctionsTagIds: options.businessFunctionTagIds ?? [],
      isPermanentlyExpired: false,
      group: null,
   }
}
