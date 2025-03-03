import { BaseModel, fromSerializedDate } from "../BaseModel"
import { FieldOfStudy, LevelOfStudy } from "../fieldOfStudy"
import {
   fromDateConverter,
   fromDateFirestoreFn,
   toDate,
} from "../firebaseTypes"
import { AdminGroupsClaim } from "../users"
import {
   AuthorInfo,
   IEmailSent,
   LiveSpeaker,
   LivestreamCountryTarget,
   LivestreamEvent,
   LivestreamEventPublicData,
   LivestreamGroupQuestionsMap,
   LivestreamJobAssociation,
   LivestreamLanguage,
   LivestreamMode,
   LivestreamStatus,
   NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST,
   Speaker,
} from "./livestreams"

export const MAX_DAYS_TO_SHOW_RECORDING = 5

/**
 * Livestream class
 *
 * Our own type that can be created from Firebase
 * UI/Business logic should live here
 */
export class LivestreamPresenter extends BaseModel {
   constructor(
      public readonly id: string,
      public readonly title: string,
      public readonly summary: string,
      public readonly reasonsToJoinLivestream: string,
      public readonly reasonsToJoinLivestream_v2: string[],
      public readonly backgroundImageUrl: string,
      public readonly company: string,
      public readonly companyId: string,
      public readonly companyLogoUrl: string,
      public readonly created: Date,
      public readonly start: Date,
      public readonly startedAt: Date,
      public readonly endedAt: Date,
      public readonly currentSpeakerId: string,
      public readonly handRaiseActive: boolean,
      public readonly withResume: boolean,
      public readonly impressions: number,
      public readonly recommendedImpressions: number,
      public readonly groupIds: string[],
      public readonly interestsIds: string[],
      public readonly businessFunctionsTagIds: string[],
      public readonly contentTopicsTagIds: string[],
      public readonly isRecording: boolean,
      public readonly hasNoTalentPool: boolean,
      public readonly test: boolean,
      public readonly openStream: boolean,
      public readonly hasStarted: boolean,
      public readonly hasEnded: boolean,
      public readonly hidden: boolean,
      public readonly targetCategories: string[],
      public readonly mode: LivestreamMode,
      public readonly screenSharerId: string,
      public readonly lastUpdated: Date,
      public readonly questionsDisabled: boolean,
      public readonly externalEventLink: string,
      public readonly timezone: string,
      public readonly isFaceToFace: boolean,
      public readonly isHybrid: boolean,
      public readonly address: string,
      public readonly denyRecordingAccess: boolean,
      public readonly hasJobs: boolean,
      public readonly useOldUI: boolean,

      // ATS Jobs
      /**
       * During livestream creating, jobs can be associated with the livestream
       */
      public readonly jobs: LivestreamJobAssociation[],

      /**
       * An empty array means the livestream should target all the fields of study
       * [] -> All fields of study
       */
      public readonly targetCountries: LivestreamCountryTarget[],

      /**
       * An empty array means the livestream should target all the fields of study
       * [] -> All fields of study
       */
      public readonly targetUniversities: string[],

      /**
       * An empty array means the livestream should target all the fields of study
       * [] -> All fields of study
       */
      public readonly targetFieldsOfStudy: FieldOfStudy[],

      /**
       * An empty array means the livestream should target all the levels of study
       * [] -> All levels of study
       */
      public readonly targetLevelsOfStudy: LevelOfStudy[],

      public readonly speakers: Speaker[],
      public readonly creatorsIds: LivestreamEvent["creatorsIds"],
      public readonly liveSpeakers: LiveSpeaker[],
      public readonly triGrams: LivestreamEvent["triGrams"],

      public readonly reminderEmailsSent?: IEmailSent,
      public readonly language?: LivestreamLanguage,
      public readonly type?: string,
      public readonly status?: LivestreamStatus,
      public readonly groupQuestionsMap?: LivestreamGroupQuestionsMap,
      public readonly maxRegistrants?: number,
      public readonly duration?: number,
      public readonly lastUpdatedAuthorInfo?: AuthorInfo,
      public readonly author?: AuthorInfo,

      // For breakout rooms
      public index?: number,
      // For breakout rooms
      public parentLivestream?: LivestreamEventPublicData
   ) {
      super()
   }

