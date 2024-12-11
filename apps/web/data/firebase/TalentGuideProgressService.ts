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

   async getModuleProgress(moduleId: string, userId: string) {
      return getDoc(this.getModuleProgressRef(moduleId, userId))
   }

   async getModuleQuiz(moduleId: string, userId: string) {
      return getDoc(this.getQuizRef(moduleId, userId))
   }

   async createModuleProgress(
      moduleId: string,
      userId: string,
      moduleData: TalentGuideModule
   ) {
      return setDoc(
         this.getModuleProgressRef(moduleId, userId),
         {
            id: moduleId,
            moduleHygraphId: moduleId,
            userId,
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

   incrementTotalVisits(moduleId: string, userId: string) {
      return this.updateModuleProgress(moduleId, userId, {
         totalVisits: increment(1),
      })
   }

   updateModuleProgress(
      moduleId: string,
      userId: string,
      data: UpdateData<TalentGuideProgress>
   ) {
      return updateDoc(this.getModuleProgressRef(moduleId, userId), {
         ...data,
         lastUpdated: Timestamp.now(),
      })
   }

   getModuleProgressRef(moduleId: string, userId: string) {
      return doc(
         FirestoreInstance,
         "userData",
         userId,
         "talentGuideProgress",
         moduleId
      ).withConverter(createGenericConverter<TalentGuideProgress>())
   }

   getQuizRef(moduleId: string, userId: string) {
      return doc(
         FirestoreInstance,
         "userData",
         userId,
         "talentGuideQuizzes",
         moduleId
      ).withConverter(createGenericConverter<TalentGuideQuiz>())
   }

   /**
    * Reset the module for demo purposes
    */
   deleteModuleProgress(moduleId: string, userId: string) {
      return deleteDoc(this.getModuleProgressRef(moduleId, userId))
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const talentGuideProgressService = new TalentGuideProgressService(
   FunctionsInstance as any
)

export default TalentGuideProgressService
