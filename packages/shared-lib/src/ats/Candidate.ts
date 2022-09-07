import { MergeAttachment, MergeCandidate, MergeUrl } from "./MergeResponseTypes"
import { mapIfObject } from "../BaseModel"
import { Application } from "./Application"
import { ATSModel } from "./ATSModel"

export class Candidate extends ATSModel {
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

   getName() {
      return [this.firstName, this.lastName].filter((n) => n).join(" ")
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
         mapIfObject<Application>(
            candidate.applications,
            Application.createFromMerge
         ),
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
         mapIfObject<Application>(
            candidate.applications,
            Application.createFromPlainObject
         ),
         candidate.attachments
      )
   }
}
