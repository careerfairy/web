import { UserData } from "@careerfairy/shared-lib/users"

// Ideal user profile weights
const VALUE_WEIGHTS = {
   // Education
   levelOfStudy: {
      Bachelor: 20,
      Master: 25,
      PhD: 15,
   },
   fieldOfStudy: {
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

      biology: 40,
      medicine: 40,
      psychology: 40,
      transportation: 40,

      agriculture: 30,
      education: 30,
      environmental: 30,
      journalism: 30,
      law: 30,
      space_science: 30,

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

      astronomy: 0,
      divinity: 0,

      other: 10,
      default: 10, // For any unlisted fields
   },
   // Location/Country scoring
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
   // Language scoring (prioritize German & English)
   spokenLanguages: {
      de: 25, // German
      en: 25, // English
      default: 5, // Other languages
   },
   // Job seeking status
   isLookingForJob: 30,

   // Email engagement
   isSubscribed: 20,

   // Additional profile completeness points
   hasLinkedin: 20,

   // Current location scoring
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
}

// Calculate maximum possible scores
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

/**
 * Calculate user value score based on how close they are to ideal profile
 * @param userData User data object
 * @param currentCountry User's current country code from geolocation
 * @returns number Score between 0-100
 */
export const calculateUserValue = (
   userData: UserData,
   currentCountry?: string // can be gotten by using useUserCountryCode hook
): number => {
   let totalScore = 0
   let maxPossibleScore = 0

   // Education Level
   if (userData.levelOfStudy) {
      totalScore += VALUE_WEIGHTS.levelOfStudy[userData.levelOfStudy.id] || 0
      maxPossibleScore += MAX_SCORES.LEVEL_OF_STUDY
   }

   // Field of Study
   if (userData.fieldOfStudy) {
      totalScore += VALUE_WEIGHTS.fieldOfStudy[userData.fieldOfStudy.id] || 0
      maxPossibleScore += MAX_SCORES.FIELD_OF_STUDY
   }

   // Location
   if (userData.universityCountryCode) {
      totalScore +=
         VALUE_WEIGHTS.universityCountryCode[userData.universityCountryCode] ||
         VALUE_WEIGHTS.universityCountryCode.default
      maxPossibleScore += MAX_SCORES.UNIVERSITY_LOCATION
   }

   // Languages
   if (userData.spokenLanguages?.length > 0) {
      userData.spokenLanguages.forEach((lang) => {
         totalScore +=
            VALUE_WEIGHTS.spokenLanguages[lang.toLowerCase()] ||
            VALUE_WEIGHTS.spokenLanguages.default
      })
      maxPossibleScore += MAX_SCORES.LANGUAGE // Only add max language score once
   }

   // Job seeking status
   if (userData.isLookingForJob) {
      totalScore += VALUE_WEIGHTS.isLookingForJob
      maxPossibleScore += MAX_SCORES.JOB_SEEKING
   }

   // Email subscription status (note: unsubscribed is stored as true in userData.unsubscribed)
   if (!userData.unsubscribed) {
      totalScore += VALUE_WEIGHTS.isSubscribed
      maxPossibleScore += MAX_SCORES.EMAIL_SUBSCRIPTION
   }

   // Profile completeness
   if (userData.linkedinUrl) {
      totalScore += VALUE_WEIGHTS.hasLinkedin
      maxPossibleScore += MAX_SCORES.LINKEDIN
   }

   // Current Region Score
   if (currentCountry) {
      totalScore +=
         VALUE_WEIGHTS.currentRegion[currentCountry.toUpperCase()] ||
         VALUE_WEIGHTS.currentRegion.default
      maxPossibleScore += MAX_SCORES.CURRENT_REGION
   }

   // Convert to 0-100 scale
   return Math.round((totalScore / maxPossibleScore) * 100)
}
