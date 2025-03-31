import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class GroupPlanService {
   constructor(private readonly functions: Functions) {}

   /**
    * Starts a plan for a given group
    * @param data  The data to start the plan
    * */
   async startPlan(data: StartPlanData) {
      return httpsCallable<StartPlanData, void>(
         this.functions,
         FUNCTION_NAMES.startPlan
      )(data)
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupPlanService = new GroupPlanService(FunctionsInstance as any)

export default GroupPlanService
