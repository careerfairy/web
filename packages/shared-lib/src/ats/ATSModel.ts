import { BaseModel } from "../BaseModel"

/**
 * Common functionality for ATS model classes
 */
export abstract class ATSModel extends BaseModel {
   /**
    * Change to false if the model only has the ID
    * Some relationship objects are not expanded, and we only got the id
    * If this flag is false, the user should fetch the whole object from ATS
    * and re-hydrate this object
    * @protected
    */
   public hydrated = true

   /**
    * Linked Account ID
    * Useful when we need to relate the model with the account
    */
   public integrationId?: string

   public setIntegrationId(linkedAccountId: string) {
      this.integrationId = linkedAccountId
   }
}

/**
 * Convert a Merge date string to Date object
 *
 * @param dateString
 */
export function fromMergeDate(dateString?: string): Date {
   return dateString ? new Date(dateString) : null
}
