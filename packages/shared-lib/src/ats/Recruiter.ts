import { MergeRemoteUser, MergeUserRole } from "./MergeResponseTypes"
import { BaseModel } from "../BaseModel"

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
         user.remote_created_at ? new Date(user.remote_created_at) : null,
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
         recruiter.createdAt ? new Date(recruiter.createdAt) : null,
         recruiter.disabled
      )
   }

   serializeToPlainObject(): this {
      return {
         ...this,
         createdAt: this.createdAt ? this.createdAt.toISOString() : null,
      }
   }
}
