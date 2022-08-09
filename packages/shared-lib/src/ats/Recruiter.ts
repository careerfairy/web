import { MergeRemoteUser, MergeUserRole } from "./MergeResponseTypes"
import { BaseModel, fromMergeDate, fromSerializedDate } from "../BaseModel"

export class Recruiter extends BaseModel {
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
      return `${this.firstName} ${this.lastName}`
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
