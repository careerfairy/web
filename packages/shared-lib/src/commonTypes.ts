/**
 * Every firebase document should have an ID
 */
export interface Identifiable {
   id: string
}

/**
 * Utility type when creating documents where the id
 * field is auto generated
 */
export type Create<T extends Identifiable> = Omit<T, "id">

export type UTMParams = {
   utm_source?: string
   utm_medium?: string
   utm_campaign?: string
   utm_term?: string
   utm_content?: string
}

/**
 * Useful values that can be looped
 * (Not a type)
 */
export const UTMKeys = [
   "utm_source",
   "utm_medium",
   "utm_campaign",
   "utm_term",
   "utm_content",
]

export type OptionGroup = {
   id: string
   name: string
   groupId?: string
}

export type ImageType = {
   /**
    * The image's storage URL
    */
   url: string

   /**
    * The image's file extension
    */
   extension: string

   /**
    * The image's width in pixels
    */
   width: number

   /**
    * The image's height in pixels
    */
   height: number

   /**
    * The image file name
    */
   fileName: string

   /**
    * The image's path in the storage bucket
    */
   path: string
}
