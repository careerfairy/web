import firebase from "firebase/compat/app"
import { Identifiable } from "../commonTypes"
import { UserData } from "../users"
import { CUSTOM_JOB_CONSTANTS } from "./constants"
/**
 * Collection path: /careerCenterData/[groupId]/customJobs/[jobId]
 * CustomJob is attached to a single group but can be related to multiple live streams
 */
export interface CustomJob extends Identifiable {
   // job belongs to a group
   groupId: string
   documentType: "customJobs" // simplify groupCollection Queries

   title: string
   description: string
   postingUrl: string
   deadline: firebase.firestore.Timestamp
   createdAt: firebase.firestore.Timestamp
   updatedAt: firebase.firestore.Timestamp
   // live streams ids where this job opening is shown
   livestreams: string[]
   // sparks ids where this job opening is shown
   sparks: string[]
   published: boolean

   // optional fields
   jobType?: JobType
   salary?: string
   deleted?: boolean
   /**
    * Content Tag IDs
    * e.g: ["BusinessDevelopment", "Consulting"]
    */
   businessFunctionsTagIds?: string[]

   // for jobs that have expired more than 30 days ago
   isPermanentlyExpired: boolean
}

export type PublicCustomJob = Pick<
   CustomJob,
   | "id"
   | "groupId"
   | "title"
   | "description"
   | "jobType"
   | "postingUrl"
   | "deadline"
   | "salary"
   | "deleted"
   | "businessFunctionsTagIds"
   | "livestreams"
   | "sparks"
   | "isPermanentlyExpired"
>

export type PublicCustomJobApplicant = Pick<
   CustomJobApplicant,
   "id" | "jobId" | "companyCountry" | "companyIndustries" | "companySize"
>

export type JobType =
   | "Full-time"
   | "Part-time"
   | "Graduate Programme"
   | "Internship"

export const jobTypeOptions = [
   { value: "Full-time", label: "Full-time", id: "Full-time" },
   { value: "Part-time", label: "Part-time", id: "Part-time" },
   {
      value: "Graduate Programme",
      label: "Graduate Programme",
      id: "Graduate Programme",
   },
   { value: "Internship", label: "Internship", id: "Internship" },
]

export const pickPublicDataFromCustomJob = (
   job: CustomJob
): PublicCustomJob => {
   if (!job) return null
   return {
      id: job.id,
      groupId: job.groupId ?? null,
      title: job.title ?? null,
      description: job.description ?? null,
      jobType: job.jobType ?? null,
      postingUrl: job.postingUrl ?? null,
      deadline: job.deadline ?? null,
      salary: job.salary ?? null,
      deleted: job.deleted ?? false,
      businessFunctionsTagIds: job.businessFunctionsTagIds ?? [],
      livestreams: job.livestreams ?? [],
      sparks: job.sparks ?? [],
      isPermanentlyExpired: job.isPermanentlyExpired ?? false,
   }
}

export const pickPublicDataFromCustomJobApplicant = (
   jobApplicant: CustomJobApplicant
): PublicCustomJobApplicant => {
   return {
      id: jobApplicant.id,
      jobId: jobApplicant.jobId ?? null,
      companyCountry: jobApplicant?.companyCountry,
      companyIndustries: jobApplicant?.companyIndustries ?? [],
      companySize: jobApplicant?.companySize,
   }
}

// collection path /customJobStats
export interface CustomJobStats extends Identifiable {
   documentType: "customJobStats" // simplify groupCollection Queries
   jobId: string
   groupId: string
   // increases every time a talent clicks on the jobPostingUrl
   clicks: number
   // increases every time an application is created related to this job
   applicants: number
   job: CustomJob
   deleted: boolean
   deletedAt: firebase.firestore.Timestamp | null
}

export const CustomJobApplicationSourceTypes = {
   Spark: "spark",
   Livestream: "livestream",
   Group: "group",
   Portal: "portal",
   Profile: "profile",
   Notification: "notification",
   Levels: "levels",
} as const

export type JobApplicationSource =
   (typeof CustomJobApplicationSourceTypes)[keyof typeof CustomJobApplicationSourceTypes]

// Beware some IDs are logical, meaning it might not lead to a specific document in collections, i.e. when type = 'portal', the ID
// of the linked content is purely logical thus retrieving a document with this ID is not intended.
export type CustomJobApplicationSource = {
   source: JobApplicationSource
} & Identifiable

// collection path /jobApplications
export interface CustomJobApplicant extends Identifiable {
   documentType: "customJobApplicant" // simplify groupCollection Queries
   jobId: string
   user: UserData
   groupId: string // Makes it easier to query for all applicants in a group
   appliedAt?: firebase.firestore.Timestamp
   livestreamId?: string // The associated livestream where the user applied to the job
   applicationSource?: CustomJobApplicationSource // replaces livestreamId only
   job: CustomJob
   applied?: boolean
   createdAt?: firebase.firestore.Timestamp
   // cascaded properties from groups (collection /careerCenterData)
   companyCountry?: string
   companyIndustries?: string[]
   companySize?: string

