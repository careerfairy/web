import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import {
   AgoraRTCTokenRequest,
   AgoraRTCTokenResponse,
   AgoraRTMTokenRequest,
   AgoraRTMTokenResponse,
} from "@careerfairy/shared-lib/agora/token"
import { FUNCTION_NAMES } from "@careerfairy/shared-lib/functions/functionNames"
import { GetRecommendedEventsFnArgs } from "@careerfairy/shared-lib/functions/types"
import {
   CreateLivestreamCTARequest,
   CreateLivestreamPollRequest,
   DeleteLivestreamCTARequest,
   DeleteLivestreamChatEntryRequest,
   DeleteLivestreamPollRequest,
   EmoteType,
   EventRatingAnswer,
   FeedbackQuestionUserAnswer,
   LivestreamCTA,
   LivestreamCTAUserInteraction,
   CategoryDataOption as LivestreamCategoryDataOption,
   LivestreamChatEntry,
   LivestreamEmote,
   LivestreamEvent,
   LivestreamMode,
   LivestreamModes,
   LivestreamPollVoter,
   LivestreamPresentation,
   LivestreamQuestion,
   LivestreamQuestionComment,
   LivestreamVideo,
   MarkLivestreamPollAsCurrentRequest,
   MarkLivestreamQuestionAsCurrentRequest,
   MarkLivestreamQuestionAsDoneRequest,
   ParticipantDetails,
   ResetLivestreamQuestionRequest,
   Speaker,
   ToggleActiveCTARequest,
   ToggleHandRaiseRequest,
   UpdateLivestreamCTARequest,
   UpdateLivestreamPollRequest,
   UpsertSpeakerRequest,
   UserLivestreamData,
   hasUpvotedLivestreamQuestion,
} from "@careerfairy/shared-lib/livestreams"
import { UPCOMING_STREAM_THRESHOLD_MILLISECONDS } from "@careerfairy/shared-lib/livestreams/constants"
import {
   HandRaise,
   HandRaiseState,
} from "@careerfairy/shared-lib/livestreams/hand-raise"
import { UserData, UserStats } from "@careerfairy/shared-lib/users"
import { getSecondsPassedFromYoutubeUrl } from "components/util/reactPlayer"
import { checkIfUserHasAnsweredAllLivestreamGroupQuestions } from "components/views/common/registration-modal/steps/LivestreamGroupQuestionForm/util"
import { STREAM_IDENTIFIERS, StreamIdentifier } from "constants/streaming"
import { groupRepo } from "data/RepositoryInstances"
import { START_DATE_FOR_REPORTED_EVENTS } from "data/constants/streamContants"
import GroupsUtil from "data/util/GroupsUtil"
import {
   DocumentReference,
   PartialWithFieldValue,
   Timestamp,
   UpdateData,
   arrayRemove,
   arrayUnion,
   collection,
   deleteDoc,
   doc,
   getDoc,
   getDocs,
   increment,
   limit,
   orderBy,
   query,
   runTransaction,
   setDoc,
   updateDoc,
   where,
   writeBatch,
} from "firebase/firestore"
import { Functions, httpsCallable } from "firebase/functions"
import { errorLogAndNotify } from "util/CommonUtil"
import CookiesUtil from "util/CookiesUtil"
import { FirestoreInstance, FunctionsInstance } from "./FirebaseInstance"
import FirebaseService from "./FirebaseService"

/**
 * Defines the options for setting a live stream's mode.
 * Depending on the mode, additional properties may be required:
 * - "default": No additional properties.
 * - "desktop": Requires `screenSharerAgoraUID` to identify the screen sharer.
 * - "video": Requires `youtubeVideoURL` for the video to be shared.
 * - "presentation": Requires `pdfURL` for the PDF to be presented.
 */
export type SetModeOptionsType<Mode extends LivestreamMode> =
   Mode extends "default"
      ? { mode: "default" }
      : Mode extends "desktop"
      ? { mode: "desktop"; screenSharerAgoraUID: string }
      : Mode extends "video"
      ? { mode: "video" }
      : Mode extends "presentation"
      ? { mode: "presentation" }
      : never

export class LivestreamService {
   constructor(private readonly functions: Functions) {}

   async getById(livestreamId: string) {
      const livestreamRef = this.getLivestreamRef(livestreamId)
      const livestream = await getDoc(livestreamRef)

      return livestream.data()
   }

