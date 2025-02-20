import {
   GroupClientEventsPayload,
   GroupEventClient,
} from "@careerfairy/shared-lib/groups/telemetry"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class GroupService {
   constructor(private readonly functions: Functions) {}

   /**
    * Calls the trackSparkEvents cloud function with the provided data.
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupService = new GroupService(FunctionsInstance as any)

export default GroupService
