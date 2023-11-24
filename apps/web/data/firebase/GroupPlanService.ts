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
         "startPlan"
      )(data)
   }
}

export const groupPlanService = new GroupPlanService(FunctionsInstance as any)

export default GroupPlanService
