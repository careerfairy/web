import {
   DocRef,
   mapFirestoreDocuments,
} from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import {
   EventRating,
   EventRatingAnswer,
   LiveStreamEventWithUsersLivestreamData,
   LivestreamEvent,
   LivestreamRecordingDetails,
   LivestreamUserAction,
   RecordingStatsUser,
   UserLivestreamData,
} from "@careerfairy/shared-lib/dist/livestreams"
import {
   FirebaseLivestreamRepository,
   ILivestreamRepository,
} from "@careerfairy/shared-lib/dist/livestreams/LivestreamRepository"
import { LiveStreamStats } from "@careerfairy/shared-lib/dist/livestreams/stats"
import {
   ParticipatingStudent,
   RegisteredStudent,
   TalentPoolStudent,
} from "@careerfairy/shared-lib/dist/users"
import { DataWithRef } from "../util/types"

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

   getAllUserLivestreamData<T extends boolean>(
      withRef: T
   ): Promise<DataWithRef<T, UserLivestreamData>[]>

   getAllLivestreamUsersByType(
      userType: LivestreamUserAction,
      withRef?: boolean
   ): Promise<UserLivestreamData[]>

   getAllLivestreamUsers(
      eventId: string
   ): Promise<(UserLivestreamData & DocRef)[]>

   getAllLivestreams<T extends boolean>(
      withTest?: boolean,
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]>

   getAllDraftLivestreams<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]>

   getAllLivestreamsWithCompanySize<T extends boolean>(
      companySize: string,
      withTest?: boolean,
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]>

   getAllFutureLivestreams<T extends boolean>(
      withTest?: boolean,
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]>

   getAllLivestreamsWithUserLivestreamDataAfterRelease<T extends boolean>(
      withTest?: boolean,
      withRef?: T
   ): Promise<DataWithRef<T, LiveStreamEventWithUsersLivestreamData>[]>

   getAllRatings(): Promise<DataWithRef<true, EventRating>[]>

   getAllVotes(): Promise<DataWithRef<true, EventRatingAnswer>[]>

   getAllLivestreamStats<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, LiveStreamStats>[]>

   getAllLivestreamRecordingStats(): Promise<LivestreamRecordingDetails[]>

   getAllLivestreamUserRecordingStats(): Promise<RecordingStatsUser[]>

   getAllLivestreamsWithJobs<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]>
}

export class LivestreamScriptsRepository
   extends FirebaseLivestreamRepository
   implements ILivestreamScriptsRepository
{
   async getAllLivestreamRecordingStats(): Promise<
      DataWithRef<true, LivestreamRecordingDetails>[]
   > {
      const docs = await this.firestore.collectionGroup("recordingStats").get()

      return mapFirestoreDocuments<LivestreamRecordingDetails, true>(docs, true)
   }

   async getAllLivestreamUserRecordingStats(): Promise<
      DataWithRef<true, RecordingStatsUser>[]
   > {
      const docs = await this.firestore
         .collectionGroup("recordingStatsUser")
         .where("documentType", "==", "recordingStatsUser")
         .get()

      return mapFirestoreDocuments<RecordingStatsUser, true>(docs, true)
   }

   async getAllRatings(): Promise<DataWithRef<true, EventRating>[]> {
      const docs = await this.firestore.collectionGroup("rating").get()

      return mapFirestoreDocuments<EventRating, true>(docs, true)
   }

   async getAllVotes(): Promise<DataWithRef<true, EventRatingAnswer>[]> {
      const docs = await this.firestore.collectionGroup("voters").get()

      return mapFirestoreDocuments<EventRatingAnswer, true>(docs, true)
   }

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

   async getAllUserLivestreamData<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, UserLivestreamData>[]> {
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

   async getAllLivestreams<T extends boolean>(
      withTest = false,
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]> {
      let snaps
      if (withTest) {
         snaps = await this.firestore.collection("livestreams").get()
      } else {
         snaps = await this.firestore
            .collection("livestreams")
            .where("test", "==", false)
            .get()
      }
      return mapFirestoreDocuments<LivestreamEvent, T>(snaps, withRef)
   }

   async getAllDraftLivestreams<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]> {
      const snaps = await this.firestore.collection("draftLivestreams").get()
      return mapFirestoreDocuments<LivestreamEvent, T>(snaps, withRef)
   }

   async getAllLivestreamsWithCompanySize<T extends boolean>(
      companySize: string,
      withTest = false,
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]> {
      let snaps
      if (withTest) {
         snaps = await this.firestore.collection("livestreams").get()
      } else {
         snaps = await this.firestore
            .collection("livestreams")
            .where("companySizes", "array-contains-any", [companySize])
            .get()
      }
      return mapFirestoreDocuments<LivestreamEvent, T>(snaps, withRef)
   }

   async getAllFutureLivestreams<T extends boolean>(
      withTest = false,
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]> {
      const ref = this.firestore
         .collection("livestreams")
         .where("start", ">=", new Date())

      if (withTest) {
         const snaps = await ref.get()
         return mapFirestoreDocuments<LivestreamEvent, T>(snaps, withRef)
      } else {
         const snaps = await ref.where("test", "==", false).get()
         return mapFirestoreDocuments<LivestreamEvent, T>(snaps, withRef)
      }
   }

   async getAllLivestreamsWithUserLivestreamDataAfterRelease<T extends boolean>(
      withTest = false,
      withRef?: T
   ): Promise<DataWithRef<T, LiveStreamEventWithUsersLivestreamData>[]> {
      let query = this.firestore
         .collection("livestreams")
         .where("start", ">=", new Date(2023, 0, 31))

      if (!withTest) {
         query = query.where("test", "==", false)
      }

      const snaps = await query.orderBy("start", "asc").get()

      const streams = mapFirestoreDocuments<LivestreamEvent, T>(snaps, withRef)

      const formattedStreams = []
      for (const stream of streams) {
         const collection = await this.firestore
            .collection("livestreams")
            .doc(stream.id)
            .collection("userLivestreamData")
            .get()

         const usersLivestreamData = collection.docs?.map((doc) => doc.data())

         formattedStreams.push({ ...stream, usersLivestreamData })
      }

      return formattedStreams
   }

   async getAllLivestreamStats(): Promise<
      DataWithRef<true, LiveStreamStats>[]
   > {
      const snaps = await this.firestore
         .collectionGroup("stats")
         .where("id", "==", "livestreamStats")
         .get()
      return mapFirestoreDocuments<LiveStreamStats, true>(snaps, true)
   }

   async getAllLivestreamsWithJobs<T extends boolean>(
      withRef?: T
   ): Promise<DataWithRef<T, LivestreamEvent>[]> {
      const snaps = await this.firestore
         .collection("livestreams")
         .where("hasJobs", "==", true)
         .get()

      return mapFirestoreDocuments<LivestreamEvent, T>(snaps, withRef)
   }
}
