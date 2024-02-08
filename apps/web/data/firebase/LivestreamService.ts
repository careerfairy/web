import {
   CategoryDataOption as LivestreamCategoryDataOption,
   FilterLivestreamsOptions,
   LivestreamQueryOptions,
} from "@careerfairy/shared-lib/livestreams"
import { Functions, httpsCallable } from "firebase/functions"
import { mapFromServerSide } from "util/serverUtil"
import { FirestoreInstance, FunctionsInstance } from "./FirebaseInstance"
import {
   AgoraTokenRequest,
   AgoraTokenResponse,
} from "@careerfairy/shared-lib/agora/token"
import FirebaseService from "./FirebaseService"
import GroupsUtil from "data/util/GroupsUtil"
import { groupRepo } from "data/RepositoryInstances"
import { checkIfUserHasAnsweredAllLivestreamGroupQuestions } from "components/views/common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import { errorLogAndNotify } from "util/CommonUtil"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import {
   collection,
   collectionGroup,
   getDocs,
   limit,
   query,
   where,
} from "firebase/firestore"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"

type StreamerDetails = {
   firstName: string
   lastName: string
   role: string
   avatarUrl: string
   linkedInUrl: string
}

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
    * Validates category data for a livestream, determining if a certain user as answered and performed all steps
    * for a livestream registration and accepted all policies if any. Current logic is a migration of the validation done in the old streaming application.
    * @param firebase Firebase service
    * @param options Category validation data (livestream and userData)
    * @returns true if user has all questions answered and policies accepted, false otherwise
    */
   async checkCategoryData(
      firebase: FirebaseService,
      options: LivestreamCategoryDataOption
   ) {
      const { livestream: currentLivestream, userData: userData } = options

      if (currentLivestream.test) return true
      try {
         if (
            userData &&
            !currentLivestream?.test &&
            currentLivestream?.groupQuestionsMap
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

   async getStreamerDetails(uid: string): Promise<StreamerDetails> {
      const [tag, identifier] = uid.split("-")

      let details: StreamerDetails = {
         firstName: "",
         lastName: "",
         role: "",
         avatarUrl: "",
         linkedInUrl: "",
      }

      if (tag === "recording") {
         details = {
            firstName: "Recording",
            lastName: "Bot",
            role: "Recording",
            avatarUrl: "",
            linkedInUrl: "",
         }
      }

      if (tag === "creator") {
         const creatorQuery = query(
            collectionGroup(FirestoreInstance, "creators"),
            where("id", "==", identifier),
            limit(1)
         ).withConverter(createGenericConverter<Creator>())

         const snapshot = await getDocs(creatorQuery)

         if (!snapshot.empty) {
            const data = snapshot.docs[0].data()

            details = {
               firstName: data.firstName,
               lastName: data.lastName,
               role: data.position,
               avatarUrl: data.avatarUrl,
               linkedInUrl: data.linkedInUrl,
            }
         }
      }

      if (tag === "user") {
         const userQuery = query(
            collection(FirestoreInstance, "userData"),
            where("authId", "==", identifier),
            limit(1)
         ).withConverter(createGenericConverter<UserData>())

         const snapshot = await getDocs(userQuery)

         if (snapshot.empty) {
            return details
         }

         const data = snapshot.docs[0].data()

         details = {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.position || data.fieldOfStudy.name || "",
            avatarUrl: data.avatar,
            linkedInUrl: data.linkedinUrl,
         }
      }

      if (tag === "anon") {
         details = {
            firstName: "Anonymous",
            lastName: "User",
            role: "Anonymous",
            avatarUrl: "",
            linkedInUrl: "",
         }
      }

      return details
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livestreamService = new LivestreamService(FunctionsInstance as any)

export default LivestreamService