   /**
    * Validates category data for a live stream, determining if a certain user as answered and performed all steps
    * for a live stream registration and accepted all policies if any. Current logic is a migration of the validation done in the old streaming application.
    * @param firebase Firebase service
    * @param options Category validation data (live stream and userData)
    * @returns true if user has all questions answered and policies accepted, false otherwise
    */
   async checkCategoryData(
      firebase: FirebaseService,
      options: LivestreamCategoryDataOption
   ) {
      const { livestream: currentLivestream, userData: userData } = options

      if (currentLivestream.test || currentLivestream.openStream) return true
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
             * Here we check if the user has answered all the questions for the live stream
             * by looking at the user's answers and the livestreams questions in userData/userGroups
             * */
            const hasAnsweredAllQuestions =
               checkIfUserHasAnsweredAllLivestreamGroupQuestions(
                  answeredLivestreamGroupQuestions
               )

            // The user might have answered all the questions but not registered to the event,
            // so we check if the user has registered to the event
            const hasRegisteredToEvent = await this.hasUserRegistered(
               currentLivestream.id,
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
   async fetchAgoraRtcToken(data: AgoraRTCTokenRequest) {
      const {
         data: { token },
      } = await httpsCallable<AgoraRTCTokenRequest, AgoraRTCTokenResponse>(
         this.functions,
         "fetchAgoraRtcToken_v2"
      )(data)

      return token.rtcToken
   }

   /**
    * Fetches an Agora RTC token with the given data
    * @param data The data required to fetch the RTC token
    * @returns A promise containing the Agora RTC token
    */
   async fetchAgoraRtmToken(uid: string) {
      const {
         data: { token },
      } = await httpsCallable<AgoraRTMTokenRequest, AgoraRTMTokenResponse>(
         this.functions,
         "fetchAgoraRtmToken_v2"
      )({ uid })

      return token.rtmToken
   }

   private async getUserDetails(
      identifier: string
   ): Promise<ParticipantDetails | null> {
      const userQuery = query(
         collection(FirestoreInstance, "userData"),
         where("authId", "==", identifier),
         limit(1)
      ).withConverter(createGenericConverter<UserData>())

      const snapshot = await getDocs(userQuery)

      if (!snapshot.empty) {
         const data = snapshot.docs[0].data()

         return {
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            role: data.position || (data.fieldOfStudy?.name ?? "") || "Other",
            avatarUrl: data.avatar || "",
            linkedInUrl: data.linkedinUrl || "",
            id: identifier,
         }
      }

      return null
   }

   private async getLivestreamSpeakerDetails(
      speakerId: string,
      livestreamId: string
   ): Promise<ParticipantDetails | null> {
      const livestream = await getDoc(this.getLivestreamRef(livestreamId))

      if (livestream.exists) {
         const data = livestream.data()

         const allSpeakers = (data?.speakers || []).concat(
            data?.adHocSpeakers || []
         )
         const speaker = allSpeakers.find((speaker) => speaker.id === speakerId)

         if (speaker) {
            return {
               firstName: speaker.firstName,
               lastName: speaker.lastName,
               role: speaker.position,
               avatarUrl: speaker.avatar,
               linkedInUrl: speaker.linkedInUrl,
               id: speakerId,
               groupId: speaker.groupId,
               background: speaker.background,
            }
         }
      }

      return null
   }

   private getTagAndIdentifierFromUid(
      uid: string
   ): [StreamIdentifier, string, string] {
      return uid.split("-") as [
         StreamIdentifier,
         string, // Identifier is the speaker/user id
         string // Live stream id
      ]
   }

   async getParticipantDetails(uid: string): Promise<ParticipantDetails> {
      const [tag, identifier, livestreamId] =
         this.getTagAndIdentifierFromUid(uid)
      let details: ParticipantDetails | null = null

      switch (tag) {
         case STREAM_IDENTIFIERS.RECORDING:
            details = {
               firstName: "Recording",
               lastName: "Bot",
               role: "Recording",
               avatarUrl: "",
               linkedInUrl: "",
               id: identifier,
            }
            break
         case STREAM_IDENTIFIERS.SPEAKER:
            details = await this.getLivestreamSpeakerDetails(
               identifier,
               livestreamId
            )

            break
         case STREAM_IDENTIFIERS.USER:
            details = await this.getUserDetails(identifier)
            break
         case STREAM_IDENTIFIERS.SCREEN_SHARE: {
            /**
             * Retrieves the screen share details by extracting the user identifier from the UID.
             * If the tag indicates a screen share or a user, it fetches the user details accordingly.
             */
            const userUid = uid.replace(
               `${STREAM_IDENTIFIERS.SCREEN_SHARE}-`,
               ""
            )

            const [userTag, userIdentifier, userLivestreamId] =
               this.getTagAndIdentifierFromUid(userUid)

            if (userTag === STREAM_IDENTIFIERS.SPEAKER) {
               details = await this.getLivestreamSpeakerDetails(
                  userIdentifier,
                  userLivestreamId
               )
            }
            if (userTag === STREAM_IDENTIFIERS.USER) {
               details = await this.getUserDetails(userIdentifier)
            }
            if (details) {
               details.role = "Screen Share"
            }
            break
         }
      }

      // Return the details if found, otherwise return a default anonymous user object
      return (
         details || {
            firstName: "Anonymous",
            lastName: "",
            role:
               tag === STREAM_IDENTIFIERS.SCREEN_SHARE
                  ? "Screen Share"
                  : "User",
            avatarUrl: "",
            linkedInUrl: "",
            id: "",
         }
      )
   }

   /**
    * Gets a Firestore document reference for a live stream or its breakout room.
    *
    * @param livestreamId - The ID of the live stream.
    * @param breakoutRoomId - Optional ID of the breakout room.
    * @returns Firestore document reference.
    */
   getLivestreamRef(livestreamId: string, breakoutRoomId?: string) {
      return doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         ...(breakoutRoomId ? ["breakoutRooms", breakoutRoomId] : [])
      ).withConverter(createGenericConverter<LivestreamEvent>())
   }

   private getUserLivestreamDataRef(livestreamId: string, userEmail: string) {
      return doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "userLivestreamData",
         userEmail
      ).withConverter(createGenericConverter<UserLivestreamData>())
   }

