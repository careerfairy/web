import { removeDuplicates } from "@careerfairy/shared-lib/utils"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { arrayUnion } from "firebase/firestore"
import { RootState } from "store"
import { errorLogAndNotify } from "util/CommonUtil"

type TalentGuideState = {
   visibleSteps: number[]
   currentStepIndex: number
   moduleData: Page<TalentGuideModule> | null
   isLoadingNextStep: boolean
   isLoadingTalentGuide: boolean
   isLoadingNextStepError: string | null
   isLoadingTalentGuideError: string | null
   userAuthUid: string
}

const initialState: TalentGuideState = {
   visibleSteps: [0],
   currentStepIndex: 0,
   moduleData: null,
   isLoadingNextStep: false,
   isLoadingTalentGuide: true,
   isLoadingNextStepError: null,
   isLoadingTalentGuideError: null,
   userAuthUid: null,
}

// Async thunk to proceed to next step
export const proceedToNextStep = createAsyncThunk(
   "talentGuide/proceedToNextStep",
   async (_, { getState }) => {
      const state = getState() as RootState
      const { moduleData, currentStepIndex, userAuthUid } = state.talentGuide

      if (!moduleData?.content) return null

      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex >= moduleData.content.moduleSteps.length) return null

      // Update progress in Firestore
      await talentGuideProgressService.updateModuleProgress(
         moduleData.content.id,
         userAuthUid,
         {
            currentStepIndex: nextStepIndex,
            completedStepIds: arrayUnion(
               moduleData.content.moduleSteps[currentStepIndex].id
            ),
            percentageComplete:
               ((nextStepIndex + 1) / moduleData.content.moduleSteps.length) *
               100,
            totalSteps: moduleData.content.moduleSteps.length,
         }
      )

      return {
         nextStepIndex,
      }
   }
)

type LoadTalentGuideProgressPayload = {
   userAuthUid: string
   moduleData: Page<TalentGuideModule>
}

type LoadTalentGuideProgressResult = {
   completedStepIds: string[]
   moduleData: Page<TalentGuideModule>
   userAuthUid: string
}
// Async thunk to load initial progress
export const loadTalentGuide = createAsyncThunk<
   LoadTalentGuideProgressResult,
   LoadTalentGuideProgressPayload
>("talentGuide/loadGuide", async (payload) => {
   if (!payload.userAuthUid || !payload.moduleData.content) {
      throw new Error(
         "Cannot load talent guide progress: userAuthUid and moduleData.content are required"
      )
   }

   const progressDoc = await talentGuideProgressService.getModuleProgress(
      payload.moduleData.content.id,
      payload.userAuthUid
   )

   let completedStepIds: string[] = []

   if (progressDoc.exists()) {
      const progressData = progressDoc.data()
      completedStepIds = progressData.completedStepIds || []

      // Increment total visits for the module
      await talentGuideProgressService.incrementTotalVisits(
         progressData.moduleHygraphId,
         payload.userAuthUid
      )
   } else {
      await talentGuideProgressService.createModuleProgress(
         payload.moduleData.content.id,
         payload.userAuthUid,
         payload.moduleData.content
      )
   }

   return {
      completedStepIds,
      moduleData: payload.moduleData,
      userAuthUid: payload.userAuthUid,
   }
})

// Ignore this is for demo purposes
export const resetModuleProgressForDemo = createAsyncThunk(
   "talentGuide/resetProgressForDemo",
   async (_, { getState }) => {
      const state = getState() as RootState
      const { moduleData, userAuthUid: userAuthUid } = state.talentGuide

      if (!moduleData?.content || !userAuthUid) {
         throw new Error(
            "Cannot reset progress: moduleData or userAuthUid is missing"
         )
      }

      await talentGuideProgressService.deleteModuleProgress(
         moduleData.content.id,
         userAuthUid
      )

      await talentGuideProgressService.createModuleProgress(
         moduleData.content.id,
         userAuthUid,
         moduleData.content
      )

      return {
         moduleData,
         userAuthUid,
      }
   }
)

