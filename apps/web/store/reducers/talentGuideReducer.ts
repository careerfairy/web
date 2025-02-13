import {
   QUIZ_STATE,
   QuizState,
   TalentGuideQuiz,
} from "@careerfairy/shared-lib/talent-guide"
import { removeDuplicates } from "@careerfairy/shared-lib/utils"
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { talentGuideProgressService } from "data/firebase/TalentGuideProgressService"
import { Page, QuizModelType, TalentGuideModule } from "data/hygraph/types"
import { RootState } from "store"
import { AnalyticsEvents } from "util/analytics/types"
import { dataLayerLevelEvent } from "util/analyticsUtils"
import { errorLogAndNotify } from "util/CommonUtil"

export type QuizStatus = {
   selectedAnswerIds: string[]
   state: QuizState
}

type TalentGuideState = {
   visibleSteps: number[]
   currentStepIndex: number
   moduleData: Page<TalentGuideModule> | null
   isLoadingNextStep: boolean
   isLoadingTalentGuide: boolean
   isLoadingNextStepError: string | null
   isLoadingTalentGuideError: string | null
   isLoadingAttemptQuiz: boolean
   isLoadingAttemptQuizError: string | null
   isRestartingModule: boolean
   isRestartingModuleError: string | null
   userAuthUid: string
   quizStatuses: Record<string, QuizStatus>
   showEndOfModuleExperience: boolean
}

const initialState: TalentGuideState = {
   visibleSteps: [0],
   currentStepIndex: 0,
   moduleData: null,
   isLoadingNextStep: false,
   isLoadingTalentGuide: true,
   isLoadingNextStepError: null,
   isLoadingTalentGuideError: null,
   isLoadingAttemptQuiz: false,
   isLoadingAttemptQuizError: null,
   isRestartingModule: false,
   isRestartingModuleError: null,
   userAuthUid: null,
   quizStatuses: {},
   showEndOfModuleExperience: false,
}

type LoadTalentGuideProgressPayload = {
   userAuthUid: string
   moduleData: Page<TalentGuideModule>
}

type LoadTalentGuideProgressResult = {
   completedStepIds: string[]
   moduleData: Page<TalentGuideModule>
   userAuthUid: string
   quizzes: Record<string, TalentGuideQuiz>
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

   const [progressDoc, quizSnaps] = await Promise.all([
      talentGuideProgressService.getModuleProgress(
         payload.moduleData.content.id,
         payload.userAuthUid
      ),
      talentGuideProgressService.getAllModuleQuizzes(
         payload.moduleData.content.id,
         payload.userAuthUid
      ),
   ])

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
         payload.moduleData
      )
   }

   /**
    * Convert the quiz snapshots to a dictionary of quizzes by quizHygraphId
    */
   const quizzes = quizSnaps.docs
      .map((doc) => doc.data())
      .reduce((acc, quiz) => {
         acc[quiz.quizHygraphId] = quiz
         return acc
      }, {} as Record<string, TalentGuideQuiz>)

   return {
      completedStepIds,
      moduleData: payload.moduleData,
      userAuthUid: payload.userAuthUid,
      quizzes,
   }
})

// Async thunk to proceed to next step
export const proceedToNextStep = createAsyncThunk(
   "talentGuide/proceedToNextStep",
   async (_, { getState }) => {
      const state = getState() as RootState
      const { moduleData, currentStepIndex, userAuthUid } = state.talentGuide

      if (!moduleData?.content) throw new Error("Module data is missing")

      return talentGuideProgressService.proceedToNextStep(
         moduleData,
         userAuthUid,
         currentStepIndex
      )
   }
)

type AttemptQuizPayload = {
   quizFromHygraph: QuizModelType
   selectedAnswerIds: string[]
}

export const attemptQuiz = createAsyncThunk(
   "talentGuide/attemptQuiz",
   async (payload: AttemptQuizPayload, { getState }) => {
      const state = getState() as RootState
      const { userAuthUid, moduleData } = state.talentGuide
      const { quizFromHygraph, selectedAnswerIds } = payload

      const passed = await talentGuideProgressService.attemptQuiz(
         moduleData.content.id,
         userAuthUid,
         quizFromHygraph,
         selectedAnswerIds
      )

      return {
         passed,
         quizId: quizFromHygraph.id,
      }
   }
)

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
         moduleData
      )

      return {
         moduleData,
         userAuthUid,
      }
   }
)