   /**
    * Lets us know if the livestream comes from the recommendation engine
    * */
   public isRecommended = false

   public setIsRecommended(isRecommended: boolean) {
      this.isRecommended = isRecommended
   }

   isLive(): boolean {
      return this.hasStarted && !this.hasEnded && !this.isPast()
   }

   /**
    * Checks if the user should enter the waiting room (for new UI only).
    * User enters 5 minutes before the live stream starts.
    *
    * @returns {boolean} True if the user should enter the waiting room, false otherwise.
    */
   waitingRoomIsOpen(): boolean {
      if (this.useOldUI || this.hasEnded || this.isPast()) {
         return false
      }

      const FIVE_MINUTES_IN_MS = 5 * 60 * 1000
      const currentTime = Date.now()
      const startTime = this.start.getTime()

      return startTime - currentTime <= FIVE_MINUTES_IN_MS
   }

   isTest(): boolean {
      return this.test
   }

   isAbleToAccessRecording(): boolean {
      return !this.denyRecordingAccess
   }

   getMainStreamId(): string {
      return this.parentLivestream?.id || this.id
   }

   isStreamAdmin(userGroupAdminClaims: AdminGroupsClaim): boolean {
      return this.groupIds.some((groupId) => userGroupAdminClaims?.[groupId])
   }

   streamHasFinished(): boolean {
      return this.hasEnded && this.hasStarted === false
   }

   isPast(): boolean {
      return (
         this.hasEnded ||
         this.start <
            new Date(
               Date.now() - NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST
            )
      )
   }
   isRegistrationDisabled(
      isUserRegistered: boolean,
      numRegistered: number
   ): boolean {
      if (this.isPast()) return true
      //User should always be able to cancel registration
      if (isUserRegistered) return false
      //Disable registration if max number of registrants is reached
      if (this.maxRegistrants && this.maxRegistrants > 0) {
         return this.maxRegistrants <= numRegistered
      }
      return false
   }

   hasNoSpotsLeft(numRegistered: number): boolean {
      return Boolean(
         this.maxRegistrants &&
            this.maxRegistrants > 0 &&
            this.maxRegistrants <= numRegistered
      )
   }

   recordingAccessTimeLeft(): Date {
      const streamDate = new Date(this.start)

      const maxDateToShowRecording = streamDate
      maxDateToShowRecording.setDate(
         streamDate.getDate() + MAX_DAYS_TO_SHOW_RECORDING
      )

      return maxDateToShowRecording
   }

   isAbleToShowRecording(): boolean {
      return (
         this.isPast() && this.isAbleToAccessRecording()
         // new Date() <= this.recordingAccessTimeLeft()
      )
   }

   /**
    * Only allow users to apply to jobs outside the stream if the stream has started,
    * and it has been at least 20 minutes since the stream started
    * */
   canApplyToJobsOutsideOfStream(): boolean {
      const delay = 20 * 60 * 1000 // 20min
      const start = new Date(this.start)

      return Boolean(Date.now() - start.getTime() >= delay)
   }

   /**
    * Elapsed minutes since the livestream started
    *
    * If the model is a BreakoutRoom document, the elapsed minutes
    * are related to the parent livestream document
    */
   elapsedMinutesSinceStart(): number {
      let start = new Date(this.start)
      if (this.parentLivestream) {
         // breakout room support
         start = toDate(this["parentLivestream"].start)
      }
      return Math.floor((Date.now() - start?.getTime()) / 1000 / 60)
   }

   /**
    * Calculates the number of spots remaining for registration.
    *
    * @returns {number} The number of spots remaining.
    */
   getNumberOfSpotsRemaining(numRegistered: number): number {
      if (!this.maxRegistrants) return 0
      else if (!numRegistered) return this.maxRegistrants
      else {
         return this.maxRegistrants - numRegistered
      }
   }

   getAssociatedJob(jobId: string): LivestreamJobAssociation | null {
      return this.jobs.find((job) => job.jobId === jobId) ?? null
   }

