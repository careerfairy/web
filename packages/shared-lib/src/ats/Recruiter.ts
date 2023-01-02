import { fromSerializedDate } from "../BaseModel"
import { ATSModel, fromMergeDate } from "./ATSModel"
import { MergeRemoteUser, MergeUserRole } from "./merge/MergeResponseTypes"

export class Recruiter extends ATSModel {
   constructor(
      public readonly id: string,
      public readonly firstName: string,
      public readonly lastName: string,
      public readonly role: MergeUserRole,
      public readonly email?: string,
      public readonly createdAt?: Date,
      public readonly disabled?: boolean
   ) {
      super()
   }

   public getName() {
      if (!this.firstName && !this.lastName) {
         return this.email
      }

      return `${this.firstName ?? ""} ${this.lastName ?? ""}`.trim()
   }

   static createFromMerge(user: MergeRemoteUser) {
      return new Recruiter(
         user.id,
         user.first_name,
         user.last_name,
         user.access_role,
         user.email,
         fromMergeDate(user.remote_created_at),
         user.disabled ?? false
      )
   }

   static createFromPlainObject(recruiter: Recruiter) {
      return new Recruiter(
         recruiter.id,
         recruiter.firstName,
         recruiter.lastName,
         recruiter.role,
         recruiter.email,
         fromSerializedDate(recruiter.createdAt),
         recruiter.disabled
      )
   }
}
