import { BaseModel, fromSerializedDate } from "../BaseModel"
import {
   AuthorInfo,
   IEmailSent,
   LiveSpeaker,
   LivestreamEvent,
   LivestreamEventPublicData,
   LivestreamGroupQuestionsMap,
   LivestreamJobAssociation,
   LivestreamLanguage,
   LivestreamMode,
   LivestreamStatus,
   Speaker,
   NUMBER_OF_MS_FROM_STREAM_START_TO_BE_CONSIDERED_PAST,
} from "./livestreams"
import { FieldOfStudy } from "../fieldOfStudy"
import {
   dateFromFirebaseTimestamp,
   dateToFirebaseTimestamp,
} from "../utils/firebaseSerializerMethods"

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
      public readonly backgroundImageUrl: string,
      public readonly company: string,
      public readonly companyId: string,
      public readonly participants: string[],
      public readonly participatingStudents: string[],
      public readonly companyLogoUrl: string,
      public readonly created: Date,
      public readonly start: Date,
      public readonly currentSpeakerId: string,
      public readonly handRaiseActive: boolean,
      public readonly withResume: boolean,

      public readonly groupIds: string[],
      public readonly interestsIds: string[],
      public readonly levelOfStudyIds: string[],
      public readonly fieldOfStudyIds: string[],
      public readonly isRecording: boolean,
      public readonly hasNoTalentPool: boolean,
      public readonly test: boolean,
      public readonly registeredUsers: string[],
      public readonly hasStarted: boolean,
      public readonly hasEnded: boolean,
      public readonly hidden: boolean,
      public readonly talentPool: string[],
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

      // ATS Jobs
      /**
       * During livestream creating, jobs can be associated with the livestream
       */
      public readonly jobs: LivestreamJobAssociation[],

      /**
       * An empty array means the livestream should target all the fields of study
       * [] -> All fields of study
       */
      public readonly targetFieldsOfStudy: FieldOfStudy[],
      /**
       * An empty array means the livestream should target all the levels of study
       * [] -> All levels of study
       */
      public readonly targetLevelsOfStudy: FieldOfStudy[],
      public readonly speakers: Speaker[],
      public readonly liveSpeakers: LiveSpeaker[],

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
      return this.hasStarted && !this.hasEnded
   }

   isTest(): boolean {
      return this.test
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

   /**
    * Elapsed minutes since the livestream started
    *
    * If the model is a BreakoutRoom document, the elapsed minutes
    * are related to the parent livestream document
    */
   elapsedMinutesSinceStart(): number {
      let start = this.start
      if ("parentLivestream" in this) {
         // breakout room support
         start = dateFromFirebaseTimestamp(this["parentLivestream"].start)
      }
      return Math.floor((Date.now() - start?.getTime()) / 1000 / 60)
   }

   static createFromDocument(livestream: LivestreamEvent) {
      return new LivestreamPresenter(
         livestream.id,
         livestream.title,
         livestream.summary ?? "",
         livestream.backgroundImageUrl ?? "",
         livestream.company ?? "",
         livestream.companyId ?? "",
         livestream.participants ?? [],
         livestream.participatingStudents ?? [],

         livestream.companyLogoUrl || "",
         dateFromFirebaseTimestamp(livestream.created),
         dateFromFirebaseTimestamp(livestream.start) ||
            new Date(livestream.startDate),
         livestream.currentSpeakerId || "",
         livestream.handRaiseActive ?? false,
         livestream.withResume ?? false,
         livestream.groupIds ?? [],
         livestream.interestsIds ?? [],
         livestream.levelOfStudyIds || [],
         livestream.fieldOfStudyIds || [],
         livestream.isRecording ?? false,
         livestream.hasNoTalentPool ?? false,
         livestream.test ?? false,
         livestream.registeredUsers ?? [],
         livestream.hasStarted ?? false,
         livestream.hasEnded ?? false,
         livestream.hidden ?? false,
         livestream.talentPool ?? [],
         livestream.targetCategories ?? [],
         livestream.mode ?? "default",
         livestream.screenSharerId ?? "",
         dateFromFirebaseTimestamp(livestream.lastUpdated),
         livestream.questionsDisabled ?? false,
         livestream.externalEventLink ?? "",
         livestream.timezone ?? "",
         livestream.isFaceToFace ?? false,
         livestream.isHybrid ?? false,
         livestream.address ?? "",

         livestream.jobs ?? [],
         livestream.targetFieldsOfStudy ?? [],
         livestream.targetLevelsOfStudy ?? [],
         livestream.speakers ?? [],
         livestream.liveSpeakers ?? [],
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
         livestream.backgroundImageUrl,
         livestream.company,
         livestream.companyId,
         livestream.participants,
         livestream.participatingStudents,
         livestream.companyLogoUrl,
         fromSerializedDate(livestream.created),
         fromSerializedDate(livestream.start),
         livestream.currentSpeakerId,
         livestream.handRaiseActive,
         livestream.withResume,
         livestream.groupIds,
         livestream.interestsIds,
         livestream.levelOfStudyIds,
         livestream.fieldOfStudyIds,
         livestream.isRecording,
         livestream.hasNoTalentPool,
         livestream.test,
         livestream.registeredUsers,
         livestream.hasStarted,
         livestream.hasEnded,
         livestream.hidden,
         livestream.talentPool,
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
         livestream.jobs,
         livestream.targetFieldsOfStudy,
         livestream.targetLevelsOfStudy,
         livestream.speakers,
         livestream.liveSpeakers,
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

   static parseDocument(livestream: LivestreamPresenter) {
      return LivestreamPresenter.createFromPlainObject(
         livestream
      ).convertToDocument()
   }

   convertToDocument(): LivestreamEvent {
      return {
         id: this.id,
         title: this.title,
         summary: this.summary,
         backgroundImageUrl: this.backgroundImageUrl,
         company: this.company,
         companyId: this.companyId,
         participants: this.participants,
         participatingStudents: this.participatingStudents,
         companyLogoUrl: this.companyLogoUrl,
         created: dateToFirebaseTimestamp(this.created),
         start: dateToFirebaseTimestamp(this.start),
         currentSpeakerId: this.currentSpeakerId,
         handRaiseActive: this.handRaiseActive,
         withResume: this.withResume,
         groupIds: this.groupIds,
         interestsIds: this.interestsIds,
         levelOfStudyIds: this.levelOfStudyIds,
         fieldOfStudyIds: this.fieldOfStudyIds,
         isRecording: this.isRecording,
         hasNoTalentPool: this.hasNoTalentPool,
         test: this.test,
         registeredUsers: this.registeredUsers,
         hasStarted: this.hasStarted,
         startDate: this.start,
         address: this.address,
         hasEnded: this.hasEnded,
         hidden: this.hidden,
         talentPool: this.talentPool,
         targetCategories: this.targetCategories,
         mode: this.mode,
         screenSharerId: this.screenSharerId,
         lastUpdated: dateToFirebaseTimestamp(this.lastUpdated),
         questionsDisabled: this.questionsDisabled,
         externalEventLink: this.externalEventLink,
         timezone: this.timezone,
         isFaceToFace: this.isFaceToFace,
         isHybrid: this.isHybrid,
         jobs: this.jobs,
         targetFieldsOfStudy: this.targetFieldsOfStudy,
         targetLevelsOfStudy: this.targetLevelsOfStudy,
         speakers: this.speakers,
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
      }
   }
}
