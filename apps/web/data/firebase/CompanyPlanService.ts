import { StartPlanData } from "@careerfairy/shared-lib/groups/planConstants"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class CompanyPlanService {
   constructor(private readonly functions: Functions) {}

   /**
    * Starts a plan for a given company
    * @param data  The data to start the plan
    * */
   async startPlan(data: StartPlanData) {
      return httpsCallable<StartPlanData, void>(
         this.functions,
         "startPlan"
      )(data)
   }
}

export const companyPlanService = new CompanyPlanService(
   FunctionsInstance as any
)

export default CompanyPlanService
