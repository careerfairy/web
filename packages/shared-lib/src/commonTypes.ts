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
