import { UTMParams } from "@careerfairy/shared-lib/dist/commonTypes"

export type RegistrationSource = {
   displayName: string
   helpDescription: string
   color: string
   match: (utms: UTMParams) => boolean
}

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
      displayName: "University Network Promo (Paid)",
      helpDescription: "User registered through a paid university campaign.",
      color: "#C13584",
      match: (utms) => {
         // e.g unicc-ch-newsletter, unicc_ch_newsletter
         const matchSource = /[a-z]{2}[-_]newsletter$/gi.test(utms?.utm_source)
         const matchMedium = /email/gi.test(utms?.utm_medium)

         return matchSource && matchMedium
      },
   },
   {
      displayName: "University Network Promo",
      helpDescription: "User registered through a university campaign.",
      color: "#7431e2",
      match: (utms) => {
         // e.g unicc_de, student_assoc_ch, unicc-ch
         const matchSource =
            /student_assoc[_-][a-z]{2}|unicc[_-][a-z]{2}/gi.test(
               utms?.utm_source
            )
         const matchMedium = /email/gi.test(utms?.utm_medium)

         return matchSource && matchMedium
      },
   },
   {
      displayName: "Platform User Promo",
      helpDescription:
         "User registered through a campaign inside our Platform.",
      color: "#FFC34F",
      match: (utms) => {
         const matchSource = /^email$/gi.test(utms?.utm_source)
         const matchMedium = /^careerfairy$/gi.test(utms?.utm_medium)

         return matchSource && matchMedium
      },
   },
   {
      displayName: "Social",
      helpDescription:
         "User registered through a social media ad (Facebook, Instagram, etc).",
      color: "#4267B2",
      match: matchAnyUtmParam(
         /instagram|facebook|meta|twitter|linkedin|tiktok/gi
      ),
   },
   {
      displayName: "Other",
      helpDescription: "User registered through an unknown campaign.",
      color: "#98b134",
      // utms present but no source match
      match: (utms) => Boolean(utms),
   },
   {
      displayName: "Platform Registrations",
      helpDescription:
         "User registered through our platform not tied to any campaign.",
      color: "#00d2aa",
      // no utms present on the registration
      match: (utms) => !utms,
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