   // when set to true the job application should not appear in the listings
   // when reapplying since this is not taken into consideration this field will not be present, making the
   // still appear again in the user profile
   removedFromUserProfile?: boolean
}

// collection path /anonymousJobApplications
// The id of this collection shall be the user finger print id (see custom hook 'useFingerPrint')
export interface AnonymousJobApplication extends Identifiable {
   createdAt: firebase.firestore.Timestamp
   fingerPrintId: string
   jobId: string
   applicationSource: CustomJobApplicationSource
   applied: boolean
   appliedAt?: firebase.firestore.Timestamp
   userId?: string // Optional and set upon user registration when matching the finger print ID
   applicationSynchronized?: boolean
}

export const getMaxDaysAfterDeadline = (): Date => {
   const date = new Date()
   date.setDate(date.getDate() - CUSTOM_JOB_CONSTANTS.MAX_DAYS_AFTER_DEADLINE)

   return date
}

/**
 * Checks if a job has no linked content (live streams or sparks) and if its deadline has not expired.
 *
 */
export const jobHasContent = (job: CustomJob): boolean => {
   return job.livestreams.length != 0 || job.sparks.length != 0
}

/**
 * Sorts an array of jobs or job statistics based on their deadline.
 *
 * This function prioritizes jobs that are still active (not expired) and then sorts them by their deadline proximity to the current date.
 *
 * @param jobs {(CustomJob | CustomJobStats)[]} - The array of jobs or job statistics to be sorted.
 * @returns {(CustomJob | CustomJobStats)[]} - The sorted array of jobs or job statistics.
 */
export const sortCustomJobs = <T extends CustomJob | CustomJobStats>(
   jobs: T[]
): T[] => {
   const now = new Date()

   // Clone the original 'jobs' array to avoid mutation
   const sortedJobs = [...jobs]

   return sortedJobs.sort((a, b) => {
      // Extract the CustomJob object from 'a' and 'b' based on the presence of a 'job' property
      const jobA: CustomJob = "job" in a ? a.job : a
      const jobB: CustomJob = "job" in b ? b.job : b

      // First, prioritize jobs that are still active (not expired)
      const aDeadlineValid = jobA.deadline.toDate() > now
      const bDeadlineValid = jobB.deadline.toDate() > now

      if (aDeadlineValid && !bDeadlineValid) return -1 // 'a' is active, 'b' is not
      if (!aDeadlineValid && bDeadlineValid) return 1 // 'a' is not active, 'b' is

      // Second, prioritize if jobs is valid based on job content
      const jobAHasContent = jobHasContent(jobA)
      const jobBHasContent = jobHasContent(jobB)

      if (jobAHasContent && !jobBHasContent) return -1
      if (!jobAHasContent && jobBHasContent) return 1

      // For jobs with the same expiration status, sort by deadline proximity to the current date
      const aDeadline = jobA.deadline.toDate()
      const bDeadline = jobB.deadline.toDate()

      const aDeadlineDiff = Math.abs(aDeadline.getTime() - now.getTime())
      const bDeadlineDiff = Math.abs(bDeadline.getTime() - now.getTime())

      if (aDeadlineDiff < bDeadlineDiff) return -1 // 'a' deadline is closer to today
      if (aDeadlineDiff > bDeadlineDiff) return 1 // 'b' deadline is closer to today

      // If all conditions are equal, maintain the original order
      return 0
   })
}

export const sortCustomJobsByDeadline = (jobs: CustomJob[]) => {
   const now = new Date()

   // Clone the original 'jobs' array to avoid mutation
   const sortedJobs = [...jobs]

   return sortedJobs.sort((jobA, jobB) => {
      // First, prioritize jobs that are still active (not expired)
      const aDeadlineValid = jobA.deadline.toDate() > now
      const bDeadlineValid = jobB.deadline.toDate() > now

      if (aDeadlineValid && !bDeadlineValid) return -1 // 'a' is active, 'b' is not
      if (!aDeadlineValid && bDeadlineValid) return 1 // 'a' is not active, 'b' is

      // For jobs with the same expiration status, sort by deadline proximity to the current date
      const aDeadline = jobA.deadline.toDate()
      const bDeadline = jobB.deadline.toDate()

      const aDeadlineDiff = Math.abs(aDeadline.getTime() - now.getTime())
      const bDeadlineDiff = Math.abs(bDeadline.getTime() - now.getTime())

      if (aDeadlineDiff < bDeadlineDiff) return -1 // 'a' deadline is closer to today
      if (aDeadlineDiff > bDeadlineDiff) return 1 // 'b' deadline is closer to today

      // If all conditions are equal, maintain the original order
      return 0
   })
}

export const sortCustomJobsByApplication = (
   jobApplications: CustomJobApplicant[]
): CustomJob[] => {
   return jobApplications
      .sort(sortCustomJobsByUserApplicationDate)
      .map((jobApplication) => jobApplication.job)
}

const sortCustomJobsByUserApplicationDate = (
   applicationA: CustomJobApplicant,
   applicationB: CustomJobApplicant
) => {
   if (applicationB.appliedAt.toDate() > applicationA.appliedAt.toDate())
      return 1
   return -1
}