   private updateLivestream(
      livestreamId: string,
      data: UpdateData<LivestreamEvent>
   ) {
      return updateDoc(this.getLivestreamRef(livestreamId), data)
   }

   /**
    * Sets the mode of a live stream to the provided mode (default, desktop, video, pdf)
    * If the mode is 'desktop', the agoraUid is required to identify the screen sharer.
    * Updates the live stream document with the new mode and, if applicable, the screenSharerId.
    *
    * @param params - The parameters required to start or stop sharing, including live stream ID, mode, and Agora UID.
    * @returns A promise resolved with the update operation result.
    */
   async setLivestreamMode<Mode extends LivestreamMode>(
      livestreamId: string,
      options: SetModeOptionsType<Mode>
   ) {
      switch (options.mode) {
         case LivestreamModes.DESKTOP:
            if (!options.screenSharerAgoraUID) {
               throw new Error(
                  "Agora UID is required to start sharing the screen"
               )
            }
            return this.updateLivestream(livestreamId, {
               mode: options.mode,
               screenSharerId: options.screenSharerAgoraUID,
            })

         case LivestreamModes.PRESENTATION:
            return this.updateLivestream(livestreamId, {
               mode: options.mode,
            })

         case LivestreamModes.VIDEO:
            /**
             * TODO:
             * Batch operations (both must succeed or fail)
             * 1. Set mode to video on livestreams/{id}
             * 2. Save the video URL at /livestreams/{id}/videos/video. Look at old implementation for reference
             */
            return this.updateLivestream(livestreamId, {
               mode: options.mode,
            })
         case LivestreamModes.DEFAULT:
            return this.updateLivestream(livestreamId, {
               mode: options.mode,
               screenSharerId: "",
            })

         default:
            throw new Error("Invalid mode provided")
      }
   }

   /**
    * Updates Firestore to mark a user as participating in a live stream. This involves updating the user's status in `userLivestreamData`.
    *
    * @param {string} livestreamId - Livestream ID.
    * @param {UserData} userData - User data.
    * @param {UserStats} userStats - User statistics.
    * @returns {Promise<void>} Resolves upon successful Firestore batch commit.
    */
   async setUserIsParticipating(
      livestreamId: string,
      userData: UserData,
      userStats: UserStats
   ): Promise<void> {
      const batch = writeBatch(FirestoreInstance)

      const userLivestreamDataRef = this.getUserLivestreamDataRef(
         livestreamId,
         userData.userEmail
      )

      const userLivestreamDataSnapshot = await getDoc(userLivestreamDataRef)

      const shouldParticipate = userLivestreamDataSnapshot.exists()

      // User live stream data does not exist, which means they haven't registered yet, so abort
      if (!shouldParticipate) return

      const isFirstTimeParticipating =
         !userLivestreamDataSnapshot.data()?.participated?.date

      // Set the user Participating data in the userLivestreamData collection
      batch.set(
         userLivestreamDataRef,
         {
            user: userData,
            userId: userData?.authId,
            participated: {
               date: Timestamp.now(),
               // If this is the first time the user is participating, we store the user stats
               ...(isFirstTimeParticipating
                  ? {
                       initialSnapshot: {
                          userData: userData || null,
                          userStats: userStats || null,
                          date: Timestamp.now(),
                       },
                       utm: CookiesUtil.getUTMParams(),
                    }
                  : {}),
            },
         },
         {
            merge: true,
         }
      )

      return batch.commit()
   }
   /**
    * Sets the status of a live stream to either started or not started.
    * If `shouldStart` is true, performs a transaction to ensure the stream isn't restarted if already started.
    * Otherwise, performs a normal update operation to mark the stream as ended.
    *
    * @param {string} livestreamId - The ID of the live stream to update.
    * @param {boolean} shouldStart - A boolean indicating if the live stream has started.
    * @returns A promise resolved with the result of the update operation.
    */
   async updateLivestreamStartEndState(
      livestreamId: string,
      shouldStart: boolean
   ) {
      const livestreamRef = this.getLivestreamRef(livestreamId)
      return runTransaction(FirestoreInstance, async (transaction) => {
         const livestreamDoc = await transaction.get(livestreamRef)
         if (!livestreamDoc.exists()) {
            throw "Document does not exist!"
         }
         const data = livestreamDoc.data()
         if (shouldStart) {
            const updateData: UpdateData<LivestreamEvent> = {
               hasStarted: true,
               hasEnded: false,
            }

            if (!data.hasStarted) {
               // Only update the startedAt field if the stream wasn't started before
               updateData.startedAt = Timestamp.now()
            }

            transaction.update(livestreamRef, {
               hasStarted: true,
               hasEnded: false,
               startedAt: Timestamp.now(),
            })
         } else {
            // should end

            transaction.update(livestreamRef, {
               hasEnded: true,
               hasStarted: false,
               endedAt: Timestamp.now(),
            })
         }
      })
   }

