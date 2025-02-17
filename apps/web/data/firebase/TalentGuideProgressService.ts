import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   FEEDBACK_TAG_CATEGORY,
   QUIZ_STATE,
   TalentGuideFeedback,
   TalentGuideProgress,
   TalentGuideQuiz,
   TalentGuideRating,
} from "@careerfairy/shared-lib/talent-guide"
import { Page, QuizModelType, TalentGuideModule } from "data/hygraph/types"
import {
   arrayUnion,
   collection,
   doc,
   getDoc,
   getDocs,
   increment,
   PartialWithFieldValue,
   query,
   runTransaction,
   setDoc,
   UpdateData,
   updateDoc,
   where,
   writeBatch,
} from "firebase/firestore"
import { Functions } from "firebase/functions"
import {
   FirestoreInstance,
   FunctionsInstance,
   Timestamp,
} from "./FirebaseInstance"

export class TalentGuideProgressService {
   constructor(private readonly functions: Functions) {}

   /**
    * Generates a composite ID for a module progress document
    * @param userAuthUid - The authenticated user's ID
    * @param moduleId - The Hygraph module ID
    * @returns A composite ID in the format `userAuthUid_moduleId`
    */
   private getModuleCompositeId(userAuthUid: string, moduleId: string) {
      return `${userAuthUid}_${moduleId}`
   }

   /**
    * Generates a composite ID for a quiz document
    * @param userAuthUid - The authenticated user's ID
    * @param moduleId - The Hygraph module ID
    * @param quizId - The Hygraph quiz ID
    * @returns A composite ID in the format `userAuthUid_moduleId_quizId`
    */
   private getQuizCompositeId(
      userAuthUid: string,
      moduleId: string,
      quizId: string
   ) {
      return `${userAuthUid}_${moduleId}_${quizId}`
   }

   /**
    * Retrieves a user's progress for a specific module
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @returns A Promise resolving to the module progress document
    */
   async getModuleProgress(moduleId: string, userAuthUid: string) {
      return getDoc(this.getModuleProgressRef(moduleId, userAuthUid))
   }

   /**
    * Retrieves a user's quiz data for a specific module
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @param quizId - The Hygraph quiz ID
    * @returns A Promise resolving to the quiz document
    */
   async getModuleQuiz(moduleId: string, userAuthUid: string, quizId: string) {
      return getDoc(this.getQuizRef(moduleId, userAuthUid, quizId))
   }

   /**
    * Creates a new module progress document for a user and adds a visit to the module
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @param moduleData - The module data from Hygraph
    * @returns A Promise resolving when the document is created
    */
   async createModuleProgress(
      moduleId: string,
      userAuthUid: string,
      moduleData: Page<TalentGuideModule>
   ) {
      return setDoc(this.getModuleProgressRef(moduleId, userAuthUid), {
         id: this.getModuleCompositeId(userAuthUid, moduleId),
         moduleHygraphId: moduleId,
         userAuthUid,
         currentStepIndex: 0,
         completedStepIds: [],
         moduleName: moduleData.content.moduleName,
         moduleCategory: moduleData.content.category,
         totalSteps: moduleData.content.moduleSteps.length,
         percentageComplete: 0,
         startedAt: Timestamp.now(),
         lastUpdated: null,
         lastVisitedAt: Timestamp.now(),
         totalVisits: 1,
         completedAt: null,
         restartCount: 0,
         levelSlug: moduleData.slug,
      })
   }

   /**
    * Increments the total visits counter for a module
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @returns A Promise resolving when the counter is incremented
    */
   incrementTotalVisits(moduleId: string, userAuthUid: string) {
      return this.updateModuleProgress(moduleId, userAuthUid, {
         totalVisits: increment(1),
         lastVisitedAt: Timestamp.now(),
      })
   }

   /**
    * Updates a user's progress for a specific module
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @param data - The data to update
    * @returns A Promise resolving when the document is updated
    */
   updateModuleProgress(
      moduleId: string,
      userAuthUid: string,
      data: UpdateData<TalentGuideProgress>
   ) {
      return updateDoc(this.getModuleProgressRef(moduleId, userAuthUid), {
         ...data,
         lastUpdated: Timestamp.now(),
      })
   }

   updateQuiz(
      moduleId: string,
      userAuthUid: string,
      quizId: string,
      data: PartialWithFieldValue<TalentGuideQuiz>
   ) {
      return setDoc(this.getQuizRef(moduleId, userAuthUid, quizId), {
         ...data,
         lastUpdated: Timestamp.now(),
      })
   }

