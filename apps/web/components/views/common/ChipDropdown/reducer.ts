export type ChipDropdownState = {
   isOpen: boolean
   isDirty: boolean
   selectedMap: Record<string, boolean>
}

export type ChipDropdownAction =
   | { type: "TOGGLE_OPEN" }
   | { type: "CLOSE_DROPDOWN" }
   | { type: "CLICK_OPTION"; payload: { optionId: string; showApply: boolean } }
   | { type: "APPLY_CHANGES"; payload: { closeOnApply: boolean } }
   | { type: "RESET_CHANGES" }
   | {
        type: "DELETE_OPTION"
        payload: { optionId: string; showApply: boolean }
     }
   | {
        type: "SYNC_EXTERNAL_SELECTION"
        payload: { selectedOptions?: string[] }
     }

export const initialStateFactory = (
   initialSelectedOptions?: string[]
): ChipDropdownState => ({
   isOpen: false,
   isDirty: false,
   selectedMap:
      initialSelectedOptions?.reduce((acc, option) => {
         acc[option] = true
         return acc
      }, {} as Record<string, boolean>) || {},
})

export const chipDropdownReducer = (
   state: ChipDropdownState,
   action: ChipDropdownAction
): ChipDropdownState => {
   switch (action.type) {
      case "TOGGLE_OPEN":
         return { ...state, isOpen: !state.isOpen }
      case "CLOSE_DROPDOWN":
         return { ...state, isOpen: false }
      case "CLICK_OPTION": {
         const newSelectedMap = {
            ...state.selectedMap,
            [action.payload.optionId]:
               !state.selectedMap[action.payload.optionId],
         }
         return {
            ...state,
            selectedMap: newSelectedMap,
            isDirty: true,
         }
      }
      case "APPLY_CHANGES":
         return {
            ...state,
            isDirty: false,
            isOpen: action.payload.closeOnApply ? false : state.isOpen,
         }
      case "RESET_CHANGES":
         return {
            ...state,
            selectedMap: {},
            isDirty: false,
         }
      case "DELETE_OPTION": {
         const newSelectedMap = {
            ...state.selectedMap,
            [action.payload.optionId]: false,
         }
         return {
            ...state,
            selectedMap: newSelectedMap,
            isDirty: true,
         }
      }
      case "SYNC_EXTERNAL_SELECTION":
         return {
            ...state,
            isDirty: false,
            selectedMap:
               action.payload.selectedOptions?.reduce((acc, optionId) => {
                  acc[optionId] = true
                  return acc
               }, {} as Record<string, boolean>) || {},
         }
      default:
         return state
   }
}