   addChatEntry = (options: {
      livestreamId: string
      message: string
      authorEmail: string
      type: LivestreamChatEntry["type"]
      displayName: string
      agoraUserId: string
      userUid: string
   }) => {
      const {
         livestreamId,
         message,
         authorEmail,
         type,
         displayName,
         agoraUserId,
         userUid,
      } = options

      const ref = doc(
         collection(
            FirestoreInstance,
            "livestreams",
            livestreamId,
            "chatEntries"
         )
      ).withConverter(createGenericConverter<LivestreamChatEntry>())

      return setDoc(ref, {
         laughing: [],
         wow: [],
         heart: [],
         thumbsUp: [],
         authorName: displayName,
         timestamp: Timestamp.now(),
         authorEmail,
         message,
         type,
         agoraUserId,
         userUid,
         id: ref.id,
      })
   }

   deleteChatEntry = async (options: DeleteLivestreamChatEntryRequest) => {
      await httpsCallable<DeleteLivestreamChatEntryRequest>(
         this.functions,
         "deleteLivestreamChatEntry"
      )(options)
      return
   }

   createPoll = async (options: CreateLivestreamPollRequest) => {
      await httpsCallable<CreateLivestreamPollRequest>(
         this.functions,
         "createPoll"
      )(options)
      return
   }

   updatePoll = async (options: UpdateLivestreamPollRequest) => {
      await httpsCallable<UpdateLivestreamPollRequest>(
         this.functions,
         "updatePoll"
      )(options)
      return
   }

   deletePoll = async (options: DeleteLivestreamPollRequest) => {
      await httpsCallable<DeleteLivestreamPollRequest>(
         this.functions,
         "deletePoll"
      )(options)
      return
   }

   markPollAsCurrent = async (options: MarkLivestreamPollAsCurrentRequest) => {
      await httpsCallable<MarkLivestreamPollAsCurrentRequest>(
         this.functions,
         "markPollAsCurrent"
      )(options)
      return
   }

   async votePollOption(
      livestreamId: string,
      pollId: string,
      optionId: string,
      userIdentifier: string
   ) {
      const optionRef = doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "polls",
         pollId,
         "voters",
         userIdentifier
      ).withConverter(createGenericConverter<LivestreamPollVoter>())

