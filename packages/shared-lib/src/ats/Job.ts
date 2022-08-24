import { JobStatus, MergeJob } from "./MergeResponseTypes"
import { fromSerializedDate, mapIfObject } from "../BaseModel"
import { Office } from "./Office"
import { Recruiter } from "./Recruiter"
import { Department } from "./Department"
import { ATSModel, fromMergeDate } from "./ATSModel"

/**
 * Job class
 *
 * Our own type that can be created from ATS providers
 * UI/Business logic should live here
 */
export class Job extends ATSModel {
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
    * Get the job name plus additional information if existent
    * Useful to display in Dropdown Selectors so the user can
    * distinguish jobs
    */
   getExtendedName() {
      let title = `${this.name}, ${this.status}`

      if (this.departments.length > 0) {
         title += `, ${this.departments[0].name}`
      }

      if (this.offices.length > 0) {
         title += `, ${this.offices[0].name}`
      }

      return title
   }

   static createFromMerge(job: MergeJob) {
      return new Job(
         job.id,
         job.name,
         // strip html tags (teamtailor)
         job.description.replace(/<[^>]*>?/gm, ""),
         job.status,
         mapIfObject<Office>(job.offices, Office.createFromMerge),
         mapIfObject<Recruiter>(job.hiring_managers, Recruiter.createFromMerge),
         mapIfObject<Recruiter>(job.recruiters, Recruiter.createFromMerge),
         mapIfObject<Department>(job.departments, Department.createFromMerge),
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
         mapIfObject<Office>(job.offices, Office.createFromPlainObject),
         mapIfObject<Recruiter>(
            job.hiringManagers,
            Recruiter.createFromPlainObject
         ),
         mapIfObject<Recruiter>(
            job.recruiters,
            Recruiter.createFromPlainObject
         ),
         mapIfObject<Department>(
            job.departments,
            Department.createFromPlainObject
         ),
         fromSerializedDate(job.createdAt),
         fromSerializedDate(job.updatedAt)
      )
   }
}

/**
 * Job Identifier type
 *
 * A job has the following association:
 * Job -> Linked Account (integrationId) -> Group
 */
export interface JobIdentifier {
   jobId: string
   groupId: string
   integrationId: string
}

export const PUBLIC_JOB_STATUSES: JobStatus[] = ["OPEN", "PENDING", "CLOSED"]
