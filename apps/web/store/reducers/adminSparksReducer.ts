import {
   AddCreatorData,
   UpdateCreatorData,
} from "@careerfairy/shared-lib/groups/creators"
import {
   AddSparkSparkData,
   UpdateSparkData,
} from "@careerfairy/shared-lib/sparks/sparks"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

type AvatarFile = {
   avatarFile: File
}

// Type alias for Creator | AddCreatorData
export type CreatorOrNew =
   | {
        type: "create"
        initialData: AddCreatorData & AvatarFile
     }
   | {
        type: "update"
        initialData: UpdateCreatorData & AvatarFile
     }

// Type alias for Spark | Create<Spark>
export type SparkOrNew =
   | {
        type: "create"
        initialData: AddSparkSparkData
     }
   | {
        type: "update"
        initialData: UpdateSparkData
     }

interface ISparksState {
   sparkDialogOpen: boolean
   sparksForm: {
      selectedCreatorId: string | null
      selectedSparkId: string | null
   }
}

type OpenDialogPayload = {
   selectedCreatorId: string
   selectedSparkId: string
} | null

const initialState: ISparksState = {
   sparkDialogOpen: false,
   sparksForm: {
      selectedCreatorId: null,
      selectedSparkId: null,
   },
}

export const adminSparksSlice = createSlice({
   name: "Admin Sparks",
   initialState,
   reducers: {
      openSparkDialog: (
         state,
         action: PayloadAction<OpenDialogPayload> = null
      ) => {
         state.sparkDialogOpen = true

         if (action.payload) {
            state.sparksForm.selectedCreatorId =
               action.payload.selectedCreatorId
            state.sparksForm.selectedSparkId = action.payload.selectedSparkId
         }
      },
      closeSparkDialog: (state) => {
         state.sparkDialogOpen = false
         state.sparksForm.selectedCreatorId = null
         state.sparksForm.selectedSparkId = null
      },
      // Actions for setting values on the form
      setCreator: (
         state,
         action: PayloadAction<ISparksState["sparksForm"]["selectedCreatorId"]>
      ) => {
         state.sparksForm.selectedCreatorId =
            action.payload || initialState.sparksForm.selectedCreatorId
      },
      setSpark: (
         state,
         action: PayloadAction<ISparksState["sparksForm"]["selectedSparkId"]>
      ) => {
         state.sparksForm.selectedSparkId =
            action.payload || initialState.sparksForm.selectedSparkId
      },
   },
})

// Export actions
export const { openSparkDialog, closeSparkDialog, setCreator, setSpark } =
   adminSparksSlice.actions

// Export reducer
export default adminSparksSlice.reducer