      setDoc(
         optionRef,
         {
            id: optionRef.id,
            optionId,
            timestamp: Timestamp.now(),
            userId: userIdentifier,
         },
         { merge: true }
      )
   }

   /**
    * Resets a question or all questions for a live stream
    */
   async resetQuestion(options: ResetLivestreamQuestionRequest) {
      await httpsCallable<ResetLivestreamQuestionRequest>(
         this.functions,
         "resetQuestion"
      )(options)
   }

   /**
    * Marks a question as the current one being answered
    */
   async markQuestionAsCurrent(
      options: MarkLivestreamQuestionAsCurrentRequest
   ) {
      await httpsCallable<MarkLivestreamQuestionAsCurrentRequest>(
         this.functions,
         "markQuestionAsCurrent"
      )(options)
   }

   /**
    * Marks a question as done for a live stream
    */
   async markQuestionAsDone(options: MarkLivestreamQuestionAsDoneRequest) {
      await httpsCallable<MarkLivestreamQuestionAsDoneRequest>(
         this.functions,
         "markQuestionAsDone"
      )(options)
   }

   /**
    * Deletes a question from a live stream along with all its comments
    * @param livestreamRef - Livestream document reference
    * @param questionId - Question ID
    */
   deleteQuestion = async (
      livestreamRef: DocumentReference<LivestreamEvent>,
      questionId: string
   ) => {
      const batch = writeBatch(FirestoreInstance)
      const ref = this.getQuestionRef(livestreamRef, questionId)

      const commentsRef = collection(ref, "comments")
      const comments = await getDocs(commentsRef)

      comments.forEach((comment) => {
         batch.delete(comment.ref)
      })

      batch.delete(ref)

      return batch.commit()
   }

   /**
    * Deletes a comment from a question
    * @param options - Options
    */
   deleteQuestionComment = async (
      livestreamRef: DocumentReference<LivestreamEvent>,
      questionId: string,
      commentId: string
   ) => {
      return runTransaction(FirestoreInstance, async (transaction) => {
         const commentRef = this.getCommentRef(
            livestreamRef,
            questionId,
            commentId
         )

         const questionRef = this.getQuestionRef(livestreamRef, questionId)

         const questionDoc = await transaction.get(questionRef)
         const commentDoc = await transaction.get(commentRef)

         if (!commentDoc.exists()) {
            throw new Error("Comment does not exist")
         }

         if (questionDoc.exists()) {
            const replacementFirstCommentsSnap = await getDocs(
               query(
                  collection(questionRef, "comments"),
                  orderBy("timestamp", "asc"),
                  limit(2)
               ).withConverter(
                  createGenericConverter<LivestreamQuestionComment>()
               )
            )

            const currentFirstComment = questionDoc.data().firstComment

            const isFirstCommentDeleted = currentFirstComment?.id === commentId

            const updateData: PartialWithFieldValue<LivestreamQuestion> = {
               numberOfComments: increment(-1),
            }

            if (isFirstCommentDeleted) {
               const replacementFirstComment =
                  replacementFirstCommentsSnap.docs
                     .find((comment) => comment.id !== commentId)
                     ?.data() || null

               updateData.firstComment = replacementFirstComment
            }

            transaction.update(questionRef, updateData)
         }

         transaction.delete(commentRef)
      })
   }

   /**
    * Retrieves or creates a Firestore document reference for a question within a live stream or breakout room.
    * @param livestreamRef - Reference to the live stream/breakout room document.
    * @param questionId - Question ID
    * @returns Document reference for the question.
    */
   getQuestionRef(
      livestreamRef: DocumentReference<LivestreamEvent>,
      questionId: string
   ) {
      return doc(
         collection(livestreamRef, "questions"),
         questionId
      ).withConverter(createGenericConverter<LivestreamQuestion>())
   }

   /**
    * Get a comment reference to a question from a live stream or breakout room
    * @param livestreamRef - Reference to the live stream/breakout room document
    * @param questionId - Question ID
    * @param commentId - Comment ID
    * @returns Document reference for the comment
    */
   private getCommentRef(
      livestreamRef: DocumentReference<LivestreamEvent>,
      questionId: string,
      commentId: string
   ) {
      const questionRef = this.getQuestionRef(livestreamRef, questionId)
      return doc(collection(questionRef, "comments"), commentId).withConverter(
         createGenericConverter<LivestreamQuestionComment>()
      )
   }

   /**
    * Creates a question in a live stream or breakout room.
    * @param livestreamRef - Livestream document reference.
    * @param options - Question options.
    * @returns A promise resolved with the result of the create operation.
    */
   createQuestion = async (
      livestreamRef: DocumentReference<LivestreamEvent>,
      options: Pick<
         LivestreamQuestion,
         "title" | "displayName" | "author" | "badges" | "agoraUserId"
      >
   ) => {
      const newQuestionRef = doc(
         collection(livestreamRef, "questions")
      ).withConverter(createGenericConverter<LivestreamQuestion>())

      const newQuestion = {
         id: newQuestionRef.id,
         badges: options.badges || [],
         title: options.title,
         displayName: options.displayName,
         author: options.author || "",
         agoraUserId: options.agoraUserId || "",
         timestamp: Timestamp.now(),
         voterIds: [],
         emailOfVoters: [],
         numberOfComments: 0,
         votes: 0,
         firstComment: null,
         type: "new",
      } satisfies PartialWithFieldValue<LivestreamQuestion>

      await setDoc(newQuestionRef, newQuestion)

      return newQuestion
   }

   /**
    * Toggles the upvote status of a question.
    * @param livestreamRef - Livestream document reference.
    * @param questionId - Question ID.
    * @param args - User identifiers (email and uid)
    * @returns A promise resolved with the result of the toggle operation.
    */
   toggleUpvoteQuestion = async (
      livestreamRef: DocumentReference<LivestreamEvent>,
      questionId: string,
      args: { email: string; uid: string; deprecatedSessionUuid?: string }
   ) => {
      return runTransaction(FirestoreInstance, async (transaction) => {
         const questionRef = this.getQuestionRef(livestreamRef, questionId)

         const questionDoc = await transaction.get(questionRef)

         if (questionDoc.exists()) {
            const question = questionDoc.data()

            const hasUpvoted = hasUpvotedLivestreamQuestion(question, args)

            if (hasUpvoted) {
               transaction.update(questionRef, {
                  votes: increment(-1),
                  ...(args.uid ? { voterIds: arrayRemove(args.uid) } : {}),
                  // Take the chance to remove the user's email from deprecated emailOfVoters
                  ...(args.email
                     ? { emailOfVoters: arrayRemove(args.email) }
                     : {}),
               })
               return "downvoted"
            } else {
               // We no longer want to store the user's email
               transaction.update(questionRef, {
                  votes: increment(1),
                  voterIds: arrayUnion(args.uid),
               })
               return "upvoted"
            }
         } else {
            throw new Error("Question does not exist")
         }
      })
   }

   /**
    * Adds a comment to a question.
    * @param livestreamRef - Livestream document reference.
    * @param questionId - Question ID.
    * @param data - New comment data.
    * @returns A promise resolved with the result of the comment operation.
    */
   async commentOnQuestion(
      livestreamRef: DocumentReference<LivestreamEvent>,
      questionId: string,
      data: Pick<
         LivestreamQuestionComment,
         "title" | "author" | "userUid" | "agoraUserId" | "authorType"
      >
   ) {
      const questionRef = this.getQuestionRef(livestreamRef, questionId)

      return runTransaction(FirestoreInstance, async (transaction) => {
         const questionDoc = await transaction.get(questionRef)

         const newCommentRef = doc(
            collection(questionRef, "comments")
         ).withConverter(createGenericConverter<LivestreamQuestionComment>())

         if (questionDoc.exists()) {
            const question = questionDoc.data()

            const newComment: LivestreamQuestionComment = {
               id: newCommentRef.id,
               title: data.title,
               author: data.author,
               userUid: data.userUid || "",
               agoraUserId: data.agoraUserId || "",
               authorType: data.authorType,
               timestamp: Timestamp.now(),
            }

            transaction.update(questionRef, {
               numberOfComments: increment(1),
               ...(question.firstComment ? {} : { firstComment: newComment }),
            })

            transaction.set(newCommentRef, newComment)
         } else {
            throw new Error(
               `Question ${questionId} does not exist at path ${questionRef.path}`
            )
         }
      })
   }

   /**
    * Gets the company host of a live stream.
    * @param livestreamId - Livestream id.
    * @returns A promise resolved with the company Group or null if there are
    * multiple hosts.
    */
   async getLivestreamHost(livestreamId: string) {
      const livestreamRef = this.getLivestreamRef(livestreamId)
      const livestreamSnapshot = await getDoc(livestreamRef)

      if (!livestreamSnapshot.exists()) return null

      const livestreamData = livestreamSnapshot.data()
      if (!livestreamData.groupIds) return null

      const groups = await groupRepo.getGroupsByIds(livestreamData.groupIds)
      const companyGroups = groups.filter((group) => !group.universityCode)

      const isHostedBySingleCompany = companyGroups?.length === 1
      const isHostedBySingleUniversity =
         companyGroups.length === 0 && groups.length === 1

      if (isHostedBySingleCompany) {
         return companyGroups[0]
      }

      if (isHostedBySingleUniversity) {
         return groups[0]
      }

      return null
   }

   /**
    * Starts a hand raise in
    * @param options - Hand raise options.
    * @returns A promise resolved with the result of the hand raise operation.
    */
   async toggleHandRaise(options: ToggleHandRaiseRequest) {
      await httpsCallable<ToggleHandRaiseRequest>(
         this.functions,
         "toggleHandRaise"
      )(options)
      return
   }

   async setUserHandRaiseState(
      livestreamId: string,
      handRaiseId: string,
      displayName: string,
      newState: HandRaiseState
   ) {
      const handRaiseStateRef = doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "handRaises",
         handRaiseId
      ).withConverter(createGenericConverter<HandRaise>())

      return setDoc(
         handRaiseStateRef,
         {
            id: handRaiseStateRef.id,
            name: displayName,
            state: newState,
            timeStamp: Timestamp.now(),
         },
         { merge: true }
      )
   }

   getPresentationRef = (livestreamId: string) => {
      return doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "presentations",
         "presentation"
      ).withConverter(createGenericConverter<LivestreamPresentation>())
   }

   /**
    * Sets the live stream PDF presentation metadata in the firestore database
    */
   setLivestreamPDFPresentation = async ({
      livestreamId,
      downloadUrl,
      fileSize,
      fileName,
      storagePath,
   }: {
      livestreamId: string
      downloadUrl: string
      fileSize: number
      fileName: string
      storagePath: string
   }) => {
      const ref = this.getPresentationRef(livestreamId)

      return setDoc(ref, {
         downloadUrl,
         page: 1,
         fileName: fileName || livestreamId,
         fileSize: fileSize || 0,
         id: ref.id,
         storagePath,
      })
   }

   removeLivestreamPDFPresentation = async (livestreamId: string) => {
      const ref = this.getPresentationRef(livestreamId)

      return deleteDoc(ref)
   }

   incrementLivestreamPage = async (livestreamId: string, amount: number) => {
      const ref = this.getPresentationRef(livestreamId)
      return updateDoc(ref, { page: increment(amount) })
   }

   getVideoRef = (livestreamId: string) => {
      return doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "videos",
         "video"
      ).withConverter(createGenericConverter<LivestreamVideo>())
   }

   setLivestreamVideo = async ({
      livestreamId,
      url,
      updater,
   }: {
      livestreamId: string
      url: string
      updater: string
   }) => {
      const ref = this.getVideoRef(livestreamId)

      return setDoc(ref, {
         id: ref.id,
         url,
         second: getSecondsPassedFromYoutubeUrl(url),
         state: "playing",
         lastPlayed: Timestamp.now(),
         updater,
      })
   }

   removeLivestreamVideo = async (livestreamId: string) => {
      const ref = this.getVideoRef(livestreamId)
      return deleteDoc(ref).then(() => alert("deleted"))
   }

   updateVideoState = async (
      livestreamId: string,
      updateData: Partial<Pick<LivestreamVideo, "state" | "second" | "updater">>
   ) => {
      const ref = this.getVideoRef(livestreamId)
      return updateDoc(ref, {
         ...updateData,
         ...(updateData.state === "playing"
            ? { lastPlayed: Timestamp.now() }
            : {}),
      })
   }

   /**
    * Saves the emote to the database to be used in the PDF Report
    * to show number of reactions/engagement
    */
   addEmote = async (
      livestreamId: string,
      emoteType: EmoteType,
      agoraUserId: string,
      userUid: string
   ) => {
      const ref = doc(
         collection(FirestoreInstance, "livestreams", livestreamId, "icons")
      ).withConverter(createGenericConverter<LivestreamEmote>())

      return setDoc(ref, {
         id: ref.id,
         name: emoteType,
         timestamp: Timestamp.now(),
         agoraUserId,
         userUid: userUid || null,
      })
   }

   getUserFeedbackQuestionAnswer = async (
      livestreamId: string,
      questionId: string,
      userId: string
   ) => {
      const voterInVotersRef = doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "rating",
         questionId,
         "voters",
         userId
      ).withConverter(createGenericConverter<EventRatingAnswer>())

      const voterInNonVotersRef = doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "rating",
         questionId,
         "nonVoters",
         userId
      ).withConverter(createGenericConverter<EventRatingAnswer>())

      const voterInVotersSnap = await getDoc(voterInVotersRef)
      const voterInNonVotersSnap = await getDoc(voterInNonVotersRef)

      return {
         hasAnswered:
            voterInVotersSnap.exists() || voterInNonVotersSnap.exists(),
         optedOut: voterInNonVotersSnap.exists(),
         answer: voterInVotersSnap.data() || voterInNonVotersSnap.data(),
      }
   }

   optOutFeedbackQuestion = async (
      livestreamId: string,
      questionId: string,
      voterId: string,
      userData: ParticipantDetails
   ) => {
      const ref = doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "rating",
         questionId,
         "nonVoters",
         voterId
      ).withConverter(createGenericConverter<EventRatingAnswer>())

      return setDoc(ref, {
         id: ref.id,
         timestamp: Timestamp.now(),
         user: { ...userData },
      })
   }

   answerFeedbackQuestion = async (
      livestreamId: string,
      questionId: string,
      voterId: string,
      userData: ParticipantDetails,
      answer: FeedbackQuestionUserAnswer
   ) => {
      const ref = doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "rating",
         questionId,
         "voters",
         voterId
      ).withConverter(createGenericConverter<EventRatingAnswer>())

      return setDoc(ref, {
         ...answer,
         id: ref.id,
         timestamp: Timestamp.now(),
         user: { ...userData },
      })
   }

   toggleNewUI = async (livestreamId: string) => {
      const livestreamRef = this.getLivestreamRef(livestreamId)
      const livestreamDoc = await getDoc(livestreamRef)
      if (livestreamDoc.exists) {
         return updateDoc(livestreamRef, {
            useOldUI: !livestreamDoc.data().useOldUI,
         })
      }
   }

   /**
    * Updates or adds a live stream speaker, including related creator updates and last-minute profiles for hosts.
    */
   async upsertLivestreamSpeaker(data: UpsertSpeakerRequest) {
      return httpsCallable<UpsertSpeakerRequest, Speaker>(
         this.functions,
         FUNCTION_NAMES.upsertLivestreamSpeaker
      )(data)
   }

   /**
    * Fetches recommended live stream events for a user.
    * @param {number} limit - Maximum number of events to fetch.
    * @param {string} userId - ID of the user to get recommendations for.
    * @param {boolean} bypassCache - Optional flag to bypass cache for fresh recommendations.
    * @param {string} referenceLivestreamId - Optional ID of the livestream to reference.
    * @returns Array of recommended live stream events.
    *
    * Filters out:
    * 1. Events the user is already registered for.
    * 2. Events that have already ended.
    */
   async getRecommendedEvents(
      limit: number,
      userId: string,
      bypassCache: boolean = false,
      referenceLivestreamId?: string
   ) {
      const { data: eventIds } = await httpsCallable<
         GetRecommendedEventsFnArgs,
         string[]
      >(
         this.functions,
         FUNCTION_NAMES.getRecommendedEvents
      )({
         limit,
         bypassCache,
         referenceLivestreamId,
      })

      const recommendedLivestreams: LivestreamEvent[] = []

      for (const eventId of eventIds) {
         const isUserRegistered = await this.hasUserRegistered(eventId, userId)
         // If the user is registered, we don't want to show them the event
         if (isUserRegistered) {
            continue
         }

         const eventSnap = await getDoc(this.getLivestreamRef(eventId))

         if (!eventSnap.exists()) {
            continue
         }

         const livestream = eventSnap.data()

         // If the event has ended, we don't want to show it
         if (livestream?.hasEnded) {
            continue
         }

         recommendedLivestreams.push(livestream)
      }

      return recommendedLivestreams
   }

   async hasUserRegistered(livestreamId: string, userId: string) {
      if (!userId || !livestreamId) return false

      const registeredRef = doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "userLivestreamData",
         userId
      ).withConverter(createGenericConverter<UserLivestreamData>())

      const registeredSnap = await getDoc(registeredRef)

      return Boolean(registeredSnap.data()?.registered?.date)
   }

   createCTA = async (options: CreateLivestreamCTARequest) => {
      await httpsCallable<CreateLivestreamCTARequest>(
         this.functions,
         "createCTA"
      )(options)
      return
   }

   updateCTA = async (options: UpdateLivestreamCTARequest) => {
      await httpsCallable<UpdateLivestreamCTARequest>(
         this.functions,
         "updateCTA"
      )(options)
      return
   }

   deleteCTA = async (options: DeleteLivestreamCTARequest) => {
      await httpsCallable<DeleteLivestreamCTARequest>(
         this.functions,
         "deleteCTA"
      )(options)
      return
   }

   toggleActiveCTA = async (options: ToggleActiveCTARequest) => {
      await httpsCallable<ToggleActiveCTARequest>(
         this.functions,
         "toggleActiveCTA"
      )(options)
      return
   }

   getCTARef = (livestreamId: string, ctaId: string) => {
      return doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "callToActions",
         ctaId
      ).withConverter(createGenericConverter<LivestreamCTA>())
   }

   getUserCTARef = (livestreamId: string, ctaId: string, userId: string) => {
      return doc(
         FirestoreInstance,
         "livestreams",
         livestreamId,
         "callToActions",
         ctaId,
         "usersWhoInteracted",
         userId
      ).withConverter(createGenericConverter<LivestreamCTAUserInteraction>())
   }

   clickCTA = async (
      livestreamId: string,
      ctaId: string,
      userIdentifier: string
   ) => {
      return runTransaction(FirestoreInstance, async (transaction) => {
         const ctaRef = this.getCTARef(livestreamId, ctaId)
         const userRef = this.getUserCTARef(livestreamId, ctaId, userIdentifier)

         transaction.set(
            userRef,
            {
               ctaId: ctaId,
               livestreamId: livestreamId,
               userId: userIdentifier,
               numberOfClicks: increment(1),
               clickedAt: arrayUnion({
                  timestamp: Timestamp.now(),
               }),
            },
            { merge: true }
         )

         transaction.update(ctaRef, {
            numberOfUsersWhoClickedLink: increment(1),
         })
      })
   }

   dismissCTA = async (
      livestreamId: string,
      ctaId: string,
      userIdentifier: string
   ) => {
      return runTransaction(FirestoreInstance, async (transaction) => {
         const ctaRef = this.getCTARef(livestreamId, ctaId)
         const userRef = this.getUserCTARef(livestreamId, ctaId, userIdentifier)

         transaction.set(
            userRef,
            {
               userId: userIdentifier,
               ctaId: ctaId,
               livestreamId: livestreamId,
               dismissedAt: Timestamp.now(),
            },
            { merge: true }
         )

         transaction.update(ctaRef, {
            numberOfUsersWhoDismissed: increment(1),
         })
      })
   }

   markCTAAsRead = async (
      livestreamId: string,
      userIdentifier: string,
      ctaIds: string[]
   ) => {
      ctaIds.forEach((ctaId) => {
         const userRef = this.getUserCTARef(livestreamId, ctaId, userIdentifier)

         setDoc(
            userRef,
            {
               userId: userIdentifier,
               ctaId: ctaId,
               livestreamId: livestreamId,
               readAt: Timestamp.now(),
            },
            { merge: true }
         )
      })
   }

   /**
    * Finds a target event by ID, searching in both livestreams and draft livestreams collections
    * @param eventId - The ID of the event to find
    * @returns Promise containing the target stream and its type (past, upcoming, or draft)
    */
   async findTargetEvent(eventId: string): Promise<{
      targetStream: LivestreamEvent | null
      typeOfStream: "past" | "upcoming" | "draft"
   }> {
      let targetStream: LivestreamEvent | null = null
      let typeOfStream: "past" | "upcoming" | "draft" | null = null

      try {
         // First, try to find the event in the livestreams collection
         const livestreamRef = this.getLivestreamRef(eventId)
         const streamSnap = await getDoc(livestreamRef)

         if (streamSnap.exists()) {
            targetStream = streamSnap.data()
            const startDate = targetStream.start?.toDate?.()
            typeOfStream = this.isPastEvent(startDate) ? "past" : "upcoming"
         } else {
            // If not found in livestreams, try draftLivestreams collection
            const draftRef = doc(
               FirestoreInstance,
               "draftLivestreams",
               eventId
            ).withConverter(createGenericConverter<LivestreamEvent>())

            const draftSnap = await getDoc(draftRef)

            if (draftSnap.exists()) {
               targetStream = draftSnap.data()
               typeOfStream = "draft"
            }
         }
      } catch (error) {
         console.error("Error finding target event:", error)
      }

      return { targetStream, typeOfStream }
   }

   /**
    * Determines if an event is in the past based on its start date
    * @param eventStartDate - The start date of the event
    * @returns True if the event is in the past, false otherwise
    */
   private isPastEvent(eventStartDate: Date): boolean {
      if (!eventStartDate) return false

      return (
         eventStartDate <
            new Date(Date.now() - UPCOMING_STREAM_THRESHOLD_MILLISECONDS) &&
         eventStartDate > new Date(START_DATE_FOR_REPORTED_EVENTS)
      )
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const livestreamService = new LivestreamService(FunctionsInstance as any)

export default LivestreamService
