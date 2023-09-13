/**
 * Type representing the data that the client sends to the callable function.
 * It includes all the fields except `userId`, `timestamp`, and `countryCode`.
 */
export type SparkEventClient = {
   /** Unique identifier for the Spark */
   sparkId: string
   /** Original Spark ID from the feed (first one) */
   originalSparkId: string | null
   /** Visitor ID to help identify unique users in case they are not logged in */
   visitorId: string
   /** Document referrer information */
   referrer: string | null
   /** A sessionId is a unique identifier generated each time a user views a specific spark. When the user scrolls to a new spark, a new sessionId is generated. */
   sessionId: string
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
   /** ISO Alpha-2 Country code of the user's university at the time of the event */
   universityCountry: string | null
   /**
    * ISO 8601 formatted string representing the timestamp of the event.
    * This timestamp is generated on the client side when the event occurs.
    */
   stringTimestamp: string
}

/**
 * Type representing the complete data being inserted into BigQuery.
 * It includes all fields from `SparkEventClient` plus `userId`, `timestamp`, and `countryCode` which are added by the cloud function.
 * The `stringTimestamp` field from `SparkEventClient` is omitted because it's replaced by the `timestamp` field, which is a Date object.
 */
export type SparkEvent = Omit<SparkEventClient, "stringTimestamp"> & {
   /** User AuthUID, null if not logged in */
   userId: string | null
   /** Timestamp of the event */
   timestamp: Date
   /** ISO Alpha-2 Country code of the user at the time of the event */
   countryCode: string | null
}

export type SparkClientEventsPayload = {
   sparkEvents: SparkEventClient[]
}

/**
 * Type representing the data that the client sends to the callable function for SparkSecondsWatched.
 * It includes all the fields except `userId`, `timestamp`, and `countryCode`.
 */
export type SparkSecondWatchedClient = {
   /** Unique identifier for the Spark */
   sparkId: string
   /** User AuthUID, null if not logged in */
   userId: string | null
   /** Visitor ID to help identify unique users in case they are not logged in */
   visitorId: string
   /** Position (in seconds, allowing for fractions up to 2 decimal places) in the spark at the event time */
   videoEventPositionInSeconds: number
   /** A sessionId is a unique identifier generated each time a user views a specific spark. When the user scrolls to a new spark, a new sessionId is generated. */
   sessionId: string
   /** ISO Alpha-2 Country code of the user's university at the time of the event */
   universityCountry: string | null
   /**
    * ISO 8601 formatted string representing the timestamp of the event.
    * This timestamp is generated on the client side when the event occurs.
    */
   stringTimestamp: string
}

/**
 * Type representing the complete data being inserted into BigQuery for SparkSecondsWatched.
 * It includes all fields from `SparkSecondsWatchedClient` plus `userId`, `timestamp`, and `countryCode` which are added by the cloud function.
 * The `stringTimestamp` field from `SparkSecondsWatchedClient` is omitted because it's replaced by the `timestamp` field, which is a Date object.
 */
export type SparkSecondWatched = Omit<
   SparkSecondWatchedClient,
   "stringTimestamp"
> & {
   /** Timestamp of the event */
   timestamp: Date
   /** ISO Alpha-2 Country code of the user at the time of the event */
   countryCode: string | null
}

export type SparkSecondsWatchedClientPayload = {
   sparkSecondsWatched: SparkSecondWatchedClient[]
}

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
   Share: "Share",
   Like: "Like",
   Impression: "Impression",
   Click_CareerPageCTA: "Click_CareerPageCTA",
   Watched_CompleteSpark: "Watched_CompleteSpark",
   Played_Spark: "Played_Spark",
} as const

export type SparkEventActionType =
   (typeof SparkEventActions)[keyof typeof SparkEventActions]
