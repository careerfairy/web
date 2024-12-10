import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Page, TalentGuideModule } from "data/hygraph/types"

type TalentGuideState = {
   visibleSteps: number[]
   currentStepIndex: number
   moduleData: Page<TalentGuideModule> | null
   isLoading: boolean
   error: string | null
}

const initialState: TalentGuideState = {
   visibleSteps: [0],
   currentStepIndex: 0,
   moduleData: null,
   isLoading: false,
   error: null,
}

const talentGuideReducer = createSlice({
   name: "talentGuide",
   initialState,
   reducers: {
      setModuleData: (
         state,
         action: PayloadAction<Page<TalentGuideModule>>
      ) => {
         state.moduleData = action.payload
      },
      proceedToNextStep: (state) => {
         if (!state.moduleData) return

         const nextStepIndex = state.currentStepIndex + 1
         if (nextStepIndex < state.moduleData.content.moduleSteps.length) {
            state.currentStepIndex = nextStepIndex
            if (!state.visibleSteps.includes(nextStepIndex)) {
               state.visibleSteps.push(nextStepIndex)
            }
         }
      },
      resetSteps: (state) => {
         state.visibleSteps = [0]
         state.currentStepIndex = 0
      },
      resetTalentGuide: () => initialState,
   },
})

export const {
   setModuleData,
   proceedToNextStep,
   resetSteps,
   resetTalentGuide,
} = talentGuideReducer.actions

export default talentGuideReducer.reducer