export const restartModule = createAsyncThunk(
   "talentGuide/restartModule",
   async (_, { getState }) => {
      const state = getState() as RootState
      const { moduleData, userAuthUid } = state.talentGuide

      if (!moduleData?.content || !userAuthUid) {
         throw new Error(
            "Cannot restart module: moduleData or userAuthUid is missing"
         )
      }

      await talentGuideProgressService.restartModule(
         moduleData.content.id,
         userAuthUid,
         moduleData
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
      toggleQuizAnswer: (
         state,
         action: PayloadAction<{ quizId: string; answerId: string }>
      ) => {
         const { quizId, answerId } = action.payload
         const quizStatus = state.quizStatuses[quizId]
         if (!quizStatus) return

         if (quizStatus.selectedAnswerIds.includes(answerId)) {
            // Single choice implementation
            state.quizStatuses[quizId].selectedAnswerIds = []

            // Multiple choice implementation in case we want to support it later
            // state.quizStatuses[quizId].selectedAnswerIds = quizStatus.selectedAnswerIds.filter((id) => id !== answerId)
            // quizStatus.selectedAnswerIds.filter((id) => id !== answerId)
         } else {
            // Single choice implementation
            state.quizStatuses[quizId].selectedAnswerIds = [answerId]

            // Multiple choice implementation in case we want to support it later
            // state.quizStatuses[quizId].selectedAnswerIds = removeDuplicates([
            //    ...quizStatus.selectedAnswerIds,
            //    answerId,
            // ])
         }
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(proceedToNextStep.pending, (state) => {
            state.isLoadingNextStep = true
         })
         .addCase(proceedToNextStep.fulfilled, (state, action) => {
            if (!action.payload) {
               // If there is no next step, we've completed the module
               state.showEndOfModuleExperience = true
               dataLayerLevelEvent(
                  AnalyticsEvents.LevelsComplete,
                  state.moduleData
               )
            } else {
               const { nextStepIndex } = action.payload
               state.currentStepIndex = nextStepIndex
               if (!state.visibleSteps.includes(nextStepIndex)) {
                  state.visibleSteps.push(nextStepIndex)
               }
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

            const { completedStepIds, moduleData, userAuthUid, quizzes } =
               action.payload

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
            state.showEndOfModuleExperience = false

            state.quizStatuses = moduleData.content.moduleSteps.reduce(
               (acc, step) => {
                  if (step.content.__typename === "Quiz") {
                     const quizId = step.content.id
                     acc[quizId] = {
                        state:
                           quizzes[quizId]?.state || QUIZ_STATE.NOT_ATTEMPTED,
                        selectedAnswerIds:
                           quizzes[quizId]?.selectedAnswerIds || [],
                     }
                  }
                  return acc
               },
               {} as Record<string, QuizStatus>
            )
            dataLayerLevelEvent(AnalyticsEvents.LevelsStart, moduleData)
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
         .addCase(attemptQuiz.pending, (state) => {
            state.isLoadingAttemptQuiz = true
         })
         .addCase(attemptQuiz.fulfilled, (state, action) => {
            state.isLoadingAttemptQuiz = false
            if (!action.payload) return

            const { quizId, passed } = action.payload

            state.quizStatuses[quizId].state = passed
               ? QUIZ_STATE.PASSED
               : QUIZ_STATE.FAILED
         })
         .addCase(attemptQuiz.rejected, (state, action) => {
            state.isLoadingAttemptQuiz = false
            const errorMessage =
               action.error.message || "Failed to attempt quiz"
            state.isLoadingAttemptQuizError = errorMessage

            errorLogAndNotify(new Error(errorMessage), {
               context: "attemptQuiz",
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
            state.showEndOfModuleExperience = false
            state.quizStatuses = Object.keys(state.quizStatuses).reduce(
               (acc, quizId) => {
                  acc[quizId] = {
                     selectedAnswerIds: [],
                     state: QUIZ_STATE.NOT_ATTEMPTED,
                  }
                  return acc
               },
               {} as Record<string, QuizStatus>
            )
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
         .addCase(restartModule.pending, (state) => {
            state.isRestartingModule = true
         })
         .addCase(restartModule.fulfilled, (state, action) => {
            if (!action.payload) {
               state.isRestartingModule = false
               return
            }

            // Reset to initial state but keep moduleData
            state.visibleSteps = [0]
            state.currentStepIndex = 0
            state.isRestartingModule = false
            state.showEndOfModuleExperience = false
            state.quizStatuses = Object.keys(state.quizStatuses).reduce(
               (acc, quizId) => {
                  acc[quizId] = {
                     selectedAnswerIds: [],
                     state: QUIZ_STATE.NOT_ATTEMPTED,
                  }
                  return acc
               },
               {} as Record<string, QuizStatus>
            )
            dataLayerLevelEvent(AnalyticsEvents.LevelsStart, state.moduleData)
         })
         .addCase(restartModule.rejected, (state, action) => {
            state.isRestartingModule = false
            const errorMessage =
               action.error.message || "Failed to restart module"
            state.isRestartingModuleError = errorMessage

            errorLogAndNotify(new Error(errorMessage), {
               context: "restartModule",
               userAuthUid: state.userAuthUid,
               originalError: action.error,
            })
         })
   },
})

export const { resetTalentGuide, toggleQuizAnswer } = talentGuideReducer.actions

export default talentGuideReducer.reducer
