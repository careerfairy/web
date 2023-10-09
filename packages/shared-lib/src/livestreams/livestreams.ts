import { Identifiable, OptionGroup, UTMParams } from "../commonTypes"
import { Group, GroupQuestion } from "../groups"
import {
   UserData,
   UserLivestreamGroupQuestionAnswers,
   UserPublicData,
   UserStats,
} from "../users"
import firebase from "firebase/compat"
import { FieldOfStudy } from "../fieldOfStudy"
import { Job, JobIdentifier } from "../ats/Job"
import Timestamp = firebase.firestore.Timestamp
import DocumentData = firebase.firestore.DocumentData
import { PublicCustomJob } from "../groups/customJobs"

export const NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST =
   1000 * 60 * 60 * 4

export interface LivestreamEvent extends Identifiable {
   author?: AuthorInfo
   summary?: string
   reasonsToJoinLivestream?: string
   backgroundImageUrl?: string
   company?: string
   companyId?: string
   participants?: string[]
   participatingStudents?: string[]
   maxRegistrants?: number
   companyLogoUrl?: string
   created?: Timestamp
   currentSpeakerId?: string
   handRaiseActive?: boolean
   withResume?: boolean
   duration?: number
   groupIds?: string[]
   interestsIds?: string[]
   levelOfStudyIds?: string[]
   fieldOfStudyIds?: string[]
   isRecording?: boolean
   language?: LivestreamLanguage
   hidden: boolean
   talentPool?: string[]
   hasNoTalentPool?: boolean
   test: boolean
   title?: string
   type?: string
   start: firebase.firestore.Timestamp
   startDate?: Date
   status?: LivestreamStatus
   registeredUsers?: string[]
   groupQuestionsMap?: LivestreamGroupQuestionsMap
   hasStarted?: boolean
   hasEnded?: boolean
   targetCategories?: string[]
   mode?: LivestreamMode

   /**
    * The maximum number of active hand raises there can be at any given time
    * */
   maxHandRaisers?: number

   /**
    * This property is used to determine if we should dispatch the feedback toasts during the event
    */
   hasNoRatings?: boolean

   /**
    * An array of livestream Ids that should be rendered in a carousel at the end of the livestream
    */
   recommendedEventIds?: string[]

   /**
    * Which call to actions have been activated for this event
    */
   activeCallToActionIds?: string[]

   /**
    * If true, the livestream can be attended anonymously
    * */
   openStream?: boolean

   /**
    * Number of times the livestream has appeared in a user's feed
    * */
   impressions?: number

   /**
    * Number of times the livestream has appeared in a user's recommended feed
    * */
   recommendedImpressions?: number

   /**
    * The streamerId of the user who is currently sharing their screen
    */
   screenSharerId?: string

   /**
    * Livestream with manually speaker switch
    * Main Streamer needs to click on each video to switch to it
    */
   speakerSwitchMode?: "manual"

   /**
    * An empty array means the livestream should target all the fields of study
    * [] -> All fields of study
    */
   targetFieldsOfStudy?: FieldOfStudy[]

   /**
    * An empty array means the livestream should target all the levels of study
    * [] -> All levels of study
    */
   targetLevelsOfStudy?: FieldOfStudy[]

   lastUpdated?: firebase.firestore.Timestamp
   /**
    * The speakers that are displayed on the upcoming-livestream landing page of the event
    */
   speakers?: Speaker[]
   /**
    * The actual details of the speakers in the livestream
    */
   liveSpeakers?: LiveSpeaker[]
   lastUpdatedAuthorInfo?: AuthorInfo
   universities?: any[]
   questionsDisabled?: boolean

   /**
    * To deny access to the livestream recording after its end
    */
   denyRecordingAccess?: boolean

   // ATS Jobs
   /**
    * During livestream creating, jobs can be associated with the livestream
    */
   jobs?: LivestreamJobAssociation[]

   // Custom Jobs
   customJobs?: PublicCustomJob[]
   /**
    * Firestore has limitations when querying for jobs != []
    */
   hasJobs?: boolean

   /*
    * True if the event is also taking place in person
    * */
   isHybrid?: boolean

   /*
    * The physical location of the event if there is one
    * */
   address?: string
   externalEventLink?: string
   timezone?: string
   isFaceToFace?: boolean
   reminderEmailsSent?: IEmailSent

   /*
    * Breakout rooms
    * */
   index?: number
   parentLivestream?: LivestreamEventPublicData

