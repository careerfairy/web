import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"

const EVENT_PLACEHOLDERS = [
   {
      id: "placeholderEvent1",
      title: "This event will be published soon",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-1.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent2",
      title: "An awesome company is currently creating this event",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-2.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent3",
      title: "Stay tuned. Event is being created right now",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-3.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent4",
      title: "New live is coming soon",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-4.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
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
