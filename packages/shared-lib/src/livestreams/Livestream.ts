import { BaseModel, fromSerializedDate } from "../BaseModel"
import {
   AuthorInfo,
   IEmailSent,
   LiveSpeaker,
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
   LivestreamJobAssociation,
   LivestreamLanguage,
   LivestreamMode,
   LivestreamStatus,
   Speaker,
} from "./livestreams"
import { FieldOfStudy } from "../fieldOfStudy"
import { dateFromFirebaseTimestamp } from "../BaseFirebaseRepository"

/**
 * Livestream class
 *
 * Our own type that can be created from Firebase
 * UI/Business logic should live here
 */
export class Livestream extends BaseModel {
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
      public readonly author?: AuthorInfo
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

   static createFromFirebase(livestream: LivestreamEvent) {
      return new Livestream(
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
         livestream.author ?? null
      )
   }

   static createFromPlainObject(livestream: Livestream) {
      const livestreamInstance = new Livestream(
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
         livestream.author
      )

      // If the livestream is recommended, we need to set the flag
      if (livestream.isRecommended) {
         livestreamInstance.setIsRecommended(true)
      }
      return livestreamInstance
   }
}
