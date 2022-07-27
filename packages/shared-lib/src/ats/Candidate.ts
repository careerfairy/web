import { MergeAttachment, MergeCandidate, MergeUrl } from "./MergeResponseTypes"
import { BaseModel } from "../BaseModel"
import { Application } from "./Application"

export class Candidate extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly firstName: string,
      public readonly lastName: string,
      public readonly company?: string,
      public readonly title?: string,
      public readonly locations?: string[],
      public readonly urls?: MergeUrl[],
      public readonly applications?: Application[],
      public readonly attachments?: MergeAttachment[]
   ) {
      super()
   }

   static createFromMerge(candidate: MergeCandidate) {
      return new Candidate(
         candidate.id,
         candidate.first_name,
         candidate.last_name,
         candidate.company,
         candidate.title,
         candidate.locations,
         candidate.urls,
         candidate.applications.map(Application.createFromMerge),
         candidate.attachments
      )
   }

   static createFromPlainObject(candidate: Candidate) {
      return new Candidate(
         candidate.id,
         candidate.firstName,
         candidate.lastName,
         candidate.company,
         candidate.title,
         candidate.locations,
         candidate.urls,
         candidate.applications.map(Application.createFromPlainObject),
         candidate.attachments
      )
   }
}
