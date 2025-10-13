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
 * Splits an array into max 2 chunks to fit within Customer.io's byte limit
 * @param array Array of strings to chunk
 * @param byteLimit Maximum bytes per chunk
 * @returns Object with keys 1 and 2 containing the chunks
 */
function splitArrayIntoTwo(
   array: string[],
   byteLimit: number = CUSTOMERIO_BYTE_LIMIT
): { 1?: string[]; 2?: string[] } {
   if (!array || array.length === 0) return {}

   const encoder = new TextEncoder()
   const fullSize = encoder.encode(JSON.stringify(array)).length

   // If the whole array fits, return it as chunk 1
   if (fullSize <= byteLimit) {
      return { 1: array }
   }

   // Split in half and adjust if needed
   const midpoint = Math.ceil(array.length / 2)
   const chunk1 = array.slice(0, midpoint)
   const chunk2 = array.slice(midpoint)

   // Fine-tune chunk1 to fit within limit
   while (
      encoder.encode(JSON.stringify(chunk1)).length > byteLimit &&
      chunk1.length > 0
   ) {
      const item = chunk1.pop()
      if (item) {
         chunk2.unshift(item)
      }
   }

   return {
      1: chunk1.length > 0 ? chunk1 : undefined,
      2: chunk2.length > 0 ? chunk2 : undefined,
   }
}

/**
 * Converts a Firebase timestamp to Unix timestamp (seconds since epoch).
 * Uses Math.floor() as CustomerIO requires integer timestamps and does not accept decimal values.
 * @param timestamp Firebase timestamp
 */
export function toUnixTimestamp(timestamp: Timestamp): number | undefined {
   if (!timestamp || typeof timestamp.toDate !== "function") return undefined
   return Math.floor(timestamp.toDate().getTime() / 1000)
}

/**
 * Formats a date for use in Customer.io object names
 * @param date The date to format
 * @returns Formatted date string like "May 15, 2024"
 */
function formatDateForCustomerIO(date: Date): string {
   if (!date) return "No Date"
   return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
   })
}

/**
 * Generates a descriptive name for Customer.io livestream objects
 * Format: "Title [Company] (Date)"
 * Example: "Discover Our Internship Program [OnLogic] (May 15, 2024)"
 * @param livestream The livestream event
 * @returns Formatted name string
 */
function generateLivestreamObjectName(livestream: LivestreamEvent): string {
   const company = livestream.company || "Unknown Company"
   const title = livestream.title || "Untitled Event"
   const date = formatDateForCustomerIO(livestream.start?.toDate?.())

   return `${title} [${company}] (${date})`
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
 *
 * The `name` field is formatted as: "Title (Date)"
 * Example: "Discover Our Internship Program (May 15, 2024)"
 *
 * Speaker data is flattened into speaker1, speaker2, speaker3 fields (excludes companyName/companyLogoUrl to reduce payload size).
 * speaker_count reflects the total number of speakers.
 */
export function transformLivestreamDataForCustomerIO(
   livestream: LivestreamEvent
): CustomerIOLivestreamData {
   // Extract speaker information (up to 3 speakers as individual fields)
   // Remove companyName and companyLogoUrl to reduce payload size
   const speakers = livestream.speakers || []
   const speaker1 = speakers[0]
      ? {
           id: speakers[0].id,
           avatar: speakers[0].avatar,
           background: speakers[0].background,
           firstName: speakers[0].firstName,
           lastName: speakers[0].lastName,
           position: speakers[0].position,
           rank: speakers[0].rank,
           linkedInUrl: speakers[0].linkedInUrl,
           groupId: speakers[0].groupId,
        }
      : undefined
   const speaker2 = speakers[1]
      ? {
           id: speakers[1].id,
           avatar: speakers[1].avatar,
           background: speakers[1].background,
           firstName: speakers[1].firstName,
           lastName: speakers[1].lastName,
           position: speakers[1].position,
           rank: speakers[1].rank,
           linkedInUrl: speakers[1].linkedInUrl,
           groupId: speakers[1].groupId,
        }
      : undefined
   const speaker3 = speakers[2]
      ? {
           id: speakers[2].id,
           avatar: speakers[2].avatar,
           background: speakers[2].background,
           firstName: speakers[2].firstName,
           lastName: speakers[2].lastName,
           position: speakers[2].position,
           rank: speakers[2].rank,
           linkedInUrl: speakers[2].linkedInUrl,
           groupId: speakers[2].groupId,
        }
      : undefined

   // Split university IDs into max 2 arrays to stay within 1000 byte limit
   const universityIds = livestream.companyTargetedUniversities || []
   const universityChunks = splitArrayIntoTwo(universityIds)

   return {
      // Basic Info
      id: livestream.id,
      livestream_id: livestream.id,
      title: livestream.title || "",
      /**
       * Reserved field in Customer.io used to identify the object.
       * Format: "Title (Date)"
       * Example: "Discover Our Internship Program (May 15, 2024)"
       */
      name: generateLivestreamObjectName(livestream),
      summary: truncateString(livestream.summary, CUSTOMERIO_BYTE_LIMIT),
      start_time: toUnixTimestamp(livestream.start),
      created_at: toUnixTimestamp(livestream.created),
      last_updated: toUnixTimestamp(livestream.lastUpdated),

      // Company/Host Info
      company_name: livestream.company,
      company_logo_url: livestream.companyLogoUrl,
      group_ids: livestream.groupIds || [],
      creator_ids: livestream.creatorsIds || [],

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

      // Target universities split into max 2 arrays
      target_university_ids_1: universityChunks[1],
      target_university_ids_2: universityChunks[2],
      target_university_count:
         universityIds.length > 0 ? universityIds.length : undefined,

      target_field_of_study_ids:
         livestream.targetFieldsOfStudy?.map((f) => f.id) || [],
      target_level_of_study_ids:
         livestream.targetLevelsOfStudy?.map((l) => l.id) || [],

      // Speakers (up to 3 as individual fields without company fields)
      speaker1,
      speaker2,
      speaker3,
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
   })
}
