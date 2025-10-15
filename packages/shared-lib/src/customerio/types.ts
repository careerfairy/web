import { UTMParams } from "../commonTypes"
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"

/**
 * Type definitions for Customer.io data structure
 * Flattened for better performance and maintainability
 */

/**
 * Speaker data for Customer.io
 * Excludes companyName and companyLogoUrl to reduce payload size
 */
export interface CustomerIOSpeaker {
   id: string
   avatar?: string
   firstName?: string
   lastName?: string
   position?: string
   rank?: number
   linkedInUrl?: string
   groupId?: string
}

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
 * Type definition for User-Livestream Relationship attributes in Customer.io
 * These attributes are attached to the relationship between a user and a livestream object
 *
 * Note: Customer.io maintains ONE relationship per user-livestream pair. When a user
 * both registers and participates, the attributes are merged (not duplicated).
 */
export interface CustomerIOLivestreamRelationshipAttributes {
   // Registration data
   registered_at?: number // Unix timestamp
   registration_origin_source?: string // Where the registration came from (e.g., "portal-past-livestreams-carousel")
   registration_utm?: UTMParams // UTM parameters at time of registration

   // Participation data
   participated_at?: number // Unix timestamp
   participation_utm?: UTMParams // UTM parameters at time of participation
}

/**
 * Type definition for Livestream data sent to Customer.io
 * Represents livestream objects that can be used for segmentation and personalization
 */
export interface CustomerIOLivestreamData {
   // Basic Info
   id: string
   livestream_id: string
   title: string
   /**
    * Reserved field in Customer.io used to identify the object.
    * Format: "[Company] Title (Date)"
    * Example: "[OnLogic] Discover Our Internship Program (May 15, 2024)"
    */
   name: string
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
   company_logo_url: string
   company_industries: string[]
   company_sizes: string[]
   company_countries: string[]
   group_ids: string[]
   creator_ids: string[]

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

   // Content Tags & Targeting
   business_functions_tag_ids: string[]
   business_functions_tag_names: string[]
   content_topics_tag_ids: string[]
   content_topics_tag_names: string[]
   target_country_ids: string[]

   // Target universities split into max 2 arrays to stay within 1000 byte limit per property
   target_university_ids_1?: string[]
   target_university_ids_2?: string[]
   target_university_count?: number

   target_field_of_study_ids: string[]
   target_level_of_study_ids: string[]

   // Speakers (dynamic speaker fields for any number of speakers)
   speaker_count?: number
   // Dynamic speaker fields will be added as speaker1, speaker2, speaker3, etc.
   [key: `speaker${number}`]: CustomerIOSpeaker | undefined

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

   // Marketing & Automation
   livestream_url: string
}
