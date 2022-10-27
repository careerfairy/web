/**
 * Every firebase document should have an ID
 */
export interface Identifiable {
   id: string
}

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
