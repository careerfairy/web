import { JobStatus, MergeJob } from "./MergeResponseTypes"
import { BaseModel } from "../BaseModel"
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

   /**
    * Convert from a class object to plain object with primitive types
    * Useful to return as JSON responses from the backend
    *
    * Don't forget to convert it again to a class type (createFromPlainObject)
    * otherwise functions won't be accessible
    */
   serializeToPlainObject() {
      return {
         ...this,
         createdAt: this.createdAt.toISOString(),
      }
   }

   static createFromMerge(job: MergeJob) {
      return new Job(
         job.id,
         job.name,
         // strip html tags (teamtailor)
         job.description.replace(/<[^>]*>?/gm, ""),
         job.status,
         job.offices.map((o) => Office.createFromMerge(o)),
         job.hiring_managers.map((h) => Recruiter.createFromMerge(h)),
         job.recruiters.map((r) => Recruiter.createFromMerge(r)),
         job.departments.map((d) => Department.createFromMerge(d)),
         new Date(job.remote_created_at),
         new Date(job.remote_updated_at)
      )
   }

   static createFromPlainObject(job: Job) {
      return new Job(
         job.id,
         job.name,
         job.description,
         job.status,
         job.offices.map((o) => Office.createFromPlainObject(o)),
         job.hiringManagers.map((h) => Recruiter.createFromPlainObject(h)),
         job.recruiters.map((r) => Recruiter.createFromPlainObject(r)),
         job.departments.map((d) => Department.createFromPlainObject(d)),
         new Date(job.createdAt),
         new Date(job.updatedAt)
      )
   }
}
