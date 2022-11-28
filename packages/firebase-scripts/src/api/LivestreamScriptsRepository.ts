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
import {
   DocRef,
   mapFirestoreDocuments,
} from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

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

   getAllLivestreamUsers(
      eventId: string
   ): Promise<(UserLivestreamData & DocRef)[]>

   getAllLivestreams(withTest?: boolean): Promise<LivestreamEvent[]>
}

export class LivestreamScriptsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamScriptsRepository
{
   /*
    * Legacy Query for migration script only
    * */
   async getAllRegisteredStudents<T extends boolean>(
      withRef?: T
   ): Promise<RegisteredStudent[]> {
      const snaps = await this.firestore
         .collectionGroup("registeredStudents")
         .get()
      return mapFirestoreDocuments<RegisteredStudent, T>(snaps, withRef)
   }

   /*
    * Legacy Query for migration script only
    * */
   async getAllParticipatingStudents<T extends boolean>(
      withRef?: T
   ): Promise<ParticipatingStudent[]> {
      const snaps = await this.firestore
         .collectionGroup("participatingStudents")
         .get()

      return mapFirestoreDocuments<ParticipatingStudent, T>(snaps, withRef)
   }

   /*
    * Legacy Query for migration script only
    * */
   async getAllTalentPoolStudents<T extends boolean>(
      withRef?: T
   ): Promise<TalentPoolStudent[]> {
      const snaps = await this.firestore.collectionGroup("talentPool").get()
      return mapFirestoreDocuments<TalentPoolStudent, T>(snaps, withRef)
   }

   /*
    * Legacy Query for migration script only
    * */
   async getAllUserLivestreamData<T extends boolean>(
      withRef?: T
   ): Promise<UserLivestreamData[]> {
      const snaps = await this.firestore
         .collectionGroup("userLivestreamData")
         .get()
      return mapFirestoreDocuments<UserLivestreamData, T>(snaps, withRef)
   }

   async getAllLivestreamUsersByType<T extends boolean>(
      userType: LivestreamUserAction,
      withRef?: T
   ): Promise<UserLivestreamData[]> {
      const snaps = await this.firestore
         .collectionGroup("userLivestreamData")
         .where(`${userType}.date`, "!=", null)
         .orderBy(`${userType}.date`, "asc")
         .get()
      return mapFirestoreDocuments<UserLivestreamData, T>(snaps, withRef)
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

   async getAllLivestreamUsers(
      eventId: string
   ): Promise<(UserLivestreamData & DocRef)[]> {
      const snaps = await this.firestore
         .collection("livestreams")
         .doc(eventId)
         .collection("userLivestreamData")
         .get()
      return mapFirestoreDocuments<UserLivestreamData, true>(snaps, true)
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