   /**
    * Incremented on certain popularityEvents
    * Updated via functions onCreate trigger
    */
   popularity?: number

   /**
    * Metadata for the livestream based on hosts
    */
   companySizes?: string[] // ["1-20", "21-100", "101-1000", "1001+"]
   companyIndustries?: string[] // ["Technology", "Finance", "Education", "Healthcare", "Other"]
   companyCountries?: string[] // ["United States", "United Kingdom", "Canada", "Australia", "Other"]

   /**
    * Flag to distinguish between a draft and a livestream
    * (different collections), internal use
    */
   isDraft?: boolean

   /**
    * A map of all the trigrams from joining the livestream title
    * and the company name. Used for full text search
    */
   triGrams: Record<string, true>
}

/**
 * These modes are used to dictate how the livestream is displayed in the UI
 * - presentation: A PDF presentation is currently being shared
 * - video: A YouTube video is currently being shared
 * - desktop: A user's screen is currently being shared
 * - default/undefined: The default livestream view (speaker is in the center of the screen with their video displayed)
 */
export type LivestreamMode = "presentation" | "desktop" | "video" | "default"

export type LivestreamLanguage = {
   code?: string
   name?: string
}

export type AuthorInfo = {
   email: string
   groupId?: string
}

export interface LivestreamStatus {
   pendingApproval?: boolean
   seen?: boolean
}

export interface LivestreamJobAssociation {
   groupId: string
   integrationId: string
   jobId: string
   name: string
}

export type LivestreamUserAction = keyof Pick<
   UserLivestreamData,
   "talentPool" | "registered" | "participated" | "jobApplications"
>

/*
 * This date string is used for UserLivestreamData documents
 * that were created during the migration of the talentPool/participating/registered
 * users subcollection. Any talentPool/participating/registered document that didn't have time stamps
 * were given this static date
 * */
export const FALLBACK_DATE = "March 17, 2020 03:24:00"

/*
 * Sub-collection found on the livestream doc called userLivestreamData
 * */
export interface UserLivestreamData extends Identifiable {
   userId: string
   livestreamId: LivestreamEvent["id"]
   user: UserData
   answers?: UserLivestreamGroupQuestionAnswers
   registered?: {
      // if the date is March 17, 2020 03:24:00 it as a fallbackDate
      date: firebase.firestore.Timestamp
      referral?: {
         referralCode: string
         inviteLivestream: string
      }
      utm?: UTMParams
      referrer?: string
      isRecommended?: boolean
      sparkId?: string
   }
   talentPool?: {
      // if the date is March 17, 2020 03:24:00 it as a fallbackDate
      date: firebase.firestore.Timestamp
      companyId: string
   }
   participated?: {
      // if the date is March 17, 2020 03:24:00 it as a fallbackDate
      date: firebase.firestore.Timestamp
      // The initial snapshot of the user's data when they participated in the livestream for the first time
      initialSnapshot?: {
         userData: UserData
         userStats: UserStats
         date: firebase.firestore.Timestamp
      }
   }
   jobApplications?: {
      [jobId: string]: LivestreamJobApplicationDetails
   }
   customJobApplications?: {
      [jobId: string]: LivestreamCustomJobApplicationsDetails
   }
}

export interface RecordingToken extends Identifiable {
   recourseId: string
   sid: string
}

// Recording Stats for each user
// The document is consists of the userId and the date rounded to the nearest hour
// The minutesWatched is the sum of all the minutes watched in that hour
// Path: /livestreams/{livestreamId}/recordingStatsUser/{userId}_{hourlyTimestamp}
export interface RecordingStatsUser extends Identifiable {
   /**
    * In case there are collections with the same name
    * differentiate between them
    */
   documentType: "recordingStatsUser"
   livestreamId: string
   livestreamStartDate?: firebase.firestore.Timestamp
   userId: string
   recordingBought?: boolean
   minutesWatched: number
   date: firebase.firestore.Timestamp
}

export interface LivestreamJobApplicationDetails extends JobIdentifier {
   date: firebase.firestore.Timestamp
   applicationId?: string
   job: Partial<Job>
}

export interface LivestreamCustomJobApplicationsDetails extends JobIdentifier {
   date: firebase.firestore.Timestamp
   job: PublicCustomJob
}

