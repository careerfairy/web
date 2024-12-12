import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   TalentGuideProgress,
   TalentGuideQuiz,
} from "@careerfairy/shared-lib/talent-guide"
import { TalentGuideModule } from "data/hygraph/types"
import {
   deleteDoc,
   doc,
   getDoc,
   increment,
   setDoc,
   UpdateData,
   updateDoc,
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
    * Creates a new module progress document for a user
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @param moduleData - The module data from Hygraph
    * @returns A Promise resolving when the document is created
    */
   async createModuleProgress(
      moduleId: string,
      userAuthUid: string,
      moduleData: TalentGuideModule
   ) {
      return setDoc(
         this.getModuleProgressRef(moduleId, userAuthUid),
         {
            id: this.getModuleCompositeId(userAuthUid, moduleId),
            moduleHygraphId: moduleId,
            userAuthUid,
            currentStepIndex: 0,
            completedStepIds: [],
            moduleName: moduleData.moduleName,
            moduleCategory: moduleData.category,
            totalSteps: moduleData.moduleSteps.length,
            percentageComplete: 0,
            startedAt: Timestamp.now(),
            lastUpdated: null,
            lastVisitedAt: Timestamp.now(),
            totalVisits: 1,
            completedAt: null,
         },
         {
            merge: true,
         }
      )
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
    * Deletes a user's module progress document
    * Used for demo purposes only
    * @param moduleId - The Hygraph module ID
    * @param userAuthUid - The authenticated user's ID
    * @returns A Promise resolving when the document is deleted
    */
   deleteModuleProgress(moduleId: string, userAuthUid: string) {
      return deleteDoc(this.getModuleProgressRef(moduleId, userAuthUid))
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const talentGuideProgressService = new TalentGuideProgressService(
   FunctionsInstance as any
)

export default TalentGuideProgressService
