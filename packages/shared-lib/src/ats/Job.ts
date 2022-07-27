import { JobStatus, MergeJob } from "./MergeResponseTypes"
import { BaseModel, fromMergeDate, fromSerializedDate } from "../BaseModel"
import { Office } from "./Office"
import { Recruiter } from "./Recruiter"
import { Department } from "./Department"

/**
 * Job class
 *
 * Our own type that can be created from ATS providers
 * UI/Business logic should live here
 */
export class Job extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly name: string,
      public readonly description: string,
      public readonly status: JobStatus,
      public readonly offices: Office[],
      public readonly hiringManagers: Recruiter[],
      public readonly recruiters: Recruiter[],
      public readonly departments: Department[],
      public readonly createdAt: Date,
      public readonly updatedAt: Date
   ) {
      super()
   }

   static createFromMerge(job: MergeJob) {
      return new Job(
         job.id,
         job.name,
         // strip html tags (teamtailor)
         job.description.replace(/<[^>]*>?/gm, ""),
         job.status,
         job.offices.map(Office.createFromMerge),
         job.hiring_managers.map(Recruiter.createFromMerge),
         job.recruiters.map(Recruiter.createFromMerge),
         job.departments.map(Department.createFromMerge),
         fromMergeDate(job.remote_created_at),
         fromMergeDate(job.remote_updated_at)
      )
   }

   static createFromPlainObject(job: Job) {
      return new Job(
         job.id,
         job.name,
         job.description,
         job.status,
         job.offices.map(Office.createFromPlainObject),
         job.hiringManagers.map(Recruiter.createFromPlainObject),
         job.recruiters.map(Recruiter.createFromPlainObject),
         job.departments.map(Department.createFromPlainObject),
         fromSerializedDate(job.createdAt),
         fromSerializedDate(job.updatedAt)
      )
   }
}
