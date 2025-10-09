import {
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
} from "../constants/tags"
import { Timestamp } from "../firebaseTypes"
import { LivestreamEvent } from "../livestreams/livestreams"
import { UserData } from "../users"
import { addUtmTagsToLink } from "../utils"
import { makeLivestreamEventDetailsUrl } from "../utils/urls"
import { CustomerIOLivestreamData, CustomerIOUserData } from "./types"

/**
 * Customer.io has a 1000 byte limit per property value
 * We use a slightly lower limit to account for JSON encoding overhead
 */
const CUSTOMERIO_BYTE_LIMIT = 950

/**
 * Truncates a string to fit within the byte limit
 */
function truncateString(
   str: string | undefined,
   byteLimit: number
): string | undefined {
   if (!str) return str

   const encoder = new TextEncoder()

   // Check if already under limit
   if (encoder.encode(str).length <= byteLimit) return str

   // Simple iterative approach: remove characters until it fits
   let truncated = str
   while (
      encoder.encode(truncated + "...").length > byteLimit &&
      truncated.length > 0
   ) {
      truncated = truncated.slice(0, -1)
   }

   return truncated.length > 0 ? truncated + "..." : ""
}

/**
 * Converts a Firebase timestamp to Unix timestamp (seconds since epoch).
 * Uses Math.floor() as CustomerIO requires integer timestamps and does not accept decimal values.
 * @param timestamp Firebase timestamp
 */
export function toUnixTimestamp(timestamp: Timestamp): number | undefined {
   if (!timestamp) return undefined
   return Math.floor(timestamp.toDate().getTime() / 1000)
}

/**
 * Maps business function tag IDs to their display names
 */
function mapBusinessFunctionTagIdsToNames(tagIds?: string[]): string[] {
   if (!tagIds || tagIds.length === 0) return []
   const tagMap: Map<string, string> = new Map(
      BusinessFunctionsTagValues.map((t) => [t.id, t.name])
   )
   return tagIds
      .map((id) => tagMap.get(id))
      .filter((name) => name !== undefined) as string[]
}

/**
 * Maps content topic tag IDs to their display names
 */
function mapContentTopicTagIdsToNames(tagIds?: string[]): string[] {
   if (!tagIds || tagIds.length === 0) return []
   const tagMap: Map<string, string> = new Map(
      ContentTopicsTagValues.map((t) => [t.id, t.name])
   )
   return tagIds
      .map((id) => tagMap.get(id))
      .filter((name) => name !== undefined) as string[]
}

/**
 * Helper function to transform UserData to CustomerIO format
 */
export function transformUserDataForCustomerIO(
   userData: UserData
): CustomerIOUserData {
   return {
      // Basic Info
      email: userData.userEmail,
      auth_id: userData.authId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      is_admin: !!userData.isAdmin,
      is_student: !!userData.isStudent,
      created_at: toUnixTimestamp(userData.createdAt),
      last_activity_at: toUnixTimestamp(userData.lastActivityAt),
      last_sign_in_at: toUnixTimestamp(userData.lastSignInAt),
      timezone: userData.timezone,

      // Education
      university_name: userData.university?.name,
      university_code: userData.university?.code,
      university_country: userData.universityCountryCode,
      field_of_study: userData.fieldOfStudy,
      level_of_study: userData.levelOfStudy,

      // Professional Info
      is_looking_for_job: !!userData.isLookingForJob,
      linkedin_url: userData.linkedinUrl,
      position: userData.position,
      spoken_languages: userData.spokenLanguages,

      // Interests & Preferences
      business_functions: userData.businessFunctionsTagIds,
      content_topics: userData.contentTopicsTagIds,
      countries_of_interest: userData.countriesOfInterest,
      regions_of_interest: userData.regionsOfInterest,

      // Marketing & Analytics
      unsubscribed: userData.unsubscribed ?? true,
      referral_code: userData.referralCode,
      referred_by_code: userData.referredBy?.referralCode,
      account_creation_utm: userData.accountCreationUTMParams,

      // Platform Usage
      has_completed_onboarding: !!userData.welcomeDialogComplete,
      has_job_applications: !!userData.hasJobApplications,
      has_resume: !!userData.userResume,
      has_completed_sparks_onboarding:
         !!userData.hasCompletedSparksB2BOnboarding,

      // Engagement Metrics
      credits: userData.credits,
   }
}

