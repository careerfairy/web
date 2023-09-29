import { Identifiable } from "../commonTypes"
import firebase from "firebase/compat"
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
   applicants?: string[]
   // livestreams ids where this job opening is shown
   livestreams?: string[]
   //increases every time a talent clicks on the jobPostingUrl
   clicks?: number
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
      id: job.id ?? null,
      groupId: job.groupId ?? null,
      title: job.title ?? null,
      description: job.description ?? null,
      jobType: job.jobType ?? null,
      postingUrl: job.postingUrl ?? null,
      deadline: job.deadline ?? null,
      salary: job.salary ?? null,
   }
}
