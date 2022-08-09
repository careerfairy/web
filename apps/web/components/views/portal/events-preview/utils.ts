import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

const EVENT_PLACEHOLDERS = [
   {
      id: "placeholderEvent",
      title: "New live is coming soon",
      summary: "",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2F3fdbec13-362e-4c8a-a9c5-62226fe7c4b5_TU_Eindhoven.png?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fbombardier-logo.png?alt=media",
   },
   {
      id: "placeholderEvent",
      title: "Something awesome is coming",
      summary: "",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2Fbombardier-bck.JPG?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fbombardier-logo.png?alt=media",
   },
   {
      id: "placeholderEvent",
      title: "Stay tuned. We are launching soon.",
      summary: "",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fbombardier-logo.png?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fbombardier-logo.png?alt=media",
   },
   {
      id: "placeholderEvent",
      title: "We are almost ready to launch",
      summary: "",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2F3fdbec13-362e-4c8a-a9c5-62226fe7c4b5_TU_Eindhoven.png?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fbombardier-logo.png?alt=media",
   },
] as LivestreamEvent[]

const MIN_LIMITS_EVENT = 3

/**
 * Validate if we have enough events, more than the *MIN_LIMITS_EVENT*
 * if yes, render that events
 * if not, create *numberOfMissingEvents* placeholder events to fulfill the *MIN_LIMITS_EVENT*
 */
export const formatLivestreamsEvents = (
   events: LivestreamEvent[] = []
): LivestreamEvent[] => {
   const numberOfMissingEvents = MIN_LIMITS_EVENT - events.length

   if (numberOfMissingEvents < 0) {
      return events
   }
   return [...events, ...createPlaceHolderEvents(numberOfMissingEvents)]
}

/**
 * creat *numberOfEvents* events based on the *EVENT_PLACEHOLDERS* mocks
 */
export const createPlaceHolderEvents = (
   numberOfEvents: number
): LivestreamEvent[] => {
   return [...Array(numberOfEvents + 1)].map(
      (current, index) => EVENT_PLACEHOLDERS[index]
   )
}
