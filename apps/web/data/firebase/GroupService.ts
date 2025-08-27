import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import {
   GroupClientEventsPayload,
   GroupEventClient,
} from "@careerfairy/shared-lib/groups/telemetry"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class GroupService {
   constructor(private readonly functions: Functions) {}

   /**
    * Calls the trackGroupEvents cloud function with the provided data.
    * @param data - The data to send to the cloud function.
    */
   async trackGroupEvents(data: GroupEventClient[]) {
      return httpsCallable<GroupClientEventsPayload, void>(
         this.functions,
         "trackGroupEvents"
      )({
         events: data,
      })
   }

   // Update a creator's roles in a specific host group (server-side authorized)
   updateCreatorRolesForLivestream = async (args: {
      livestreamId: string
      targetGroupId: string
      creatorId: string
      roles: string[]
   }) => {
      return httpsCallable(
         this.functions,
         FUNCTION_NAMES.updateCreatorRoles
      )(args)
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupService = new GroupService(FunctionsInstance as any)

export default GroupService