/**
 * Helper function to transform LivestreamEvent to CustomerIO format
 * Flattens livestream attributes for use in Customer.io segmentation and personalization
 */
export function transformLivestreamDataForCustomerIO(
   livestream: LivestreamEvent
): CustomerIOLivestreamData {
   // Extract speaker information
   const speakers = livestream.speakers || []
   const speakerNames = speakers
      .map((s) => `${s.firstName || ""} ${s.lastName || ""}`.trim())
      .filter(Boolean)
   const speakerPositions = speakers
      .map((s) => s.position)
      .filter((p): p is string => !!p)

   return {
      // Basic Info
      livestream_id: livestream.id,
      title: livestream.title || "",
      name: livestream.title || "",
      summary: truncateString(livestream.summary, CUSTOMERIO_BYTE_LIMIT),
      start_time: toUnixTimestamp(livestream.start),
      created_at: toUnixTimestamp(livestream.created),
      last_updated: toUnixTimestamp(livestream.lastUpdated),

      // Company/Host Info
      company_name: livestream.company,
      company_id: livestream.companyId,
      company_logo_url: livestream.companyLogoUrl,

      // Event Status & Type
      is_test: !!livestream.test,
      is_hidden: !!livestream.hidden,
      is_draft: !!livestream.isDraft,
      has_started: !!livestream.hasStarted,
      has_ended: !!livestream.hasEnded,
      started_at: toUnixTimestamp(livestream.startedAt),
      ended_at: toUnixTimestamp(livestream.endedAt),

      // Event Details
      duration: livestream.duration,
      language_code: livestream.language?.code,
      language_name: livestream.language?.name,
      timezone: livestream.timezone,
      is_hybrid: livestream.isHybrid,
      is_face_to_face: livestream.isFaceToFace,
      external_event_link: livestream.externalEventLink,

      // Content Tags & Targeting
      business_functions_tag_ids: livestream.businessFunctionsTagIds || [],
      business_functions_tag_names: mapBusinessFunctionTagIdsToNames(
         livestream.businessFunctionsTagIds
      ),
      content_topics_tag_ids: livestream.contentTopicsTagIds || [],
      content_topics_tag_names: mapContentTopicTagIdsToNames(
         livestream.contentTopicsTagIds
      ),
      target_country_ids: livestream.targetCountries?.map((c) => c.id) || [],
      target_country_names:
         livestream.targetCountries?.map((c) => c.name) || [],
      target_university_ids: livestream.companyTargetedUniversities || [],
      target_field_of_study_ids:
         livestream.targetFieldsOfStudy?.map((f) => f.id) || [],
      target_field_of_study_names:
         livestream.targetFieldsOfStudy?.map((f) => f.name) || [],
      target_level_of_study_ids:
         livestream.targetLevelsOfStudy?.map((l) => l.id) || [],
      target_level_of_study_names:
         livestream.targetLevelsOfStudy?.map((l) => l.name) || [],

      // Speakers
      speaker_names: speakerNames.length > 0 ? speakerNames : undefined,
      speaker_positions:
         speakerPositions.length > 0 ? speakerPositions : undefined,
      speaker_count: speakers.length > 0 ? speakers.length : undefined,

      // Call to Actions
      has_active_ctas:
         livestream.activeCallToActionIds &&
         livestream.activeCallToActionIds.length > 0,

      // Jobs
      has_jobs: livestream.hasJobs,
      linked_custom_jobs_tag_ids: livestream.linkedCustomJobsTagIds,

      // Mode & Features
      is_panel: livestream.isPanel,
      panel_logo_url: livestream.panelLogoUrl,
      open_stream: livestream.openStream,
      with_resume: livestream.withResume,
      deny_recording_access: livestream.denyRecordingAccess,

      // Marketing & Automation
      livestream_url: generateLivestreamUrlWithUTM(livestream.id),
   }
}

/**
 * Generates a full livestream URL with predefined UTM parameters for talent mail campaigns
 * @param livestreamId The livestream identifier
 * @returns Full URL with UTM parameters for Customer.io talent mail campaigns
 */
function generateLivestreamUrlWithUTM(livestreamId: string): string {
   const baseUrl = makeLivestreamEventDetailsUrl(livestreamId)

   return addUtmTagsToLink({
      link: baseUrl,
      source: "customerio",
      medium: "email",
      campaign: "talent_mail",
   })
}