const talentGuideReducer = createSlice({
   name: "talentGuide",
   initialState,
   reducers: {
      resetTalentGuide: () => initialState,
   },
   extraReducers: (builder) => {
      builder
         .addCase(proceedToNextStep.pending, (state) => {
            state.isLoadingNextStep = true
         })
         .addCase(proceedToNextStep.fulfilled, (state, action) => {
            if (!action.payload) return

            const { nextStepIndex } = action.payload
            state.currentStepIndex = nextStepIndex
            if (!state.visibleSteps.includes(nextStepIndex)) {
               state.visibleSteps.push(nextStepIndex)
            }
            state.isLoadingNextStep = false
         })
         .addCase(proceedToNextStep.rejected, (state, action) => {
            state.isLoadingNextStep = false
            const errorMessage =
               action.error.message || "Failed to proceed to next step"
            state.isLoadingNextStepError = errorMessage

            errorLogAndNotify(new Error(errorMessage), {
               context: "proceedToNextStep",
               userAuthUid: state.userAuthUid,
               originalError: action.error,
            })
         })
         .addCase(loadTalentGuide.pending, (state) => {
            state.isLoadingTalentGuide = true
         })
         .addCase(loadTalentGuide.fulfilled, (state, action) => {
            if (!action.payload) {
               return
            }

            const { completedStepIds, moduleData, userAuthUid } = action.payload

            const moduleSteps = moduleData.content.moduleSteps

            // Find indices of completed steps
            const completedStepIndices = completedStepIds
               .map((stepId) =>
                  moduleSteps.findIndex((step) => step.id === stepId)
               )
               .filter((index) => index !== -1) // Remove any not found (-1)
               .sort((a, b) => a - b)

            // Current step is the next step after the last completed one
            const lastCompletedIndex = Math.max(...completedStepIndices, -1)
            const currentStepIndex = lastCompletedIndex + 1

            // If we've completed all steps, stay on the last one
            const actualCurrentIndex = Math.min(
               currentStepIndex,
               moduleSteps.length - 1
            )

            // Set visible steps (completed + current)
            state.visibleSteps = removeDuplicates([
               ...completedStepIndices,
               actualCurrentIndex,
            ]).sort((a, b) => a - b)

            state.currentStepIndex = actualCurrentIndex
            state.moduleData = moduleData
            state.isLoadingTalentGuide = false
            state.userAuthUid = userAuthUid
         })
         .addCase(loadTalentGuide.rejected, (state, action) => {
            state.isLoadingTalentGuide = false
            const errorMessage =
               action.error.message || "Failed to load talent guide"
            state.isLoadingTalentGuideError = errorMessage

            errorLogAndNotify(new Error(errorMessage), {
               context: "loadTalentGuide",
               userAuthUid: state.userAuthUid,
               originalError: action.error,
            })
         })
         // Ignore these cases, they are for demo purposes
         .addCase(resetModuleProgressForDemo.pending, (state) => {
            state.isLoadingTalentGuide = true
         })
         .addCase(resetModuleProgressForDemo.fulfilled, (state, action) => {
            if (!action.payload) return

            // Reset to initial state but keep moduleData
            state.visibleSteps = [0]
            state.currentStepIndex = 0
            state.isLoadingTalentGuide = false
         })
         .addCase(resetModuleProgressForDemo.rejected, (state, action) => {
            state.isLoadingTalentGuide = false
            const errorMessage =
               action.error.message || "Failed to reset module progress"
            state.isLoadingTalentGuideError = errorMessage

            errorLogAndNotify(new Error(errorMessage), {
               context: "resetModuleProgressForDemo",
               userAuthUid: state.userAuthUid,
               originalError: action.error,
            })
         })
   },
})

export const { resetTalentGuide } = talentGuideReducer.actions

export default talentGuideReducer.reducer
