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

   private getModuleCompositeId(userAuthUid: string, moduleId: string) {
      return `${userAuthUid}_${moduleId}`
   }

   private getQuizCompositeId(
      userAuthUid: string,
      moduleId: string,
      quizId: string
   ) {
      return `${userAuthUid}_${moduleId}_${quizId}`
   }

   async getModuleProgress(moduleId: string, userAuthUid: string) {
      return getDoc(this.getModuleProgressRef(moduleId, userAuthUid))
   }

   async getModuleQuiz(moduleId: string, userAuthUid: string, quizId: string) {
      return getDoc(this.getQuizRef(moduleId, userAuthUid, quizId))
   }

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

   incrementTotalVisits(moduleId: string, userAuthUid: string) {
      return this.updateModuleProgress(moduleId, userAuthUid, {
         totalVisits: increment(1),
      })
   }

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

   getModuleProgressRef(moduleId: string, userAuthUid: string) {
      return doc(
         FirestoreInstance,
         "talentGuideProgress",
         this.getModuleCompositeId(userAuthUid, moduleId)
      ).withConverter(createGenericConverter<TalentGuideProgress>())
   }

   getQuizRef(moduleId: string, userAuthUid: string, quizId: string) {
      return doc(
         FirestoreInstance,
         "talentGuideQuizzes",
         this.getQuizCompositeId(userAuthUid, moduleId, quizId)
      ).withConverter(createGenericConverter<TalentGuideQuiz>())
   }

   /**
    * Reset the module for demo purposes
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
