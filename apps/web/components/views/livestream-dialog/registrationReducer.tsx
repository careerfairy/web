import { GroupWithPolicy } from "@careerfairy/shared-lib/src/groups"
import {
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
} from "@careerfairy/shared-lib/src/livestreams"

export type RegistrationState = {
   groupsWithPolicies?: GroupWithPolicy[]
   hasAgreedToAll?: boolean
   answers?: LivestreamGroupQuestionsMap

   // fetch all the livestream groups, their policies and the user policy
   // status for each group
   isLoadingRequiredData: boolean

   /**
    * Selected livestreams to register to during multi-selection flows (e.g., panels)
    */
   selectedLivestreams?: LivestreamEvent[]
}

export type RegistrationAction =
   | {
        type: "set-groups-with-policies"
        payload: {
           groupsWithPolicies: GroupWithPolicy[]
           hasAgreedToAll: boolean
        }
     }
   | { type: "set-user-existing-answers"; payload: LivestreamGroupQuestionsMap }
   | { type: "set-loading-finished" }
   | { type: "set-selected-livestreams"; payload: LivestreamEvent[] }
   | { type: "toggle-selected-livestream"; payload: LivestreamEvent }

export const registrationInitialState: RegistrationState = {
   isLoadingRequiredData: true,
   selectedLivestreams: [],
}

export function registrationReducer(
   state: RegistrationState,
   action: RegistrationAction
): RegistrationState {
   const newState = { ...state }

   switch (action.type) {
      case "set-groups-with-policies":
         newState.groupsWithPolicies = action.payload.groupsWithPolicies
         newState.hasAgreedToAll = action.payload.hasAgreedToAll
         break

      case "set-user-existing-answers":
         newState.answers = action.payload
         break

      case "set-loading-finished":
         newState.isLoadingRequiredData = false
         break

      case "set-selected-livestreams":
         newState.selectedLivestreams = action.payload
         break

      case "toggle-selected-livestream":
         newState.selectedLivestreams = (() => {
            const current = newState.selectedLivestreams ?? []
            const exists = current.some((ls) => ls.id === action.payload.id)
            return exists
               ? current.filter((ls) => ls.id !== action.payload.id)
               : [...current, action.payload]
         })()
         break
   }

   return newState
}
