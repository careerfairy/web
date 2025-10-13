import { AxiosInstance } from "axios"
import { logger } from "firebase-functions"
import { isTestEnvironment } from "../../util"
import { createCustomerIOAxiosInstance } from "./axiosClient"

export const OBJECT_TYPES = {
   LIVESTREAMS: "1",
} as const

type ObjectTypeId = (typeof OBJECT_TYPES)[keyof typeof OBJECT_TYPES]

/**
 * Customer.io Objects API client
 * Uses HTTP requests directly since customerio-node v4.1.1 SDK doesn't have built-in support for objects
 */
export class CustomerIOObjectsClient {
   private axiosInstance: AxiosInstance | null = null

   private getAxiosInstance(): AxiosInstance {
      if (!this.axiosInstance) {
         this.axiosInstance = createCustomerIOAxiosInstance()
      }
      return this.axiosInstance
   }

   /**
    * Removes undefined values from an object
    * Customer.io doesn't accept undefined values in attributes
    */
   private cleanAttributes(
      attributes: Record<string, any>
   ): Record<string, any> {
      const cleaned: Record<string, any> = {}

      for (const [key, value] of Object.entries(attributes)) {
         if (value !== undefined && value !== null) {
            // Recursively clean nested objects
            if (value && typeof value === "object" && !Array.isArray(value)) {
               cleaned[key] = this.cleanAttributes(value)
            } else if (Array.isArray(value)) {
               // Filter out undefined/null values from arrays
               const cleanedArray = value.filter(
                  (item) => item !== undefined && item !== null
               )
               if (cleanedArray.length > 0) {
                  cleaned[key] = cleanedArray
               }
            } else {
               cleaned[key] = value
            }
         }
      }

      return cleaned
   }

   /**
    * Creates or updates an object in Customer.io
    * @param objectTypeId The type of object (e.g., "livestream")
    * @param objectId The unique identifier for the object
    * @param attributes The object attributes
    */
   public async createOrUpdateObject(
      objectTypeId: ObjectTypeId,
      objectId: string,
      attributes: Record<string, any>
   ): Promise<void> {
      if (isTestEnvironment()) {
         logger.info(
            `[TEST] Would create/update Customer.io object ${objectTypeId}:${objectId}`
         )
         return
      }

      // Clean attributes to remove undefined/null values
      const cleanedAttributes = this.cleanAttributes(attributes)

      logger.info(
         `Creating/updating Customer.io object ${objectTypeId}:${objectId}`,
         {
            attributeCount: Object.keys(cleanedAttributes).length,
            sampleKeys: Object.keys(cleanedAttributes).slice(0, 5),
         }
      )

      try {
         await this.getAxiosInstance().post("/api/v2/entity", {
            type: "object",
            action: "identify",
            identifiers: {
               object_type_id: objectTypeId,
               object_id: objectId,
            },
            attributes: cleanedAttributes,
         })
      } catch (error) {
         logger.error(
            `Failed to create/update Customer.io object ${objectTypeId}:${objectId}`,
            {
               error: error?.message,
               response: error?.response?.data,
               status: error?.response?.status,
               objectId,
               objectTypeId,
            }
         )
         throw error
      }
   }

   /**
    * Deletes an object from Customer.io
    * @param objectTypeId The type of object (e.g., "livestream")
    * @param objectId The unique identifier for the object
    */
   public async deleteObject(
      objectTypeId: ObjectTypeId,
      objectId: string
   ): Promise<void> {
      if (isTestEnvironment()) {
         logger.info(
            `[TEST] Would delete Customer.io object ${objectTypeId}:${objectId}`
         )
         return
      }

      logger.info(`Deleting Customer.io object ${objectTypeId}:${objectId}`)

      try {
         await this.getAxiosInstance().post("/api/v2/entity", {
            type: "object",
            action: "delete",
            identifiers: {
               object_type_id: objectTypeId,
               object_id: objectId,
            },
         })

         logger.info(
            `Successfully deleted Customer.io object ${objectTypeId}:${objectId}`
         )
      } catch (error) {
         // 404 errors are ok - object doesn't exist
         if (error?.response?.status === 404) {
            logger.info(
               `Customer.io object ${objectTypeId}:${objectId} doesn't exist, skipping deletion`
            )
            return
         }

         logger.error(
            `Failed to delete Customer.io object ${objectTypeId}:${objectId}`,
            {
               error: error?.message,
               response: error?.response?.data,
               status: error?.response?.status,
               objectId,
               objectTypeId,
            }
         )
         throw error
      }
   }
}
