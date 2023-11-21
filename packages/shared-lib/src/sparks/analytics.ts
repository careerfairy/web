/**
 * Common client properties for SparkEventClient and SparkSecondWatchedClient
 */
type CommonClientFields = {
   /** Unique identifier for the Spark */
   sparkId: string
   /** Category ID of the Spark */
   categoryId: string | null
   /** Visitor ID to help identify unique users in case they are not logged in */
   visitorId: string
   /** A sessionId is a unique identifier generated each time a user views a specific spark. When the user scrolls to a new spark, a new sessionId is generated. */
   sessionId: string
   /** ISO Alpha-2 Country code of the user's university at the time of the event */
   universityCountry: string | null
   /**
    * ISO 8601 formatted string representing the timestamp of the event.
    * This timestamp is generated on the client side when the event occurs.
    */
   stringTimestamp: string
   /**
    * The Name of the university the user is currently attending.
    */
   universityName: string | null
   /**
    * The ID of the university the user is currently attending.
    */
   universityId: string | null
   /**
    * The ID of the field of study the user is currently studying.
    */
   fieldOfStudy: string | null
   /**
    * The ID of the level of study the user is currently studying.
    */
   levelOfStudy: string | null
}

/**
 * Common server properties for SparkEvent and SparkSecondWatched
 * These properties are added by the cloud function.
 * They are not sent by the client.
 */
type CommonServerFields = {
   /** User AuthUID, null if not logged in */
   userId: string | null
   /** Timestamp of the event */
   timestamp: Date
   /** ISO Alpha-2 Country code of the user at the time of the event */
   countryCode: string | null
}

/**
 * Type representing the data that the client sends to the callable function.
 * It includes all the fields except `userId`, `timestamp`, and `countryCode`.
 */
export type SparkEventClient = {
   /** Original Spark ID from the feed (first one) */
   originalSparkId: string | null
   /** Document referrer information */
   referrer: string | null
   /** Referral code of a user from the URL */
   referralCode: string | null
   /** UTM Source */
   utm_source: string | null
   /** UTM Medium */
   utm_medium: string | null
   /** UTM Campaign */
   utm_campaign: string | null
   /** UTM Term */
   utm_term: string | null
   /** UTM Content */
   utm_content: string | null
   /** Type of action (Share, Like, Impression, Click on career page CTA, Spark completely watched, Played spark) */
   actionType: SparkEventActionType
   /** Group Id for spark ownership */
   groupId: string | null
} & CommonClientFields

/**
 * Type representing the data that the client sends to the callable function for SparkSecondsWatched.
 * It includes all the fields except `userId`, `timestamp`, and `countryCode`.
 */
export type SparkSecondWatchedClient = {
   /** Position (in seconds, allowing for fractions up to 2 decimal places) in the spark at the event time */
   videoEventPositionInSeconds: number
} & CommonClientFields

/**
 * Type representing the complete data being inserted into BigQuery for SparkEvents.
 */
export type SparkEvent = Omit<SparkEventClient, "stringTimestamp"> &
   CommonServerFields

/**
 * Type representing the complete data being inserted into BigQuery for SparkSecondsWatched.
 */
export type SparkSecondWatched = Omit<
   SparkSecondWatchedClient,
   "stringTimestamp"
> &
   CommonServerFields

/**
 * The payload that the client sends to the callable function.
 */
export type EventsPayload<TEvent> = {
   events: TEvent[]
}

export type SparkClientEventsPayload = EventsPayload<SparkEventClient>

export type SparkSecondsWatchedClientPayload =
   EventsPayload<SparkSecondWatchedClient>

export const SparkEventActions = {
   Share_WhatsApp: "Share_WhatsApp",
   Share_LinkedIn: "Share_LinkedIn",
   Share_Facebook: "Share_Facebook",
   Share_X: "Share_X",
   Share_Clipboard: "Share_Clipboard",
   Share_Mobile: "Share_Mobile",
   Share_Email: "Share_Email",
   /**
    * Fallback for when the share action type is not one of the above.
    */
   Share_Other: "Share_Other",
   Like: "Like",
   Unlike: "Unlike",
   Impression: "Impression",
   Click_CareerPageCTA: "Click_CareerPageCTA",
   Click_CompanyPageCTA: "Click_CompanyPageCTA",
   Watched_CompleteSpark: "Watched_CompleteSpark",
   Played_Spark: "Played_Spark",
} as const

export type SparkEventActionType =
   (typeof SparkEventActions)[keyof typeof SparkEventActions]
