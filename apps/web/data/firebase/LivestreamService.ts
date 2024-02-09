import {
   CategoryDataOption as LivestreamCategoryDataOption,
   FilterLivestreamsOptions,
   LivestreamQueryOptions,
   LivestreamMode,
   LivestreamEvent,
   LivestreamModes,
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
   UpdateData,
   collection,
   collectionGroup,
   doc,
   documentId,
   getDocs,
   limit,
   query,
   updateDoc,
   where,
} from "firebase/firestore"
import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { UserData } from "@careerfairy/shared-lib/users"
import { STREAM_IDENTIFIERS, StreamIdentifier } from "constants/streaming"

type StreamerDetails = {
   firstName: string
   lastName: string
   role: string
   avatarUrl: string
   linkedInUrl: string
}

/**
 * Defines the options for setting a livestream's mode.
 * Depending on the mode, additional properties may be required:
 * - "default": No additional properties.
 * - "desktop": Requires `screenSharerId` to identify the screen sharer.
 * - "video": Requires `youtubeVideoURL` for the video to be shared.
 * - "presentation": Requires `pdfURL` for the PDF to be presented.
 */
export type SetModeOptionsType<Mode extends LivestreamMode> =
   Mode extends "default"
      ? { mode: "default" }
      : Mode extends "desktop"
      ? { mode: "desktop"; screenSharerId: string }
      : Mode extends "video"
      ? { mode: "video"; youtubeVideoURL: string }
      : Mode extends "presentation"
      ? { mode: "presentation"; pdfURL: string }
      : never

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
      const [tag, identifier] = uid.split("-") as [StreamIdentifier, string]

      if (tag === STREAM_IDENTIFIERS.RECORDING) {
         return {
            firstName: "Recording",
            lastName: "Bot",
            role: "Recording",
            avatarUrl: "",
            linkedInUrl: "",
         }
      }

      if (tag === STREAM_IDENTIFIERS.CREATOR) {
         const creatorQuery = query(
            collectionGroup(FirestoreInstance, "creators"),
            where(documentId(), "==", identifier),
            limit(1)
         ).withConverter(createGenericConverter<Creator>())

         const snapshot = await getDocs(creatorQuery)

         if (!snapshot.empty) {
            const data = snapshot.docs[0].data()

            return {
               firstName: data.firstName,
               lastName: data.lastName,
               role: data.position,
               avatarUrl: data.avatarUrl,
               linkedInUrl: data.linkedInUrl,
            }
         }
      }

      if (tag === STREAM_IDENTIFIERS.USER) {
         const userQuery = query(
            collection(FirestoreInstance, "userData"),
            where("authId", "==", identifier),
            limit(1)
         ).withConverter(createGenericConverter<UserData>())

         const snapshot = await getDocs(userQuery)

         if (!snapshot.empty) {
            const data = snapshot.docs[0].data()

            return {
               firstName: data.firstName,
               lastName: data.lastName,
               // Use their position from the B2B Profile if available, otherwise use their field of study
               role: data.position || data.fieldOfStudy.name || "",
               avatarUrl: data.avatar,
               linkedInUrl: data.linkedinUrl,
            }
         }
      }

      return {
         firstName: "Anonymous",
         lastName: "User",
         role: "",
         avatarUrl: "",
         linkedInUrl: "",
      }
   }

   private getLivestreamRef(livestreamId: string) {
      return doc(FirestoreInstance, "livestreams", livestreamId).withConverter(
         createGenericConverter<LivestreamEvent>()
      )
   }

   private updateLivestream(
      livestreamId: string,
      data: UpdateData<LivestreamEvent>
   ) {
      return updateDoc(this.getLivestreamRef(livestreamId), data)
   }

   /**
    * Sets the mode of a livestream to the provided mode (default, desktop, video, pdf)
    * If the mode is 'desktop', the agoraUid is required to identify the screen sharer.
    * Updates the livestream document with the new mode and, if applicable, the screenSharerId.
    *
    * @param params - The parameters required to start or stop sharing, including livestream ID, mode, and Agora UID.
    * @returns A promise resolved with the update operation result.
    */
   async setLivestreamMode<Mode extends LivestreamMode>(
      livestreamId: string,
      options: SetModeOptionsType<Mode>
   ) {
      switch (options.mode) {
         case LivestreamModes.DESKTOP:
            if (!options.screenSharerId) {
               throw new Error(
                  "Agora UID is required to start sharing the screen"
               )
            }
            return this.updateLivestream(livestreamId, {
               mode: options.mode,
               screenSharerId: options.screenSharerId,
            })

         case LivestreamModes.PRESENTATION:
            if (!options.pdfURL) {
               throw new Error("PDF URL is required to start a presentation")
            }
            /**
             * TODO:
             * Batch operations (both must succeed or fail)
             * 1. Set mode to presentation on livestreams/{id}
             * 2. Save the PDF url at /livestreams/{id}/presentations/presentation. Look at old implementation for reference
             */
            return

         case LivestreamModes.VIDEO:
            if (!options.youtubeVideoURL) {
               throw new Error("YouTube video URL is required to start a video")
            }
            /**
             * TODO:
             * Batch operations (both must succeed or fail)
             * 1. Set mode to video on livestreams/{id}
             * 2. Save the video URL at /livestreams/{id}/videos/video. Look at old implementation for reference
             */
            return

         case LivestreamModes.DEFAULT:
            return this.updateLivestream(livestreamId, {
               mode: options.mode,
               screenSharerId: "",
            })

         default:
            throw new Error("Invalid mode provided")
      }
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livestreamService = new LivestreamService(FunctionsInstance as any)

export default LivestreamService
