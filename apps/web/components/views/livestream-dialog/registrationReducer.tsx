import { GroupWithPolicy } from "@careerfairy/shared-lib/src/groups"
import { LivestreamGroupQuestionsMap } from "@careerfairy/shared-lib/src/livestreams"

export type RegistrationState = {
   groupsWithPolicies?: GroupWithPolicy[]
   hasAgreedToAll?: boolean
   answers?: LivestreamGroupQuestionsMap

   // fetch all the livestream groups, their policies and the user policy
   // status for each group
   isLoadingRequiredData: boolean
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

export const registrationInitialState: RegistrationState = {
   isLoadingRequiredData: true,
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
   }

   return newState
}
