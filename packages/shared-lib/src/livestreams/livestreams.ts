import { Identifiable, OptionGroup } from "../commonTypes"
import { Group, GroupQuestion } from "../groups"
import {
   UserData,
   UserLivestreamGroupQuestionAnswers,
   UserPublicData,
} from "../users"
import firebase from "firebase/compat"
import { FieldOfStudy } from "../fieldOfStudy"
import { Job, JobIdentifier } from "../ats/Job"
import Timestamp = firebase.firestore.Timestamp
import DocumentData = firebase.firestore.DocumentData

export const NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST =
   1000 * 60 * 60 * 12

export interface LivestreamEvent extends Identifiable {
   author?: AuthorInfo
   summary?: string
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
   hidden?: boolean
   talentPool?: string[]
   hasNoTalentPool?: boolean
   test?: boolean
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

   // ATS Jobs
   /**
    * During livestream creating, jobs can be associated with the livestream
    */
   jobs?: LivestreamJobAssociation[]

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
      utm?: any
      referrer?: string
      isRecommended?: boolean
   }
   talentPool?: {
      // if the date is March 17, 2020 03:24:00 it as a fallbackDate
      date: firebase.firestore.Timestamp
      companyId: string
   }
   participated?: {
      // if the date is March 17, 2020 03:24:00 it as a fallbackDate
      date: firebase.firestore.Timestamp
   }
   jobApplications?: {
      [jobId: string]: LivestreamJobApplicationDetails
   }
}

export interface LivestreamJobApplicationDetails extends JobIdentifier {
   date: firebase.firestore.Timestamp
   job: Partial<Job>
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
   usersLivestreamData: IUserLivestreamData[]
}

export interface IUserLivestreamData {
   livestreamId?: string
   userId?: string
   user?: UserData
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

export interface LivestreamEventPublicData {
   summary?: string
   company?: string
   title?: string
   id: string
   start?: firebase.firestore.Timestamp
   companyLogoUrl?: string
   test?: boolean
}

export interface LivestreamQuestion extends Identifiable {
   author: string
   timestamp: firebase.firestore.Timestamp
   title: string
   type: "new" | "current"
   votes: number
}

export interface LivestreamPoll extends Identifiable {
   voters: string[]
   timestamp: firebase.firestore.Timestamp
   state: "current" | "closed"
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