   getViewerEventRoomLink(): string {
      if (this.useOldUI) {
         return `/streaming/${this.id}/viewer`
      }
      return `/streaming/viewer/${this.id}`
   }

   static createFromDocument(livestream: LivestreamEvent) {
      return new LivestreamPresenter(
         livestream.id,
         livestream.title,
         livestream.summary ?? "",
         livestream.reasonsToJoinLivestream ?? "",
         livestream.reasonsToJoinLivestream_v2 ?? [],
         livestream.backgroundImageUrl ?? "",
         livestream.company ?? "",
         livestream.companyId ?? "",

         livestream.companyLogoUrl || "",
         toDate(livestream.created),
         toDate(livestream.start) || new Date(livestream.startDate),
         toDate(livestream.startedAt),
         toDate(livestream.endedAt),
         livestream.currentSpeakerId || "",
         livestream.handRaiseActive ?? false,
         livestream.withResume ?? false,
         livestream.impressions ?? 0,
         livestream.recommendedImpressions ?? 0,
         livestream.groupIds ?? [],
         livestream.interestsIds ?? [],
         livestream.businessFunctionsTagIds ?? [],
         livestream.contentTopicsTagIds ?? [],
         livestream.isRecording ?? false,
         livestream.hasNoTalentPool ?? false,
         livestream.test ?? false,
         livestream.openStream ?? false,
         livestream.hasStarted ?? false,
         livestream.hasEnded ?? false,
         livestream.hidden ?? false,
         livestream.targetCategories ?? [],
         livestream.mode ?? "default",
         livestream.screenSharerId ?? "",
         toDate(livestream.lastUpdated),
         livestream.questionsDisabled ?? false,
         livestream.externalEventLink ?? "",
         livestream.timezone ?? "",
         livestream.isFaceToFace ?? false,
         livestream.isHybrid ?? false,
         livestream.address ?? "",
         livestream.denyRecordingAccess ?? false,
         livestream.hasJobs ?? false,
         livestream.useOldUI ?? false,
         livestream.jobs ?? [],
         livestream.targetCountries ?? [],
         livestream.targetUniversities ?? [],
         livestream.targetFieldsOfStudy ?? [],
         livestream.targetLevelsOfStudy ?? [],
         livestream.speakers ?? [],
         livestream.creatorsIds ?? [],
         livestream.liveSpeakers ?? [],
         livestream.triGrams ?? {},
         livestream.reminderEmailsSent ?? null,
         livestream.language ?? null,
         livestream.type ?? "",
         livestream.status ?? null,
         livestream.groupQuestionsMap ?? null,
         livestream.maxRegistrants ?? null,
         livestream.duration ?? null,
         livestream.lastUpdatedAuthorInfo ?? null,
         livestream.author ?? null,
         livestream.index ?? null,
         livestream.parentLivestream ?? null
      )
   }

   static createFromPlainObject(livestream: LivestreamPresenter) {
      const livestreamInstance = new LivestreamPresenter(
         livestream.id,
         livestream.title,
         livestream.summary,
         livestream.reasonsToJoinLivestream,
         livestream.reasonsToJoinLivestream_v2,
         livestream.backgroundImageUrl,
         livestream.company,
         livestream.companyId,
         livestream.companyLogoUrl,
         fromSerializedDate(livestream.created),
         fromSerializedDate(livestream.start),
         fromSerializedDate(livestream.startedAt),
         fromSerializedDate(livestream.endedAt),
         livestream.currentSpeakerId,
         livestream.handRaiseActive,
         livestream.withResume,
         livestream.impressions,
         livestream.recommendedImpressions,
         livestream.groupIds,
         livestream.interestsIds,
         livestream.businessFunctionsTagIds,
         livestream.contentTopicsTagIds,
         livestream.isRecording,
         livestream.hasNoTalentPool,
         livestream.test,
         livestream.openStream,
         livestream.hasStarted,
         livestream.hasEnded,
         livestream.hidden,
         livestream.targetCategories,
         livestream.mode,
         livestream.screenSharerId,
         fromSerializedDate(livestream.lastUpdated),
         livestream.questionsDisabled,
         livestream.externalEventLink,
         livestream.timezone,
         livestream.isFaceToFace,
         livestream.isHybrid,
         livestream.address,
         livestream.denyRecordingAccess,
         livestream.hasJobs,
         livestream.useOldUI,
         livestream.jobs,
         livestream.targetCountries,
         livestream.targetUniversities,
         livestream.targetFieldsOfStudy,
         livestream.targetLevelsOfStudy,
         livestream.speakers,
         livestream.creatorsIds,
         livestream.liveSpeakers,
         livestream.triGrams,
         livestream.reminderEmailsSent,
         livestream.language,
         livestream.type,
         livestream.status,
         livestream.groupQuestionsMap,
         livestream.maxRegistrants,
         livestream.duration,
         livestream.lastUpdatedAuthorInfo,
         livestream.author,
         livestream.index,
         livestream.parentLivestream
      )

      // If the livestream is recommended, we need to set the flag
      if (livestream.isRecommended) {
         livestreamInstance.setIsRecommended(true)
      }
      return livestreamInstance
   }

