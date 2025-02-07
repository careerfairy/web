import { Timestamp } from "../firebaseTypes"
import { UserData } from "../users"
import { CustomerIOUserData } from "./types"

/**
 * Converts a Firebase timestamp to Unix timestamp (seconds since epoch).
 * Uses Math.floor() as CustomerIO requires integer timestamps and does not accept decimal values.
 * @param timestamp Firebase timestamp
 */
function toUnixTimestamp(timestamp: Timestamp): number | undefined {
   if (!timestamp) return undefined
   return Math.floor(timestamp.toDate().getTime() / 1000)
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
      ...(userData.unsubscribed !== undefined && {
         unsubscribed: !!userData.unsubscribed,
      }),
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
