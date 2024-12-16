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

// Collection path: talentGuideQuizzes/{userAuthUid}_{moduleHygraphId}_{quizHygraphId}
export interface TalentGuideQuiz extends Identifiable {
   userAuthUid: string
   moduleHygraphId: string
   quizHygraphId: string
   selectedAnswerIds: string[]

   /**
    * - null: not attempted
    * - false: failed
    * - true: passed
    */
   isPassed: boolean | null
   attemptedAt: Timestamp | null

   isCompleted: boolean
   completedAt: Timestamp | null
}
