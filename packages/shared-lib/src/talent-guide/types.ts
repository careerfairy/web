import { Create, Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"

export enum TalentGuideModuleCategory {
   BEFORE_APPLYING = "WHAT_TO_DO_BEFORE_APPLYING",
   APPLYING = "APPLYING_INSIGHTS",
   AFTER_APPLYING = "STEPS_AFTER_APPLYING",
}

// Collection path: userData/{userId}/talentGuideProgress
export interface TalentGuideProgress extends Identifiable {
   userId: string
   moduleHygraphId: string

   // Core progress tracking
   currentStepIndex: number
   completedStepIds: string[]

   // Module metadata (useful for simple querying/analytics/)
   moduleName: string
   moduleCategory: TalentGuideModuleCategory
   totalSteps: number
   percentageComplete: number

   // Time tracking
   startedAt: Timestamp
   lastUpdated: Timestamp
   completedAt?: Timestamp

   // Engagement metrics
   totalVisits: number
   lastVisitedAt: Timestamp
}

export type TalentGuideCreate = Create<TalentGuideProgress>

// Collection path: userData/{userId}/talentGuideQuizzes
export interface TalentGuideQuiz extends Identifiable {
   userId: string
   moduleId: string

   quizHygraphId: string

   // Progress tracking
   attempts: number
   lastAttemptAt: Timestamp
   isCompleted: boolean

   // Analytics
   /**
    * History of selected answers
    *  - Each element is an array of selected answer IDs
    */
   previousSelectedAnswerIds: string[][]
   completedAt?: Timestamp
}

export type TalentGuideQuizCreate = Create<TalentGuideQuiz>
