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

/**
 * Type definition for Livestream data sent to Customer.io
 * Represents livestream objects that can be used for segmentation and personalization
 */
export interface CustomerIOLivestreamData {
   // Basic Info
   livestream_id: string
   title: string
   summary?: string
   /**
    * Unix timestamp
    */
   start_time: number
   /**
    * Unix timestamp
    */
   created_at: number
   /**
    * Unix timestamp
    */
   last_updated: number

   // Company/Host Info
   company_name: string
   company_id: string
   company_logo_url: string

   // Event Status & Type
   is_test: boolean
   is_hidden: boolean
   is_draft: boolean
   has_started: boolean
   has_ended: boolean
   /**
    * Unix timestamp
    */
   started_at: number
   /**
    * Unix timestamp
    */
   ended_at: number

   // Event Details
   duration: number
   language_code: string
   language_name: string
   timezone: string
   is_hybrid: boolean
   is_face_to_face: boolean
   external_event_link: string

   // Content Tags & Targeting
   business_functions_tag_ids: string[]
   business_functions_tag_names: string[]
   content_topics_tag_ids: string[]
   content_topics_tag_names: string[]
   target_country_ids: string[]
   target_country_names: string[]
   target_universities: string[]
   target_field_of_study_ids: string[]
   target_field_of_study_names: string[]
   target_level_of_study_ids: string[]
   target_level_of_study_names: string[]

   // Speakers
   speaker_names?: string[]
   speaker_positions?: string[]
   speaker_count?: number

   // Call to Actions
   has_active_ctas?: boolean

   // Jobs
   has_jobs?: boolean
   linked_custom_jobs_tag_ids?: string[]

   // Mode & Features
   is_panel: boolean
   panel_logo_url: string
   open_stream: boolean
   with_resume: boolean
   deny_recording_access: boolean
}
