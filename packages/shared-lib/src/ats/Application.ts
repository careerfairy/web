import { MergeApplication } from "./MergeResponseTypes"
import { BaseModel, fromMergeDate, fromSerializedDate } from "../BaseModel"
import { Job } from "./Job"
import { Candidate } from "./Candidate"

/**
 * Relationship between a Job and Candidate
 */
export class Application extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly job: Job,
      public readonly candidate: Candidate,
      public readonly appliedAt?: Date,
      public readonly rejectedAt?: Date,
      public readonly source?: string,
      public readonly currentStage?: string
   ) {
      super()
   }

   static createFromMerge(application: MergeApplication) {
      return new Application(
         application.id,
         Job.createFromMerge(application.job),
         Candidate.createFromMerge(application.candidate),
         fromMergeDate(application.applied_at),
         fromMergeDate(application.rejected_at),
         application.source,
         application.current_stage?.name
      )
   }

   static createFromPlainObject(application: Application) {
      return new Application(
         application.id,
         Job.createFromPlainObject(application.job),
         Candidate.createFromPlainObject(application.candidate),
         fromSerializedDate(application.appliedAt),
         fromSerializedDate(application.rejectedAt),
         application.source,
         application.currentStage
      )
   }
}
