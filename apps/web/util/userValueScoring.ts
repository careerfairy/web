import { UserData } from "@careerfairy/shared-lib/users"

//=============================================================================
// SCORING WEIGHTS
//=============================================================================

const VALUE_WEIGHTS = {
   //-------------------------------------------------------------------------
   // Academic Scoring
   //-------------------------------------------------------------------------
   // Education level weights
   levelOfStudy: {
      Bachelor: 20,
      Master: 25,
      PhD: 15,
   },
   // Field of study weights - grouped by score value
   fieldOfStudy: {
      // High value fields (50 points)
      business_administration: 50,
      business_engineering: 50,
      chemical_engineering: 50,
      chemistry: 50,
      civil_engineering: 50,
      computer_science: 50,
      life_sciences: 50,
      materials_science: 50,
      mechanical_engineering: 50,
      physics: 50,
      systems_engineering: 50,
      finance: 50,

      // Medium-high value fields (40 points)
      biology: 40,
      medicine: 40,
      psychology: 40,
      transportation: 40,

      // Medium value fields (30 points)
      agriculture: 30,
      education: 30,
      environmental: 30,
      journalism: 30,
      law: 30,
      space_science: 30,

      // Lower value fields (10 points)
      anthropology: 10,
      archaeology: 10,
      architecture: 10,
      history: 10,
      human_physics: 10,
      linguistics: 10,
      literature: 10,
      luxury: 10,
      marketing: 10,
      mathematics: 10,
      military_science: 10,
      philosophy: 10,
      political_science: 10,
      public_administration: 10,
      religion: 10,
      sociology: 10,

      // Non-target fields (0 points)
      astronomy: 0,
      divinity: 0,

      // Default scoring
      other: 10,
      default: 10, // For any unlisted fields
   },

   //-------------------------------------------------------------------------
   // Location Scoring
   //-------------------------------------------------------------------------
   // University location weights
   universityCountryCode: {
      DE: 25, // Germany
      CH: 25, // Switzerland
      AT: 20, // Austria
      NL: 20, // Netherlands
      // Rest-EU countries
      BE: 15, // Belgium
      DK: 15, // Denmark
      FR: 15, // France
      IT: 15, // Italy
      // etc...
      default: 5, // Non-EU countries
   },

   // Current location weights
   currentRegion: {
      DE: 25, // Germany
      CH: 25, // Switzerland
      AT: 20, // Austria
      NL: 20, // Netherlands
      // Rest-EU countries
      BE: 15,
      DK: 15,
      FR: 15,
      IT: 15,
      // etc...
      default: 5, // Non-EU countries
   },

   //-------------------------------------------------------------------------
   // Language & Communication
   //-------------------------------------------------------------------------
   // Language proficiency weights
   spokenLanguages: {
      de: 25, // German
      en: 25, // English
      nl: 15, // Dutch
      fr: 15, // French
      it: 15, // Italian
      es: 15, // Spanish
      default: 5, // Other languages
   },

   //-------------------------------------------------------------------------
   // Profile & Engagement
   //-------------------------------------------------------------------------
   isLookingForJob: 30, // Job seeking status
   isSubscribed: 20, // Email engagement
   hasLinkedin: 20, // LinkedIn profile presence
}

//=============================================================================
// MAXIMUM SCORES CALCULATION
//=============================================================================

const MAX_SCORES = {
   LEVEL_OF_STUDY: Math.max(...Object.values(VALUE_WEIGHTS.levelOfStudy)),
   FIELD_OF_STUDY: Math.max(...Object.values(VALUE_WEIGHTS.fieldOfStudy)),
   UNIVERSITY_LOCATION: Math.max(
      ...Object.values(VALUE_WEIGHTS.universityCountryCode)
   ),
   LANGUAGE: Math.max(...Object.values(VALUE_WEIGHTS.spokenLanguages)),
   JOB_SEEKING: VALUE_WEIGHTS.isLookingForJob,
   EMAIL_SUBSCRIPTION: VALUE_WEIGHTS.isSubscribed,
   LINKEDIN: VALUE_WEIGHTS.hasLinkedin,
   CURRENT_REGION: Math.max(...Object.values(VALUE_WEIGHTS.currentRegion)),
} as const

//=============================================================================
// SCORING CALCULATION
//=============================================================================

/**
 * Calculate user value score based on how close they are to ideal profile
 * @param userData User data object containing profile information
 * @param currentCountry User's current country code from geolocation
 * @returns number Score between 0-100 representing user value
 */
export const calculateUserValue = (
   userData: UserData,
   currentCountry?: string
): number => {
   let totalScore = 0
   let maxPossibleScore = 0

   //-------------------------------------------------------------------------
   // Academic Scoring
   //-------------------------------------------------------------------------
   // Education Level
   totalScore += userData.levelOfStudy?.id
      ? VALUE_WEIGHTS.levelOfStudy[userData.levelOfStudy.id] ?? 0
      : 0
   maxPossibleScore += MAX_SCORES.LEVEL_OF_STUDY

   // Field of Study
   totalScore += userData.fieldOfStudy?.id
      ? VALUE_WEIGHTS.fieldOfStudy[userData.fieldOfStudy.id] ??
        VALUE_WEIGHTS.fieldOfStudy.default
      : 0
   maxPossibleScore += MAX_SCORES.FIELD_OF_STUDY

   //-------------------------------------------------------------------------
   // Location Scoring
   //-------------------------------------------------------------------------
   // University Location
   totalScore += userData.universityCountryCode
      ? VALUE_WEIGHTS.universityCountryCode[userData.universityCountryCode] ??
        VALUE_WEIGHTS.universityCountryCode.default
      : 0
   maxPossibleScore += MAX_SCORES.UNIVERSITY_LOCATION

   // Current Region
   totalScore += currentCountry
      ? VALUE_WEIGHTS.currentRegion[currentCountry.toUpperCase()] ??
        VALUE_WEIGHTS.currentRegion.default
      : 0
   maxPossibleScore += MAX_SCORES.CURRENT_REGION

   //-------------------------------------------------------------------------
   // Language Scoring
   //-------------------------------------------------------------------------
   if (userData.spokenLanguages?.length > 0) {
      userData.spokenLanguages.forEach((lang) => {
         if (lang) {
            totalScore +=
               VALUE_WEIGHTS.spokenLanguages[lang.toLowerCase()] ??
               VALUE_WEIGHTS.spokenLanguages.default
         }
      })
   }
   maxPossibleScore += MAX_SCORES.LANGUAGE

   //-------------------------------------------------------------------------
   // Profile & Engagement Scoring
   //-------------------------------------------------------------------------
   // Job seeking status
   totalScore += userData.isLookingForJob ? VALUE_WEIGHTS.isLookingForJob : 0
   maxPossibleScore += MAX_SCORES.JOB_SEEKING

   // Email subscription status
   totalScore += !userData.unsubscribed ? VALUE_WEIGHTS.isSubscribed : 0
   maxPossibleScore += MAX_SCORES.EMAIL_SUBSCRIPTION

   // LinkedIn profile
   totalScore += userData.linkedinUrl ? VALUE_WEIGHTS.hasLinkedin : 0
   maxPossibleScore += MAX_SCORES.LINKEDIN

   // Convert to 0-100 scale
   return Math.round((totalScore / maxPossibleScore) * 100)
}
