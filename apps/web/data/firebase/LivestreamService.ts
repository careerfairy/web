import {
   CategoryDataOption as LivestreamCategoryDataOption,
   FilterLivestreamsOptions,
   LivestreamEvent,
   LivestreamQueryOptions,
} from "@careerfairy/shared-lib/livestreams"
import { Functions, httpsCallable } from "firebase/functions"
import { mapFromServerSide } from "util/serverUtil"
import { FirestoreInstance, FunctionsInstance } from "./FirebaseInstance"
import {
   AgoraTokenRequest,
   AgoraTokenResponse,
} from "@careerfairy/shared-lib/agora/token"
import {
   Query,
   collection,
   getDocs,
   limit,
   query,
   where,
} from "firebase/firestore"
import FirebaseService from "./FirebaseService"
import GroupsUtil from "data/util/GroupsUtil"
import { groupRepo } from "data/RepositoryInstances"
import { checkIfUserHasAnsweredAllLivestreamGroupQuestions } from "components/views/common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import { errorLogAndNotify } from "util/CommonUtil"

export class LivestreamService {
   constructor(private readonly functions: Functions) {}

   /**
    * Fetches livestreams with the given query options
    * @param data  The query options
    * */
   async fetchLivestreams(
      data: LivestreamQueryOptions & FilterLivestreamsOptions
   ) {
      const { data: serializedLivestreams } = await httpsCallable<
         typeof data,
         {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [field: string]: any
         }[]
      >(
         this.functions,
         "fetchLivestreams_v2"
      )(data)

      return mapFromServerSide(serializedLivestreams)
   }

   /**
    * Retrieves all the registered users for a given livestream ID
    * @param livestreamId Document ID of the LivestreamEvent
    * @returns List of user emails who have registered to the Livestream in @param livestreamId
    */
   async fetchLivestreamRegisteredUsers(livestreamId: string) {
      const baseQuery: Query = query(
         collection(FirestoreInstance, "livestreams"),
         where("id", "==", livestreamId),
         limit(1)
      )

      const snapshot = await getDocs(baseQuery)
      if (!snapshot.docs.length) return []

      return (snapshot.docs.at(0).data() as unknown as LivestreamEvent)
         .registeredUsers
   }

   /**
    * Validates category data for a livestream, determing if a certain user as answeared and perfomed all steps
    * for a livestream registration. Current logic is a migration of the validation done in the old streaming application.
    * @param firebase Firebase service
    * @param options Category validation data (livestream, userData and breakoutroomId)
    * @returns true if user has all questions answeared, false otherwise
    */
   async checkCategoryData(
      firebase: FirebaseService,
      options: LivestreamCategoryDataOption
   ) {
      const {
         livestream: currentLivestream,
         userData: userData,
         breakoutRoomId: breakoutRoomId,
      } = options

      try {
         if (
            userData &&
            !currentLivestream?.test &&
            currentLivestream?.groupQuestionsMap &&
            !breakoutRoomId
         ) {
            const livestreamGroups = await firebase.getGroupsWithIds(
               currentLivestream.groupIds
            )

            const [{ hasAgreedToAll }, answeredLivestreamGroupQuestions] =
               await Promise.all([
                  GroupsUtil.getPolicyStatus(
                     livestreamGroups,
                     userData.userEmail,
                     firebase.checkIfUserAgreedToGroupPolicy
                  ),
                  groupRepo.mapUserAnswersToLivestreamGroupQuestions(
                     userData,
                     currentLivestream
                  ),
               ])

            /*
             * Here we check if the user has answered all the questions for the livestream
             * by looking at the user's answers and the livestreams questions in userData/userGroups
             * */
            const hasAnsweredAllQuestions =
               checkIfUserHasAnsweredAllLivestreamGroupQuestions(
                  answeredLivestreamGroupQuestions
               )

            // The user might have answered all the questions but not registered to the event,
            // so we check if the user has registered to the event
            const hasRegisteredToEvent =
               currentLivestream?.registeredUsers?.includes?.(
                  userData.userEmail
               )

            if (
               !hasAnsweredAllQuestions || // if the user has not answered all the event questions
               !hasRegisteredToEvent || // if the user has not registered to the event
               !hasAgreedToAll // if the user has not agreed to all the policies
            ) {
               // we show the registration modal
               return false
            }
            return true
         }
         return false
      } catch (e) {
         errorLogAndNotify(e)
         return false
      }
   }
   /**
    * Fetches an Agora RTC token with the given data
    * @param data The data required to fetch the RTC token
    * @returns A promise containing the Agora RTC token
    */
   async fetchAgoraRtcToken(data: AgoraTokenRequest) {
      const fetchAgoraRtcToken = httpsCallable<
         AgoraTokenRequest,
         AgoraTokenResponse
      >(this.functions, "fetchAgoraRtcToken_v2")

      const {
         data: { token },
      } = await fetchAgoraRtcToken(data)

      return token.rtcToken
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livestreamService = new LivestreamService(FunctionsInstance as any)

export default LivestreamService