   async attemptQuiz(
      moduleId: string,
      userAuthUid: string,
      quizFromHygraph: QuizModelType,
      selectedAnswerIds: string[]
   ): Promise<boolean> {
      const correctAnswerIds = quizFromHygraph.answers
         .filter((answer) => answer.isCorrect)
         .map((answer) => answer.id)

      // Check if the number of selected answers matches the number of correct answers
      // AND all selected answers are correct
      const passed =
         selectedAnswerIds.length === correctAnswerIds.length &&
         selectedAnswerIds.every((answerId) =>
            correctAnswerIds.includes(answerId)
         )

      const state = passed ? QUIZ_STATE.PASSED : QUIZ_STATE.FAILED

      const data: TalentGuideQuiz = {
         id: this.getQuizCompositeId(userAuthUid, moduleId, quizFromHygraph.id),
         userAuthUid,
         moduleHygraphId: moduleId,
         quizHygraphId: quizFromHygraph.id,
         selectedAnswerIds,
         state,
         attemptedAt: Timestamp.now(),
         lastUpdated: Timestamp.now(),
      }

      await this.updateQuiz(moduleId, userAuthUid, quizFromHygraph.id, data)

      return passed
   }

   /**
    * Gets a reference to a module progress document
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @returns A DocumentReference for the module progress
    */
   getModuleProgressRef(moduleId: string, userAuthUid: string) {
      return doc(
         FirestoreInstance,
         "talentGuideProgress",
         this.getModuleCompositeId(userAuthUid, moduleId)
      ).withConverter(createGenericConverter<TalentGuideProgress>())
   }

   /**
    * Gets a reference to a quiz document
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @param quizId - The Hygraph quiz ID
    * @returns A DocumentReference for the quiz
    */
   getQuizRef(moduleId: string, userAuthUid: string, quizId: string) {
      return doc(
         FirestoreInstance,
         "talentGuideQuizzes",
         this.getQuizCompositeId(userAuthUid, moduleId, quizId)
      ).withConverter(createGenericConverter<TalentGuideQuiz>())
   }

   /**
    * Gets all quizzes for a module
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @returns A Promise resolving to an array of quiz documents
    */
   getAllModuleQuizzes(moduleId: string, userAuthUid: string) {
      return getDocs(
         query(
            collection(FirestoreInstance, "talentGuideQuizzes"),
            where("moduleHygraphId", "==", moduleId),
            where("userAuthUid", "==", userAuthUid)
         ).withConverter(createGenericConverter<TalentGuideQuiz>())
      )
   }

   /**
    * Deletes a user's module progress document
    * Used for demo purposes only
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @returns A Promise resolving when the document is deleted
    */
   async deleteModuleProgress(moduleId: string, userAuthUid: string) {
      const batch = writeBatch(FirestoreInstance)

      const quizSnaps = await this.getAllModuleQuizzes(moduleId, userAuthUid)

      quizSnaps.forEach((quizSnap) => {
         batch.delete(quizSnap.ref)
      })

      batch.delete(this.getModuleProgressRef(moduleId, userAuthUid))

      return batch.commit()
   }

   /**
    * Restarts a module by resetting progress but keeping the visit count
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @param moduleData - The module data from Hygraph
    * @returns Promise resolving when the module is restarted
    */
   async restartModule(
      moduleId: string,
      userAuthUid: string,
      moduleData: Page<TalentGuideModule>
   ) {
      const progressRef = this.getModuleProgressRef(moduleId, userAuthUid)

      // Get quiz snapshots outside transaction since they're not part of the atomic operation
      const quizSnaps = await this.getAllModuleQuizzes(moduleId, userAuthUid)

      return runTransaction(FirestoreInstance, async (transaction) => {
         const progressDoc = await transaction.get(progressRef)

         if (!progressDoc.exists()) {
            throw new Error(
               "Cannot restart module: progress document does not exist"
            )
         }

         const currentProgress = progressDoc.data()

         // Delete all quizzes
         quizSnaps.forEach((quizSnap) => {
            transaction.delete(quizSnap.ref)
         })

         // Reset progress but keep total visits
         transaction.update(progressRef, {
            currentStepIndex: 0,
            completedStepIds: [],
            moduleName: moduleData.content.moduleName,
            moduleCategory: moduleData.content.category,
            totalSteps: moduleData.content.moduleSteps.length,
            percentageComplete: 0,
            startedAt: Timestamp.now(),
            lastUpdated: Timestamp.now(),
            lastVisitedAt: Timestamp.now(),
            totalVisits: currentProgress.totalVisits,
            completedAt: null,
            restartCount: (currentProgress.restartCount ?? 0) + 1,
            levelSlug: moduleData.slug,
         })
      })
   }

   /**
    * Gets all module progress for a user
    * @param userAuthUid - The authenticated user's ID
    * @returns Promise resolving to array of module progress documents
    */
   async getAllUserModuleProgress(
      userAuthUid: string
   ): Promise<TalentGuideProgress[]> {
      const progressQuery = query(
         collection(FirestoreInstance, "talentGuideProgress"),
         where("userAuthUid", "==", userAuthUid)
      ).withConverter(createGenericConverter<TalentGuideProgress>())

      const snapshot = await getDocs(progressQuery)
      return snapshot.docs.map((doc) => doc.data())
   }

