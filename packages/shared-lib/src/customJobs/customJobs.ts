import firebase from "firebase/compat"
import { Identifiable } from "../commonTypes"
import { UserData } from "../users"
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
   jobType: JobType
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
   salary?: string
   deleted?: boolean
   /**
    * Content Tag IDs
    * e.g: ["BusinessDevelopment", "Consulting"]
    */
   tagIds?: string[]
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
   | "deadline"
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

// collection path /jobApplications
export interface CustomJobApplicant extends Identifiable {
   documentType: "customJobApplicant" // simplify groupCollection Queries
   jobId: string
   user: UserData
   groupId: string // Makes it easier to query for all applicants in a group
   appliedAt: firebase.firestore.Timestamp
   livestreamId: string // The associated livestream where the user applied to the job
   job: CustomJob
   // cascaded properties from groups (collection /careerCenterData)
   companyCountry?: string
   companyIndustries?: string[]
   companySize?: string
}
