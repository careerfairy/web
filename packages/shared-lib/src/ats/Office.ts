import { MergeOffice } from "./MergeResponseTypes"
import { BaseModel } from "../BaseModel"

/**
 * Office class
 *
 * Our own type that can be created from ATS providers
 * UI/Business logic should live here
 */
export class Office extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly name?: string,
      public readonly location?: string
   ) {
      super()
   }

   static createFromMerge(office: MergeOffice) {
      return new Office(office.id, office.name, office.location)
   }

   static createFromPlainObject(office: Office) {
      return new Office(office.id, office.name, office.location)
   }
}