// Collection Path: livestreams/{livestreamId}/recordingStats/stats
export interface LivestreamRecordingDetails extends Identifiable {
   livestreamId: string
   livestreamStartDate: firebase.firestore.Timestamp
   minutesWatched?: number

   // all the recording viewers
   viewers: string[]

   // recording viewers that bought access
   // for analytics purposes
   viewersThroughCredits?: string[]
   views: number
}

export type LivestreamGroupQuestionsMap = Record<
   Group["id"],
   LivestreamGroupQuestions
>

export interface LivestreamGroupQuestion extends GroupQuestion {
   /*
    * The property selectedOptionId and isNew is never saved on the livestream document.
    * It is only used to track the user selected option client-side.
    * */
   selectedOptionId?: string
   isNew?: boolean
}

export interface LivestreamGroupQuestions {
   groupName: string
   groupId: string
   universityCode?: string
   questions: Record<LivestreamGroupQuestion["id"], LivestreamGroupQuestion>
}

export interface IEmailSent {
   reminder5Minutes: boolean
   reminder1Hour: boolean
   reminder24Hours: boolean
}

export interface LiveStreamEventWithUsersLivestreamData
   extends LivestreamEvent {
   usersLivestreamData: UserLivestreamData[]
}

export interface Speaker extends Identifiable {
   avatar?: string
   background?: string
   firstName?: string
   lastName?: string
   position?: string
   rank?: number
   email?: string
}

export interface LiveSpeaker extends Identifiable {
   firstName: string
   lastName: string
   position: string
   /*
    * - Weather or not the speaker is required to provide their LinkedIn profile in the stream prep overlay (default: true)
    * */
   showLinkedIn?: boolean
   linkedIn?: string
   /*
    * - The ID Agora and the client uses to identify the speaker
    * */
   speakerUuid?: string
}

export interface EventRating extends Identifiable {
   question: string
   appearAfter: number
   hasText?: boolean
   title?: string
   isForEnd?: boolean
   noStars?: boolean // no stars means no rating system
   isSentimentRating?: boolean
}

export interface EventRatingAnswer extends Identifiable {
   message?: string
   rating?: number
   timestamp?: firebase.firestore.Timestamp
}

export type LivestreamEventPublicData = Partial<
   Pick<
      LivestreamEvent,
      | "summary"
      | "company"
      | "title"
      | "start"
      | "companyLogoUrl"
      | "test"
      | "groupIds"
      | "interestsIds"
      | "targetFieldsOfStudy"
      | "targetLevelsOfStudy"
      | "created"
      | "impressions"
      | "hasJobs"
      | "backgroundImageUrl"
      | "duration"
   >
> & {
   id: LivestreamEvent["id"]
}

export interface LivestreamQuestion extends Identifiable {
   author: string
   timestamp: firebase.firestore.Timestamp
   title: string
   type: "new" | "current"
   votes: number
   emailOfVoters?: string[]
   /**
    * We store the most recent comment to the question on the question document
    * */
   firstComment?: LivestreamQuestion
   /*
    * The number of comments on the question
    * */
   numberOfComments?: number

   /*
    * The number of badges the question has
    * */
   badges: string[]

   displayName?: string
}

export interface LivestreamPoll extends Identifiable {
   voters: string[]
   timestamp: firebase.firestore.Timestamp
   state: "current" | "closed" | "upcoming"
   question: string
   options: {
      id: string
      text: string
   }[]
}

export interface LivestreamChatEntry extends Identifiable {
   authorEmail: string
   authorName: string
   message: string
   timestamp: firebase.firestore.Timestamp

   type?: // used to identify a chat entry that was sent by a host to all breakout rooms (only used in the UI)
   | "broadcast"
      // used to identify a chat entry that was sent by a host (only used in the UI)
      | "streamer"

   /*
    * Array of userIds who reacted with 😮
    * */
   wow: string[]
   /*
    * Array of userIds who reacted with  ❤
    */
   heart: string[]
   /*
    * Array of userIds who reacted with  👍
    */
   thumbsUp: string[]
   /*
    * Array of userIds who reacted with 😂
    */
   laughing: string[]
}

export interface LivestreamIcon extends Identifiable {
   authorEmail: string
   timestamp: firebase.firestore.Timestamp
   name: "heart" | "clapping" | "like"
}

/**
 * Public information about a livestream event
 *
 * Useful to save on relationship documents
 * @param livestreamData
 */