   /**
    * Gets the next uncompleted module for a user
    * @param userAuthUid - The authenticated user's ID
    * @param allModules - All available modules from the CMS
    * @returns Promise<Page<TalentGuideModule> | null> The next module or null if all completed
    */
   async getNextModule(
      userAuthUid: string,
      allModules: Page<TalentGuideModule>[]
   ): Promise<Page<TalentGuideModule> | null> {
      // Get user's progress from Firebase
      const userProgress = await this.getAllUserModuleProgress(userAuthUid)

      // Create a map of module IDs to progress
      const progressMap = new Map<string, TalentGuideProgress>()
      userProgress.forEach((progress) => {
         progressMap.set(progress.moduleHygraphId, progress)
      })

      // Sort modules by level
      const sortedModules = allModules.sort((a, b) => {
         if (!a.content || !b.content) return 0
         return (a.content.level || 0) - (b.content.level || 0)
      })

      // First, try to find an uncompleted module
      const nextIncompleteModule = sortedModules.find((module) => {
         if (!module.content) return false
         const progress = progressMap.get(module.content.id)
         return !progress || !progress.completedAt
      })

      // If we found an incomplete module, return it
      return nextIncompleteModule || null
   }

   /**
    * Calculates and updates progress for proceeding to the next step
    * @param moduleData - The module data from Hygraph
    * @param userAuthUid - The authenticated user's ID
    * @param currentStepIndex - The current step index
    * @returns The next step index, or null if there are no more steps
    */
   async proceedToNextStep(
      moduleData: Page<TalentGuideModule>,
      userAuthUid: string,
      currentStepIndex: number
   ): Promise<{ nextStepIndex: number } | null> {
      const nextStepIndex = currentStepIndex + 1

      const data: UpdateData<TalentGuideProgress> = {
         completedStepIds: arrayUnion(
            moduleData.content.moduleSteps[currentStepIndex].id
         ),
         percentageComplete:
            ((currentStepIndex + 1) / moduleData.content.moduleSteps.length) *
            100,
         totalSteps: moduleData.content.moduleSteps.length,
         moduleName: moduleData.content.moduleName,
         moduleCategory: moduleData.content.category,
         levelSlug: moduleData.slug,
      }

      const isCompleted = nextStepIndex >= moduleData.content.moduleSteps.length

      if (isCompleted) {
         data.completedAt = Timestamp.now()
      }

      await this.updateModuleProgress(moduleData.content.id, userAuthUid, data)

      return isCompleted ? null : { nextStepIndex }
   }

   /**
    * Gets a reference to a feedback document
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @returns A DocumentReference for the feedback
    */
   getFeedbackRef(moduleId: string, userAuthUid: string) {
      return doc(
         FirestoreInstance,
         "talentGuideFeedback",
         this.getModuleCompositeId(userAuthUid, moduleId)
      ).withConverter(createGenericConverter<TalentGuideFeedback>())
   }

   /**
    * Submits feedback for a module
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @param rating - Rating from 1 to 5
    * @param selectedTagIds - Array of selected tag categories
    * @returns A Promise resolving when the feedback is submitted
    */
   async submitFeedback(
      moduleId: string,
      userAuthUid: string,
      rating: TalentGuideRating,
      selectedTagIds: FEEDBACK_TAG_CATEGORY[]
   ) {
      const now = Timestamp.now()

      return setDoc(this.getFeedbackRef(moduleId, userAuthUid), {
         id: this.getModuleCompositeId(userAuthUid, moduleId),
         userAuthUid,
         moduleHygraphId: moduleId,
         rating,
         selectedTagIds,
         submittedAt: now,
         lastUpdated: now,
      })
   }

   /**
    * Calculates the overall progress percentage across all modules for a user
    * @param userAuthUid - The authenticated user's ID
    * @param allModules - All available modules from the CMS
    * @returns Promise resolving to overall progress percentage (0-100)
    */
   async getOverallProgress(
      userAuthUid: string,
      allModules: Page<TalentGuideModule>[]
   ): Promise<number> {
      const allProgress = await this.getAllUserModuleProgress(userAuthUid)
      const progressMap = new Map<string, TalentGuideProgress>()
      allProgress.forEach((progress) => {
         progressMap.set(progress.moduleHygraphId, progress)
      })

      if (allModules.length === 0) return 0

      // Calculate total progress including modules that haven't been started (0% progress)
      const totalProgressPercentage = allModules.reduce((sum, module) => {
         if (!module.content) return sum
         const progress = progressMap.get(module.content.id)
         return sum + (progress?.percentageComplete || 0)
      }, 0)

      return totalProgressPercentage / allModules.length
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const talentGuideProgressService = new TalentGuideProgressService(
   FunctionsInstance as any
)

export default TalentGuideProgressService
