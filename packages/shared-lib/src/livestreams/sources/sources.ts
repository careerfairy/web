import { UTMParams } from "../../commonTypes"

export type RegistrationSource = {
   displayName: string
   id: RegistrationSourceId
   helpDescription: string
   color: string
   match: (utms: UTMParams) => boolean
}

export const RegistrationSourceIds = {
   PlatformNormal: "platform-normal",
   PlatformPromo: "platform-promo",
   Social: "social",
   Sparks: "sparks",
   University: "university",
   Other: "other",
} as const

export type RegistrationSourceId =
   (typeof RegistrationSourceIds)[keyof typeof RegistrationSourceIds]

/**
 * Types of Sources that will appear in the dashboard UI (chart and tables)
 *
 * These are checked against all utm params (source, medium, campaign, etc)
 *  if one matches, that registration belongs to the matched source
 *
 *  Order matters!
 */
export const VALID_SOURCES: RegistrationSource[] = [
   {
      displayName: "Platform Registrations",
      id: RegistrationSourceIds.PlatformNormal,
      helpDescription:
         "User registered through our platform not tied to any campaign.",
      color: "#2B28BC",
      // no utms present on the registration
      match: (utms) => !utms,
   },
   {
      displayName: "Platform User Promo",
      id: RegistrationSourceIds.PlatformPromo,
      helpDescription:
         "User registered through a campaign inside our Platform.",
      color: "#1ED0D0",
      match: (utms) => {
         const matchSource = /^careerfairy$/i.test(utms?.utm_source)
         const matchMedium = /^email$/i.test(utms?.utm_medium)

         return matchSource && matchMedium
      },
   },
   {
      displayName: "Social",
      id: RegistrationSourceIds.Social,
      helpDescription:
         "User registered through a social media ad (Facebook, Instagram, etc).",
      color: "#00FF47",
      match: matchAnyUtmParam(
         /instagram|facebook|meta|twitter|linkedin|tiktok/i
      ),
   },
   {
      displayName: "Sparks",
      id: RegistrationSourceIds.Sparks,
      helpDescription: "User registered through Sparks.",
      color: "#FFC200",
      match: (utms) => false,
   },
   {
      displayName: "University Network Promo",
      id: RegistrationSourceIds.University,
      helpDescription: "User registered through a university campaign.",
      color: "#FF4D4D",
      match: (utms) => {
         const validSources = [
            // e.g unicc-ch-newsletter, unicc_ch_newsletter
            /[a-z]{2}[-_]newsletter$/i,
            // e.g unicc_de, student_assoc_ch, unicc-ch
            /student_assoc[_-][a-z]{2}|unicc[_-][a-z]{2}/i,
         ]
         const matchSource = validSources.some((r) => r.test(utms?.utm_source))
         const matchMedium = /email/i.test(utms?.utm_medium)

         return matchSource && matchMedium
      },
   },

   {
      displayName: "Other",
      id: RegistrationSourceIds.Other,
      helpDescription: "User registered through an unknown campaign.",
      color: "#7D7AFF",
      // utms present but no source match
      match: (utms) => Boolean(utms),
   },
]

/**
 * Test a regex against every utm param
 *
 * Returns true if the regex matches a param
 */
function matchAnyUtmParam(regex: RegExp) {
   return (utms: UTMParams) => {
      return matchAnyMapValue(utms, regex)
   }
}

/**
 * Test a regex expression against all object values
 *
 * Returns true if any entry matches
 */
const matchAnyMapValue = (map: object, regex: RegExp) => {
   for (let key in map) {
      if (regex.test(map[key])) {
         return true
      }
   }

   return false
}
