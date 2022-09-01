import { MergeApplication } from "./MergeResponseTypes"
import { fromSerializedDate, saveIfObject } from "../BaseModel"
import { Job } from "./Job"
import { Candidate } from "./Candidate"
import { ATSModel, fromMergeDate } from "./ATSModel"

/**
 * Relationship between a Job and Candidate
 */
export class Application extends ATSModel {
   constructor(
      public readonly id: string,
      public readonly job: Job,
      public readonly candidate: Candidate,
      public readonly appliedAt?: Date,
      public readonly rejectedAt?: Date,
      public readonly source?: string,
      public readonly currentStage?: string,
      public readonly rejectReason?: string
   ) {
      super()
   }

   static createFromMerge(application: MergeApplication) {
      return new Application(
         application.id,
         saveIfObject<Job>(application.job, Job.createFromMerge),
         saveIfObject<Candidate>(
            application.candidate,
            Candidate.createFromMerge
         ),
         fromMergeDate(application.applied_at),
         fromMergeDate(application.rejected_at),
         application.source,
         application.current_stage?.name || null,
         application.reject_reason?.name || null
      )
   }

   static createFromPlainObject(application: Application) {
      return new Application(
         application.id,
         saveIfObject<Job>(application.job, Job.createFromPlainObject),
         saveIfObject<Candidate>(
            application.candidate,
            Candidate.createFromPlainObject
         ),
         fromSerializedDate(application.appliedAt),
         fromSerializedDate(application.rejectedAt),
         application.source,
         application.currentStage,
         application.rejectReason
      )
   }
}
