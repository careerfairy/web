import { Identifiable } from "../commonTypes"
import { Timestamp } from "../firebaseTypes"

export enum TalentGuideModuleCategory {
   BEFORE_APPLYING = "WHAT_TO_DO_BEFORE_APPLYING",
   APPLYING = "APPLYING_INSIGHTS",
   AFTER_APPLYING = "STEPS_AFTER_APPLYING",
}

// Collection path: talentGuideProgress/{userAuthUid}_{moduleHygraphId}
export interface TalentGuideProgress extends Identifiable {
   userAuthUid: string
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
   startedAt: Timestamp | null
   lastUpdated: Timestamp | null
   completedAt: Timestamp | null

   // Engagement metrics
   totalVisits: number
   lastVisitedAt: Timestamp | null
}

export const QUIZ_STATE = {
   /**
    * Quiz has not been attempted
    */
   NOT_ATTEMPTED: "notAttempted",

   /**
    * Quiz has been attempted and failed
    */
   FAILED: "failed",

   /**
    * Quiz has been attempted and passed
    */
   PASSED: "passed",
} as const

export type QuizState = (typeof QUIZ_STATE)[keyof typeof QUIZ_STATE]

// Collection path: talentGuideQuizzes/{userAuthUid}_{moduleHygraphId}_{quizHygraphId}
export interface TalentGuideQuiz extends Identifiable {
   userAuthUid: string
   moduleHygraphId: string
   quizHygraphId: string
   selectedAnswerIds: string[]

   state: QuizState
   attemptedAt: Timestamp | null

   lastUpdated: Timestamp | null
}
