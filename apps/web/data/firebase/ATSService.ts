import firebaseInstance from "./FirebaseInstance"
import firebase from "firebase"

export class ATSService {
   constructor(
      private readonly firebaseFunctions: firebase.functions.Functions
   ) {}

   linkCompanyWithATS(groupId: string) {
      return this.firebaseFunctions.httpsCallable("linkCompanyWithATS")({
         groupId,
      })
   }
}

export const atsServiceInstance = new ATSService(firebaseInstance.functions())

export default ATSService
