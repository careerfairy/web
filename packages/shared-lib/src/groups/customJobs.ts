import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat"
import { UserData } from "../users"
/**
 * Collection path: /careerCenterData/[groupId]/customJobs/[jobId]
 * CustomJob is attached to a single group but can be related to multiple live streams
 */
export interface CustomJob extends Identifiable {
   // job belongs to a group
   groupId: string
   documentType: "groupCustomJob" // simplify groupCollection Queries

   title: string
   description: string
   jobType: JobType
   postingUrl: string
   deadline: firebase.firestore.Timestamp
   createdAt: firebase.firestore.Timestamp
   updatedAt: firebase.firestore.Timestamp

   // optional fields
   salary?: string
   // applicants ids
   applicants?: string[] //TODO: deprecated migrate to CustomJobApplicants sub collection from CustomJobStats collection
   // livestreams ids where this job opening is shown
   livestreams: string[]
   //increases every time a talent clicks on the jobPostingUrl
   clicks: number //TODO: deprecated migrate to CustomJobStats collection
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
>

export type JobType =
   | "Full-time"
   | "Part-time"
   | "Graduate Programme"
   | "Internship"

export const jobTypeOptions = [
   { value: "Full-time", label: "Full-time" },
   { value: "Part-time", label: "Part-time" },
   { value: "Graduate Programme", label: "Graduate Programme" },
   { value: "Internship", label: "Internship" },
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
   }
}

// collection path /customJobStats
export interface CustomJobStats extends Identifiable {
   jobId: string
   documentType: "customJobStats" // simplify groupCollection Queries
   //increases every time a talent clicks on the jobPostingUrl
   clicks: number
   job: CustomJob
}

// collection path /customJobStats/{jobId}/customJobApplicants
export interface CustomJobApplicants extends Identifiable {
   documentType: "customJobApplicants" // simplify groupCollection Queries
   jobId: string
   user: UserData
}
