import { Timestamp } from "firebase/firestore"
import { BaseModel, fromSerializedDate } from "../BaseModel"
import {
   fromDateConverter,
   fromDateFirestoreFn,
   toDate,
} from "../firebaseTypes"
import {
   PublicGroup,
   deserializePublicGroup,
   serializePublicGroup,
} from "../groups"
import { SerializedPublicGroup } from "../groups/groups"
import { CustomJob, JobType } from "./customJobs"
export interface SerializedCustomJob
   extends Omit<CustomJob, "createdAt" | "updatedAt" | "deadline" | "group"> {
   createdAt: number
   updatedAt: number
   deadline: number
   group: SerializedPublicGroup
}

export class CustomJobsPresenter extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly groupId: string,
      public readonly documentType: "customJobs",
      public readonly title: string,
      public readonly description: string,
      public readonly postingUrl: string,
      public readonly deadline: Date,
      public readonly createdAt: Date,
      public readonly updatedAt: Date,
      public readonly livestreams: string[],
      public readonly sparks: string[],
      public readonly published: boolean,
      public readonly jobType?: JobType,
      public readonly salary?: string,
      public readonly deleted?: boolean,
      public readonly businessFunctionsTagIds?: string[],
      public readonly isPermanentlyExpired?: boolean,
      public readonly disableUrlTracking?: boolean,
      public readonly group?: PublicGroup
   ) {
      super()
   }

   static createFromPlainObject(customJob: CustomJobsPresenter) {
      return new CustomJobsPresenter(
         customJob.id,
         customJob.groupId,
         customJob.documentType,
         customJob.title,
         customJob.description,
         customJob.postingUrl,
         fromSerializedDate(customJob.deadline),
         fromSerializedDate(customJob.createdAt),
         fromSerializedDate(customJob.updatedAt),
         customJob.livestreams,
         customJob.sparks,
         customJob.published,
         customJob.jobType,
         customJob.salary,
         customJob.deleted,
         customJob.businessFunctionsTagIds,
         customJob.isPermanentlyExpired,
         customJob.disableUrlTracking,
         customJob.group
      )
   }

   static parseDocument(
      customJob: CustomJobsPresenter,
      fromDate: fromDateFirestoreFn
   ) {
      return CustomJobsPresenter.createFromPlainObject(
         customJob
      ).convertToDocument(fromDate)
   }
   static createFromDocument(doc: CustomJob) {
      return new CustomJobsPresenter(
         doc.id,
         doc.groupId,
         doc.documentType,
         doc.title,
         doc.description,
         doc.postingUrl,
         toDate(doc.deadline),
         toDate(doc.createdAt),
         toDate(doc.updatedAt),
         doc.livestreams,
         doc.sparks,
         doc.published,
         doc.jobType,
         doc.salary,
         doc.deleted,
         doc.businessFunctionsTagIds,
         doc.isPermanentlyExpired,
         doc.disableUrlTracking,
         doc.group
      )
   }
   static serializeDocument(doc: CustomJob) {
      const serialized =
         CustomJobsPresenter.createFromDocument(doc).serializeToPlainObject()

      return {
         ...serialized,
         group: serializePublicGroup(serialized.group),
      } as SerializedCustomJob
   }

   static deserialize(
      serializedCustomJob: SerializedCustomJob
   ): CustomJobsPresenter {
      return new CustomJobsPresenter(
         serializedCustomJob.id,
         serializedCustomJob.groupId,
         serializedCustomJob.documentType,
         serializedCustomJob.title,
         serializedCustomJob.description,
         serializedCustomJob.postingUrl,
         fromSerializedDate(serializedCustomJob.deadline),
         fromSerializedDate(serializedCustomJob.createdAt),
         fromSerializedDate(serializedCustomJob.updatedAt),
         serializedCustomJob.livestreams,
         serializedCustomJob.sparks,
         serializedCustomJob.published,
         serializedCustomJob.jobType,
         serializedCustomJob.salary,
         serializedCustomJob.deleted,
         serializedCustomJob.businessFunctionsTagIds,
         serializedCustomJob.isPermanentlyExpired,
         deserializePublicGroup(serializedCustomJob.group, Timestamp.fromDate)
      )
   }

   convertToDocument(fromDate: fromDateFirestoreFn): CustomJob {
      return {
         id: this.id,
         groupId: this.groupId,
         documentType: this.documentType,
         title: this.title,
         description: this.description,
         postingUrl: this.postingUrl,
         deadline: fromDateConverter(this.deadline, fromDate),
         createdAt: fromDateConverter(this.createdAt, fromDate),
         updatedAt: fromDateConverter(this.updatedAt, fromDate),
         livestreams: this.livestreams,
         sparks: this.sparks,
         published: this.published,
         jobType: this.jobType,
         salary: this.salary,
         deleted: this.deleted,
         businessFunctionsTagIds: this.businessFunctionsTagIds,
         isPermanentlyExpired: this.isPermanentlyExpired,
         disableUrlTracking: this.disableUrlTracking,
         group: this.group,
      }
   }
}
