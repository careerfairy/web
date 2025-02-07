import { UTMParams } from "../commonTypes"
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"

/**
 * Type definitions for Customer.io data structure
 * Flattened for better performance and maintainability
 */
export interface CustomerIOUserData {
   // Basic Info
   auth_id: string
   email: string
   first_name: string
   last_name: string
   is_admin: boolean
   is_student: boolean
   /**
    * User's last used browser timezone
    * Reserved field in Customer.io, used for sending localized messages.
    * Format: "Europe/Zurich", "Europe/Lisbon"
    */
   timezone: string
   /**
    * Unix timestamp
    */
   created_at: number
   /**
    * Unix timestamp
    */
   last_activity_at: number
   /**
    * Unix timestamp
    */
   last_sign_in_at?: number

   // Education
   university_name: string
   university_code: string
   university_country: string
   field_of_study: FieldOfStudy
   level_of_study: LevelOfStudy

   // Professional Info
   is_looking_for_job: boolean
   linkedin_url: string
   position: string
   spoken_languages: string[]

   // Interests & Preferences
   business_functions?: string[]
   content_topics: string[]
   countries_of_interest: string[]
   regions_of_interest: string[]

   // Marketing & Analytics
   unsubscribed?: boolean
   referral_code: string
   referred_by_code: string
   account_creation_utm: UTMParams | null

   // Engagement Metrics
   credits: number

   // Platform Usage
   has_completed_onboarding: boolean
   has_job_applications: boolean
   has_resume: boolean
   has_completed_sparks_onboarding: boolean
}
