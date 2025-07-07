import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

const EVENT_PLACEHOLDERS = [
   {
      id: "placeholderEvent1",
      title: "Hold Tight! This event is coming soon",
      summary:
         "Keep an eye on your future, don't miss out! This event is being created right now",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-1.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent2",
      title: "An awesome company is currently creating this event",
      summary:
         "Keep an eye on your future, don't miss out! This event is being created right now",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-2.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent3",
      title: "Stay tuned. Event is being created right now",
      summary:
         "Keep an eye on your future, don't miss out! This event is being created right now",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-3.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent4",
      title: "New live is coming soon",
      summary:
         "Keep an eye on your future, don't miss out! This event is being created right now",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-4.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent5",
      title: "This event will be published soon",
      summary:
         "Keep an eye on your future, don't miss out! This event is being created right now",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-5.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
   {
      id: "placeholderEvent6",
      title: "We are going to launch our event very soon ",
      summary:
         "Keep an eye on your future, don't miss out! This event is being created right now",
      backgroundImageUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/illustration-images%2FBackgroundPlaceholder-6.jpg?alt=media",
      companyLogoUrl:
         "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-logos%2Fcoming-soon.png?alt=media",
   },
] as LivestreamEvent[]

const MIN_LIMITS_EVENT = 4

/**
 * Return the events without adding placeholder cards
 */
export const formatLivestreamsEvents = (
   events: LivestreamEvent[] = [],
   minimum: number = MIN_LIMITS_EVENT
): LivestreamEvent[] => {
   // Simply return the events without adding placeholders
   return events
}

/**
 * creat *numberOfEvents* events based on the *EVENT_PLACEHOLDERS* mocks
 */
export const createPlaceHolderEvents = (
   numberOfEvents: number
): LivestreamEvent[] => {
   return [...Array(numberOfEvents)].map(
      (current, index) => EVENT_PLACEHOLDERS[index % EVENT_PLACEHOLDERS.length]
   )
}
