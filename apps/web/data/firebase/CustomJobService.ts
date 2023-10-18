import { FunctionsInstance } from "./FirebaseInstance"
import firebase from "firebase/compat/app"
import HttpsCallableResult = firebase.functions.HttpsCallableResult

export class CustomJobService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   async applyToAJob(
      livestreamId: string,
      jobId: string,
      userId: string,
      groupId: string
   ): Promise<HttpsCallableResult> {
      return this.firebaseFunctions.httpsCallable("userApplyToCustomJob")({
         livestreamId,
         userId,
         jobId,
         groupId,
      })
   }
}

export const customJobServiceInstance = new CustomJobService(FunctionsInstance)

export default CustomJobService
