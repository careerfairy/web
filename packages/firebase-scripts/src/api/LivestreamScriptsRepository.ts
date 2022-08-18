import {
   FirebaseLivestreamRepository,
   ILivestreamRepository,
} from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import {
   ParticipatingStudent,
   RegisteredStudent,
   TalentPoolStudent,
} from "@careerfairy/shared-lib/dist/users"
import {
   LivestreamEvent,
   LivestreamUserAction,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import { mapFirestoreDocuments } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

export interface ILivestreamScriptsRepository extends ILivestreamRepository {
   getAllRegisteredStudents(withRef?: boolean): Promise<RegisteredStudent[]>

   getAllParticipatingStudents(
      withRef?: boolean
   ): Promise<ParticipatingStudent[]>

   getAllTalentPoolStudents(withRef?: boolean): Promise<TalentPoolStudent[]>

   getLivestreamUsers(
      eventId: string,
      userType: LivestreamUserAction
   ): Promise<UserLivestreamData[]>

   getAllUserLivestreamData(withRef: boolean): Promise<UserLivestreamData[]>

   getAllLivestreamUsersByType(
      userType: LivestreamUserAction,
      withRef?: boolean
   ): Promise<UserLivestreamData[]>

   getAllLivestreams(withTest?: boolean): Promise<LivestreamEvent[]>
}

export class LivestreamScriptsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamScriptsRepository
{
   /*
    * Legacy Query for migration script only
    * */
   async getAllRegisteredStudents(
      withRef?: boolean
   ): Promise<RegisteredStudent[]> {
      const snaps = await this.firestore
         .collectionGroup("registeredStudents")
         .get()
      return mapFirestoreDocuments<RegisteredStudent>(snaps, withRef)
   }

   /*
    * Legacy Query for migration script only
    * */
   async getAllParticipatingStudents(
      withRef?: boolean
   ): Promise<ParticipatingStudent[]> {
      const snaps = await this.firestore
         .collectionGroup("participatingStudents")
         .get()

      return mapFirestoreDocuments<ParticipatingStudent>(snaps, withRef)
   }

   /*
    * Legacy Query for migration script only
    * */
   async getAllTalentPoolStudents(
      withRef?: boolean
   ): Promise<TalentPoolStudent[]> {
      const snaps = await this.firestore.collectionGroup("talentPool").get()
      return mapFirestoreDocuments<TalentPoolStudent>(snaps, withRef)
   }

   /*
    * Legacy Query for migration script only
    * */
   async getAllUserLivestreamData(
      withRef?: boolean
   ): Promise<UserLivestreamData[]> {
      const snaps = await this.firestore
         .collectionGroup("userLivestreamData")
         .get()
      return mapFirestoreDocuments<UserLivestreamData>(snaps, withRef)
   }

   async getAllLivestreamUsersByType(
      userType: LivestreamUserAction,
      withRef?: boolean
   ): Promise<UserLivestreamData[]> {
      const snaps = await this.firestore
         .collectionGroup("userLivestreamData")
         .where(`${userType}.date`, "!=", null)
         .orderBy(`${userType}.date`, "asc")
         .get()
      return mapFirestoreDocuments<UserLivestreamData>(snaps, withRef)
   }

   async getLivestreamUsers(
      eventId: string,
      userType: LivestreamUserAction
   ): Promise<UserLivestreamData[]> {
      const snaps = await this.firestore
         .collection("livestreams")
         .doc(eventId)
         .collection("userLivestreamData")
         .where(`${userType}.date`, "!=", null)
         .get()
      return mapFirestoreDocuments<UserLivestreamData>(snaps)
   }

   async getAllLivestreams(
      withTest: boolean = false
   ): Promise<LivestreamEvent[]> {
      let snaps
      if (withTest) {
         snaps = await this.firestore.collection("livestreams").get()
      } else {
         snaps = await this.firestore
            .collection("livestreams")
            .where("test", "==", false)
            .get()
      }
      return mapFirestoreDocuments<LivestreamEvent>(snaps)
   }
}