export const pickPublicDataFromLivestream = (
   livestreamData: LivestreamEvent
): LivestreamEventPublicData => {
   return {
      id: livestreamData.id,
      // we prefer null instead of undefined (firestore doesn't allow storing undefined values)
      summary: livestreamData.summary ?? null,
      company: livestreamData.company ?? null,
      title: livestreamData.title ?? null,
      start: livestreamData.start ?? null,
      companyLogoUrl: livestreamData.companyLogoUrl ?? null,
      test: livestreamData.test ?? false,
      groupIds: livestreamData.groupIds ?? [],
      interestsIds: livestreamData.interestsIds ?? [],
      targetFieldsOfStudy: livestreamData.targetFieldsOfStudy ?? [],
      targetLevelsOfStudy: livestreamData.targetLevelsOfStudy ?? [],
      impressions: livestreamData.impressions ?? 0,
      created: livestreamData.created ?? null,
      hasJobs: livestreamData.hasJobs ?? false,
      duration: livestreamData.duration ?? null,
      backgroundImageUrl: livestreamData.backgroundImageUrl ?? null,
   }
}

export interface LivestreamEventSerialized
   extends Omit<
      LivestreamEvent,
      | "registeredUsers"
      | "talentPool"
      | "participatingStudents"
      | "participants"
      | "created"
      | "start"
      | "startDate"
      | "lastUpdated"
      | "lastUpdatedAuthorInfo"
   > {
   createdDateString: string
   startDateString: string
   lastUpdatedDateString: string
}

export interface LivestreamEventParsed extends LivestreamEventSerialized {
   startDate: Date
   createdDate: Date
   lastUpdatedDate: Date
}

export interface LivestreamPromotions extends Identifiable {
   promotionChannelsCodes: string[]
   promotionCountriesCodes: OptionGroup[]
   promotionUniversitiesCodes: OptionGroup[]
   livestreamId: string
}

export interface LivestreamImpression extends Identifiable, DocumentData {
   livestreamId: string
   userId: string
   livestream: LivestreamEventPublicData
   user: UserPublicData | null
   pathname: string
   createdAt: firebase.firestore.Timestamp
   positionInResults: number
   numberOfResults: number
   isRecommended: boolean
   location: Location
   asPath: string
}

// Collection Path: livestreams/{livestreamId}/participatingStats/{userId}
export interface UserParticipatingStats extends DocumentData, Identifiable {
   /**
    *  The ID of the livestream document
    * */
   livestreamId: string
   /**
    * The total amount of minutes the user has participated in the livestream
    * */
   totalMinutes: number
   /**
    * An array of minutes the user has participated in the livestream (e.g. [5, 6, 7] means the user was present at minute 5, 6 and 7)
    */
   minutes: string[]
   /**
    * Snapshot of the livestream document at the time the user last participated
    */
   livestream: LivestreamEventPublicData
   /**
    * Snapshot of the user document at the time the user last participated
    */
   user: UserPublicData
}

export enum ImpressionLocation {
   recommendedEventsCarousel = "recommendedEventsCarousel",
   comingUpCarousel = "comingUpCarousel",
   myNextEventsCarousel = "myNextEventsCarousel",
   pastEventsCarousel = "pastEventsCarousel",
   nextLivestreams = "nextLivestreams",
   pastLivestreams = "pastLivestreams",
   nextLivestreamsGroup = "nextLivestreamsGroup",
   pastLivestreamsGroup = "pastLivestreamsGroup",
   marketingPageCarousel = "marketingPageCarousel",
   embeddedNextLivestreams = "embeddedNextLivestreams",
   embeddedPastLivestreams = "embeddedPastLivestreams",
   landingPageCarousel = "landingPageCarousel",
   viewerStreamingPageLivestreamsCarousel = "viewerStreamingPageLivestreamsCarousel",
   unknown = "unknown",
}

export function getEarliestEventBufferTime() {
   return new Date(
      Date.now() - NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST
   )
}
/**
 * The option we are able to query with Firestore
 */
export type LivestreamQueryOptions = {
   languageCodes?: string[]
   withRecordings?: boolean
   withTest?: boolean
   withHidden?: boolean
   targetGroupId?: string
   type: "pastEvents" | "upcomingEvents"
}

/**
 * The options we are not able to query with Firestore
 */
export type FilterLivestreamsOptions = {
   companyIndustries?: string[]
   companyCountries?: string[]
   targetFieldsOfStudy?: FieldOfStudy[]
}