   static serializeDocument(livestream: LivestreamEvent) {
      return LivestreamPresenter.createFromDocument(
         livestream
      ).serializeToPlainObject()
   }

   static parseDocument(
      livestream: LivestreamPresenter,
      fromDate: fromDateFirestoreFn
   ) {
      return LivestreamPresenter.createFromPlainObject(
         livestream
      ).convertToDocument(fromDate)
   }

   convertToDocument(fromDate: fromDateFirestoreFn): LivestreamEvent {
      return {
         id: this.id,
         title: this.title,
         summary: this.summary,
         backgroundImageUrl: this.backgroundImageUrl,
         company: this.company,
         companyId: this.companyId,
         companyLogoUrl: this.companyLogoUrl,
         created: fromDateConverter(this.created, fromDate),
         start: fromDateConverter(this.start, fromDate),
         startedAt: fromDateConverter(this.startedAt, fromDate),
         endedAt: fromDateConverter(this.endedAt, fromDate),
         currentSpeakerId: this.currentSpeakerId,
         handRaiseActive: this.handRaiseActive,
         withResume: this.withResume,
         impressions: this.impressions,
         recommendedImpressions: this.recommendedImpressions,
         groupIds: this.groupIds,
         interestsIds: this.interestsIds,
         businessFunctionsTagIds: this.businessFunctionsTagIds,
         contentTopicsTagIds: this.contentTopicsTagIds,
         isRecording: this.isRecording,
         hasNoTalentPool: this.hasNoTalentPool,
         test: this.test,
         openStream: this.openStream,
         hasStarted: this.hasStarted,
         startDate: this.start,
         address: this.address,
         hasEnded: this.hasEnded,
         hidden: this.hidden,
         targetCategories: this.targetCategories,
         mode: this.mode,
         screenSharerId: this.screenSharerId,
         lastUpdated: fromDateConverter(this.lastUpdated, fromDate),
         questionsDisabled: this.questionsDisabled,
         externalEventLink: this.externalEventLink,
         timezone: this.timezone,
         isFaceToFace: this.isFaceToFace,
         isHybrid: this.isHybrid,
         hasJobs: this.hasJobs,
         jobs: this.jobs,
         targetCountries: this.targetCountries,
         targetUniversities: this.targetUniversities,
         targetFieldsOfStudy: this.targetFieldsOfStudy,
         targetLevelsOfStudy: this.targetLevelsOfStudy,
         speakers: this.speakers,
         creatorsIds: this.creatorsIds,
         liveSpeakers: this.liveSpeakers,
         reminderEmailsSent: this.reminderEmailsSent,
         language: this.language,
         type: this.type,
         status: this.status,
         groupQuestionsMap: this.groupQuestionsMap,
         maxRegistrants: this.maxRegistrants,
         duration: this.duration,
         lastUpdatedAuthorInfo: this.lastUpdatedAuthorInfo,
         author: this.author,
         index: this.index,
         parentLivestream: this.parentLivestream,
         denyRecordingAccess: this.denyRecordingAccess,
         triGrams: this.triGrams,
      }
   }
}
