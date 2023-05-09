import { v4 as uuidv4 } from "uuid"
import {
   FORTY_FIVE_MINUTES_IN_MILLISECONDS,
   START_DATE_FOR_REPORTED_EVENTS,
} from "../constants/streamContants"
import DateUtil from "util/DateUtil"
import firebaseApp, { FunctionsInstance } from "./FirebaseInstance"
import firebase from "firebase/compat/app"
import { HandRaiseState } from "types/handraise"
import {
   getQueryStringFromUrl,
   getReferralInformation,
   shouldUseEmulators,
} from "../../util/CommonUtil"
import {
   EventRating,
   EventRatingAnswer,
   LivestreamChatEntry,
   LivestreamEvent,
   LivestreamGroupQuestionsMap,
   LivestreamImpression,
   LivestreamPromotions,
   LivestreamQuestion,
   pickPublicDataFromLivestream,
   UserLivestreamData,
} from "@careerfairy/shared-lib/livestreams"
import SessionStorageUtil from "../../util/SessionStorageUtil"
import {
   Group,
   GROUP_DASHBOARD_ROLE,
   GroupAdmin,
   GroupQuestion,
   GroupWithPolicy,
   UserGroupData,
} from "@careerfairy/shared-lib/groups"
import {
   getLivestreamGroupQuestionAnswers,
   TalentProfile,
   UserData,
   UserLivestreamGroupQuestionAnswers,
   UserStats,
} from "@careerfairy/shared-lib/users"
import { BigQueryUserQueryOptions } from "@careerfairy/shared-lib/bigQuery/types"
import { IAdminUserCreateFormValues } from "../../components/views/signup/steps/SignUpAdminForm"
import CookiesUtil from "../../util/CookiesUtil"
import { Counter } from "@careerfairy/shared-lib/FirestoreCounter"
import { makeUrls } from "../../util/makeUrls"
import {
   createCompatGenericConverter,
   OnSnapshotCallback,
} from "@careerfairy/shared-lib/BaseFirebaseRepository"
import DocumentReference = firebase.firestore.DocumentReference
import DocumentData = firebase.firestore.DocumentData
import DocumentSnapshot = firebase.firestore.DocumentSnapshot
import { getAValidLivestreamStatsUpdateField } from "@careerfairy/shared-lib/livestreams/stats"
import { recommendationServiceInstance } from "./RecommendationService"
import { GetRegistrationSourcesFnArgs } from "@careerfairy/shared-lib/functions/groupAnalyticsTypes"
import { clearFirestoreCache } from "../util/authUtil"
import { getAValidGroupStatsUpdateField } from "@careerfairy/shared-lib/groups/stats"
import { EmoteMessage } from "context/agora/RTMContext"
import { RewardAction } from "@careerfairy/shared-lib/dist/rewards"
import { groupTriGrams } from "@careerfairy/shared-lib/utils/search"

class FirebaseService {
   public readonly app: firebase.app.App
   public readonly firestore: firebase.firestore.Firestore
   public readonly auth: firebase.auth.Auth
   public readonly storage: firebase.storage.Storage
   public readonly functions: firebase.functions.Functions

   constructor(firebaseInstance: firebase.app.App) {
      this.app = firebaseInstance
      this.auth = firebaseInstance.auth()
      this.firestore = firebaseInstance.firestore()
      this.storage = firebaseInstance.storage()
      this.functions = FunctionsInstance
   }

   getFirebaseTimestamp = (dateString) => {
      return firebase.firestore.Timestamp.fromDate(new Date(dateString))
   }

   // *** Functions Api ***

   /**
    * Returns a promise containing the agora token object
    * @promise AgoraTokenPromise
    * @fulfill {({rtcToken: string, rtmToken: string})} A project object with the format {name: String, data: Object}
    * @reject {Error}
    * @returns fPromise
    */

   fetchAgoraRtcToken = async (data) => {
      const fetchAgoraRtcToken = this.functions.httpsCallable(
         "fetchAgoraRtcToken_eu"
      )
      return await fetchAgoraRtcToken(data)
   }

   fetchAgoraRtmToken = async (data) => {
      const fetchAgoraRtmToken = this.functions.httpsCallable(
         "fetchAgoraRtmToken_eu"
      )
      return await fetchAgoraRtmToken(data)
   }

   startLivestreamRecording = async (data) => {
      const startLivestreamRecording = this.functions.httpsCallable(
         "startRecordingLivestream_eu"
      )
      return await startLivestreamRecording(data)
   }

   stopLivestreamRecording = async (data) => {
      const stopLivestreamRecording = this.functions.httpsCallable(
         "stopRecordingLivestream_eu"
      )
      return await stopLivestreamRecording(data)
   }

   createUserInAuthAndFirebase = async (userData) => {
      const createUserInAuthAndFirebase = this.functions.httpsCallable(
         "createNewUserAccount_eu"
      )
      return createUserInAuthAndFirebase({ userData })
   }

   getRegistrationSources = (args: GetRegistrationSourcesFnArgs) => {
      const fn = this.functions.httpsCallable("getRegistrationSources_eu")
      return fn(args)
   }

   createGroupAdminUserInAuthAndFirebase = async (args: {
      userData: IAdminUserCreateFormValues
   }): Promise<{
      readonly data: Group
   }> => {
      return this.functions.httpsCallable("createNewGroupAdminUserAccount_eu")(
         args
      )
   }
   createGroup = async (args: {
      group: Omit<Group, "id" | "groupId" | "triGrams">
      groupQuestions?: GroupQuestion[]
   }) => {
      return this.functions.httpsCallable("createGroup_eu")(args)
   }

   changeRole = async (args: {
      groupId: string
      email: string
      newRole: GROUP_DASHBOARD_ROLE
   }) => {
      return this.functions.httpsCallable("changeRole_eu")(args)
   }

   kickFromDashboard = async (args: { groupId: string; email: string }) => {
      return this.functions.httpsCallable("kickFromDashboard_eu")(args)
   }

   sendNewlyPublishedEventEmail = async (emailData) => {
      const sendNewlyPublishedEventEmail = this.functions.httpsCallable(
         "sendNewlyPublishedEventEmail_eu"
      )
      return sendNewlyPublishedEventEmail(emailData)
   }
   sendDraftApprovalRequestEmail = async (data) => {
      const sendDraftApprovalRequestEmail = this.functions.httpsCallable(
         "sendDraftApprovalRequestEmail_eu"
      )
      return sendDraftApprovalRequestEmail(data)
   }

   validateUserEmailWithPin = async (userInfo) => {
      const validateUserEmailWithPin = this.functions.httpsCallable(
         "validateUserEmailWithPin_eu"
      )
      return validateUserEmailWithPin({ userInfo })
   }
   sendPasswordResetEmail = async (data: {
      recipientEmail: string
      redirectLink: string
   }) => {
      const sendPasswordResetEmail = this.functions.httpsCallable(
         "sendPostmarkResetPasswordEmail_eu"
      )
      return sendPasswordResetEmail(data)
   }
   resendPostmarkEmailVerificationEmailWithPin = async (data: {
      recipientEmail: string
   }) => {
      const resendPostmarkEmailVerificationEmailWithPin =
         this.functions.httpsCallable(
            "resendPostmarkEmailVerificationEmailWithPin_eu"
         )
      return resendPostmarkEmailVerificationEmailWithPin(data)
   }

   sendReminderEmailAboutApplicationLink = async (data) => {
      const sendReminderEmailAboutApplicationLink =
         this.functions.httpsCallable(
            "sendReminderEmailAboutApplicationLink_eu"
         )
      return sendReminderEmailAboutApplicationLink(data)
   }

   sendGroupAdminInviteEmail = async (args: {
      recipientEmail: string
      groupName: string
      senderFirstName: string
      groupId: string
      role: GROUP_DASHBOARD_ROLE
   }) => {
      return this.functions.httpsCallable("sendDashboardInviteEmail_eu")(args)
   }

   sendBasicTemplateEmail = async ({
      values,
      testEmails,
      senderEmail,
      templateId,
      queryOptions,
      isForRealEmails = false,
   }) => {
      const dataObj = {
         title: values.title,
         summary: values.summary,
         companyLogoUrl: values.companyLogoUrl,
         illustrationImageUrl: values.illustrationImageUrl,
         eventUrl: values.eventUrl,
         subject: values.subject,
         start: values.start,
         testEmails,
         senderEmail,
         templateId,
         queryOptions: queryOptions as BigQueryUserQueryOptions,
         isForRealEmails,
      }

      const sendBasicTemplateEmail = this.functions.httpsCallable(
         "sendBasicTemplateEmail_eu"
      )

      return sendBasicTemplateEmail(dataObj)
   }

   /**
    * Call an on call cloud function to generate a secure agora token.
    * @param {({
    * targetStreamId: string,
    * targetGroupId: string,
    * userEmail: string,
    * })} data
    * @return {Promise<firebase.functions.HttpsCallableResult>}
    */
   getLivestreamReportData = async (
      data
   ): Promise<firebase.functions.HttpsCallableResult> => {
      const handleGetLivestreamReportData = this.functions.httpsCallable(
         "getLivestreamReportData_eu"
      )
      return handleGetLivestreamReportData(data)
   }

   sendRegistrationConfirmationEmail = (user, userData, livestream) => {
      if (livestream.isHybrid) {
         return this.sendHybridEventEmailRegistrationConfirmation(
            user,
            userData,
            livestream
         )
      } else if (livestream.isFaceToFace) {
         return this.sendPhysicalEventEmailRegistrationConfirmation(
            user,
            userData,
            livestream
         )
      } else {
         return this.sendLivestreamEmailRegistrationConfirmation(
            user,
            userData,
            livestream
         )
      }
   }

   sendLivestreamEmailRegistrationConfirmation = (
      user,
      userData,
      livestream
   ) => {
      const sendLivestreamRegistrationConfirmationEmail =
         this.functions.httpsCallable(
            "sendLivestreamRegistrationConfirmationEmail_eu"
         )

      const livestreamStartDate = livestream.start.toDate()
      const linkToLivestream = `https://careerfairy.io/upcoming-livestream/${livestream.id}`
      const linkWithUTM = `${linkToLivestream}?utm_campaign=fromCalendarEvent`

      const calendarEvent = {
         name: livestream.title,
         details: `<p style=\"font-style:italic;display:inline-block\">Join the event now!</p> Click <a href=\"${linkWithUTM}\">here</a>`,
         location: linkWithUTM,
         startsAt: livestreamStartDate.toISOString(),
         endsAt: new Date(
            livestreamStartDate.getTime() +
               (livestream.duration || 45) * 60 * 1000
         ).toISOString(),
      }

      const urls = makeUrls(calendarEvent)

      return sendLivestreamRegistrationConfirmationEmail({
         eventCalendarUrls: urls,
         livestream_id: livestream.id,
         recipientEmail: user.email,
         user_first_name: userData.firstName,
         timezone: userData.timezone,
         regular_date: livestream.start.toDate().toString(),
         duration_date: livestream.duration,
         livestream_date: DateUtil.getPrettyDateWithoutHour(
            livestream.start.toDate()
         ),
         company_name: livestream.company,
         company_logo_url: livestream.companyLogoUrl,
         company_background_image_url: livestream.backgroundImageUrl,
         livestream_title: livestream.title,
         livestream_link: linkToLivestream,
      })
   }

   sendPhysicalEventEmailRegistrationConfirmation = (user, userData, event) => {
      const sendPhysicalEventRegistrationConfirmation =
         this.functions.httpsCallable(
            "sendPhysicalEventRegistrationConfirmationEmail_eu"
         )
      return sendPhysicalEventRegistrationConfirmation({
         recipientEmail: user.email,
         user_first_name: userData.firstName,
         event_date: DateUtil.getPrettyDateWithoutHour(event.start.toDate()),
         company_name: event.company,
         company_logo_url: event.companyLogoUrl,
         event_title: event.title,
         event_address: event.address,
      })
   }

   sendHybridEventEmailRegistrationConfirmation = (user, userData, event) => {
      const sendHybridEventEmailRegistrationConfirmation =
         this.functions.httpsCallable(
            "sendHybridEventRegistrationConfirmationEmail_eu"
         )
      return sendHybridEventEmailRegistrationConfirmation({
         recipientEmail: user.email,
         user_first_name: userData.firstName,
         event_date: DateUtil.getPrettyDateWithoutHour(event.start.toDate()),
         company_name: event.company,
         company_logo_url: event.companyLogoUrl,
         event_title: event.title,
         event_address: event.address,
         livestream_link: `https://careerfairy.io/upcoming-livestream/${event.id}`,
      })
   }

   deleteUserAccount = () => {
      return this.functions.httpsCallable("deleteLoggedInUserAccount_eu")()
   }

   // *** Auth API ***

   createUserWithEmailAndPassword = (email, password) => {
      return this.auth.createUserWithEmailAndPassword(email, password)
   }

   signInWithEmailAndPassword = (email: string, password: string) => {
      return this.auth.signInWithEmailAndPassword(email.trim(), password)
   }

   doSignOut = () => this.auth.signOut().then(clearFirestoreCache)

   getUniversitiesFromCountryCode = (countryCode) => {
      let ref = this.firestore
         .collection("universitiesByCountry")
         .doc(countryCode)
      return ref.get()
   }

   getUniversitiesFromMultipleCountryCode = async (countryCodes: string[]) => {
      let ref: any = this.firestore.collection("universitiesByCountry")

      if (countryCodes.length > 0) {
         ref = ref.where("countryId", "in", countryCodes)
      }

      return await ref.get()
   }

   // *** Firestore API ***

   getStreamRef = (router): DocumentReference<LivestreamEvent> => {
      const {
         query: { breakoutRoomId, livestreamId },
      } = router
      if (!livestreamId) return null

      const streamConverter = createCompatGenericConverter<LivestreamEvent>()

      let ref = this.firestore
         .collection("livestreams")
         .withConverter(streamConverter)
         .doc(livestreamId)
      if (breakoutRoomId) {
         ref = ref
            .collection("breakoutRooms")
            .withConverter(streamConverter)
            .doc(breakoutRoomId)
      }
      return ref
   }

   getBreakoutRoomRef = () => {}

   // USER

   getUserData = (userEmail) => {
      let ref = this.firestore.collection("userData").doc(userEmail)
      return ref.get()
   }

   listenToUserData = (userEmail, callback) => {
      let ref = this.firestore.collection("userData").doc(userEmail)
      return ref.onSnapshot(callback)
   }

   setUserData = (
      userEmail,
      firstName,
      lastName,
      linkedinUrl,
      universityCode,
      universityName,
      universityCountryCode
   ) => {
      let ref = this.firestore.collection("userData").doc(userEmail)
      return ref.update({
         id: userEmail,
         userEmail,
         firstName,
         lastName,
         linkedinUrl,
         universityCode,
         universityName,
         universityCountryCode,
      })
   }

   setUserUnsubscribed = (userEmail) => {
      let ref = this.firestore.collection("userData").doc(userEmail)
      return ref.update({
         unsubscribed: true,
      })
   }

   listenToGroups = (callback) => {
      let groupRefs = this.firestore
         .collection("careerCenterData")
         .where("test", "==", false)
      return groupRefs.onSnapshot(callback)
   }

   // COMPANIES

   getCompanies = () => {
      let ref = this.firestore.collection("companyData").orderBy("rank", "asc")
      return ref.get()
   }

   getCompanyById = (companyId) => {
      let ref = this.firestore.collection("companyData").doc(companyId)
      return ref.get()
   }

   getCompanyPositions = (companyName) => {
      let ref = this.firestore
         .collection("companyData")
         .doc(companyName.replace(/\s/g, ""))
         .collection("currentPositions")
      return ref.get()
   }

   getCompanyVideos = (companyId) => {
      let ref = this.firestore
         .collection("videos")
         .where("companyId", "==", companyId)
         .orderBy("priority", "asc")
      return ref.get()
   }

   updateCareerCenter = (
      currentGroup: Group,
      newCareerCenter: Partial<Group>
   ) => {
      // We want to get the future state of the group
      const updatedGroup = Object.assign({}, currentGroup, newCareerCenter)

      let ref = this.firestore
         .collection("careerCenterData")
         .doc(currentGroup.id)

      // In the update function, we need to update the triGrams field with the help of the future state of the group
      const toUpdate: Partial<Group> = {
         ...newCareerCenter,
         triGrams: groupTriGrams(updatedGroup.universityName),
      }

      return ref.update(toUpdate)
   }

   deleteCareerCenterFromAllUsers = (careerCenterId) => {
      let batch = this.firestore.batch()
      // get all relevant users
      return this.firestore
         .collection("userData")
         .where("groupIds", "array-contains", `${careerCenterId}`)
         .get()
         .then((querySnapshot) => {
            querySnapshot.docs.forEach((userDoc, index) => {
               // get the user document
               const userRef = userDoc.ref
               let userData = userDoc.data()
               // remove the careerCenterId from the groupIds Array in the userData field
               // remove the careerCenterId from the registeredGroups array of Objects
               if (userData.registeredGroups) {
                  let registeredGroups = userData.registeredGroups
                  const filteredRegisteredGroups = registeredGroups.filter(
                     (group) => group.groupId !== careerCenterId
                  )
                  batch.update(userRef, {
                     registeredGroups: filteredRegisteredGroups,
                     groupIds:
                        firebase.firestore.FieldValue.arrayRemove(
                           careerCenterId
                        ),
                  })
               } else {
                  batch.update(userRef, {
                     groupIds:
                        firebase.firestore.FieldValue.arrayRemove(
                           careerCenterId
                        ),
                  })
               }
               if (index === querySnapshot.size - 1) {
                  // Once done looping, return the batch commit
                  return batch.commit()
               }
            })
            return batch.commit()
         })
   }

   listenToCurrentVideo = (streamRef, callback) => {
      let ref = streamRef.collection("videos").doc("video")
      return ref.onSnapshot(callback)
   }

   updateCurrentVideoState = (streamRef, state) => {
      let ref = streamRef.collection("videos").doc("video")
      return ref.update({
         ...state,
         lastPlayed:
            state.state === "playing" ? this.getServerTimestamp() : null,
      })
   }

   setCurrentVideo = (streamRef, url, updater) => {
      let ref = streamRef.collection("videos").doc("video")
      const secondsIn = Number(getQueryStringFromUrl(url, "t"))
      return ref.set({
         url: url,
         second: secondsIn || 0,
         state: "playing",
         updater,
         lastPlayed: this.getServerTimestamp(),
      })
   }

   stopSharingYoutubeVideo = (streamRef) => {
      const batch = this.firestore.batch()
      const videoRef = streamRef.collection("videos").doc("video")
      batch.delete(videoRef)
      batch.update(streamRef, {
         mode: "default",
      })
      return batch.commit()
   }

   // MENTORS

   getMentors = () => {
      let ref = this.firestore.collection("mentors")
      return ref.get()
   }

   // CREATE_LIVESTREAMS

   addLivestream = async (livestream, collection, author = {}, promotion) => {
      try {
         const ratings: EventRating[] = [
            {
               question: `How happy are you with the content shared by ${livestream.company}?`,
               id: "company",
               appearAfter: 30,
            },
            {
               question: `Are you more likely to apply to ${livestream.company} thanks to this live stream?`,
               id: "willApply",
               appearAfter: 40,
               isSentimentRating: true,
            },
            {
               question:
                  "How would you rate this live stream experience? Any feedback you would like to share?",
               id: "overall",
               appearAfter: 45,
               hasText: true,
            },
         ]

         let batch = this.firestore.batch()
         let livestreamsRef = this.firestore.collection(collection).doc()
         livestream.author = author
         livestream.created = this.getServerTimestamp()
         livestream.currentSpeakerId = livestreamsRef.id
         livestream.id = livestreamsRef.id
         batch.set(livestreamsRef, livestream, { merge: true })

         if (collection === "livestreams") {
            let tokenRef = this.firestore
               .collection(collection)
               .doc(livestreamsRef.id)
               .collection("tokens")
               .doc("secureToken")

            let token = uuidv4()
            batch.set(tokenRef, {
               value: token,
            })
         }

         for (const rating of ratings) {
            let ratingRef = this.firestore
               .collection(collection)
               .doc(livestreamsRef.id)
               .collection("rating")
               .doc(rating.id)

            const toSet: EventRating = {
               question: rating.question,
               appearAfter: rating.appearAfter,
               hasText: Boolean(rating.hasText),
               id: rating.id,
            }
            batch.set(ratingRef, toSet)
         }

         const promotionsRef = this.firestore
            .collection(collection)
            .doc(livestreamsRef.id)
            .collection("promotions")
            .doc("promotions")

         const promotionToUpdate: LivestreamPromotions = {
            ...promotion,
            livestreamId: livestreamsRef.id,
         }

         batch.set(promotionsRef, promotionToUpdate, { merge: true })

         await batch.commit()
         return livestreamsRef.id
      } catch (error) {
         return error
      }
   }

   getGroupsInfo = async (arrayOfGroupIds) => {
      const groupsDictionary: Record<string, Group> = {}
      let i,
         j,
         tempArray,
         chunk = 800
      for (i = 0, j = arrayOfGroupIds.length; i < j; i += chunk) {
         tempArray = arrayOfGroupIds.slice(i, i + chunk)
         const groupSnaps = await Promise.all(
            tempArray
               .filter((groupId) => groupId)
               .map((groupId) =>
                  this.firestore
                     .collection("careerCenterData")
                     .doc(groupId)
                     .get()
               )
         )
         groupSnaps.forEach((doc) => {
            if (doc.exists) {
               groupsDictionary[doc.id] = {
                  id: doc.id,
                  ...doc.data(),
               }
            }
         })
      }
      return groupsDictionary
   }

   deleteLivestream = async (livestreamId, collection) => {
      let batch = this.firestore.batch()
      let livestreamsRef = this.firestore
         .collection(collection)
         .doc(livestreamId)
      batch.delete(livestreamsRef)
      await batch.commit()
   }

   addDraftLivestream = async (livestream) => {
      let batch = this.firestore.batch()
      let livestreamsRef = this.firestore.collection("draftLivestreams").doc()
      livestream.currentSpeakerId = livestreamsRef.id
      livestream.id = livestreamsRef.id
      livestream.created = this.getServerTimestamp()
      batch.set(livestreamsRef, livestream)
      await batch.commit()
      return livestreamsRef.id
   }

   updateLivestream = async (livestream, collection, promotion) => {
      const batch = this.firestore.batch()
      let livestreamsRef = this.firestore
         .collection(collection)
         .doc(livestream.id)
      livestream.lastUpdated = this.getServerTimestamp()

      batch.set(livestreamsRef, livestream, { merge: true })

      const promotionRef = this.firestore
         .collection(collection)
         .doc(livestream.id)
         .collection("promotions")
         .doc("promotions")

      batch.set(promotionRef, promotion, { merge: true })

      await batch.commit()
      return livestream.id
   }

   getStreamById = (streamId, collection) => {
      let livestreamsRef = this.firestore.collection(collection).doc(streamId)
      return livestreamsRef.get()
   }

   getStreamSpeakers = (streamId, collection) => {
      let ref = this.firestore
         .collection(collection)
         .doc(streamId)
         .collection("speakers")
      return ref.get()
   }

   getStreamPromotions = (streamId, collection) => {
      const ref = this.firestore
         .collection(collection)
         .doc(streamId)
         .collection("promotions")
         .doc("promotions")

      return ref.get()
   }

   //TEST_LIVESTREAMS

   createTestLivestream = () => {
      let livestreamCollRef = this.firestore.collection("livestreams")

      return livestreamCollRef.add({
         companyId: "CareerFairy",
         test: true,
         universities: [],
         createdAt: this.getServerTimestamp(),
         start: firebase.firestore.Timestamp.fromDate(
            new Date("March 17, 2020 03:24:00")
         ),
      })
   }

   setupTestLivestream = (
      livestreamId,
      testChats,
      testQuestions,
      testPolls
   ) => {
      const batch = this.firestore.batch()
      let livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
      batch.update(livestreamRef, {
         currentSpeakerId: livestreamId,
      })
      let chatsRef = livestreamRef.collection("chatEntries")
      testChats.forEach((chat) => {
         let docRef = chatsRef.doc()
         batch.set(docRef, chat)
      })
      let questionsRef = livestreamRef.collection("questions")
      testQuestions.forEach((question) => {
         let docRef = questionsRef.doc()
         batch.set(docRef, question)
      })
      let pollsRef = livestreamRef.collection("polls")
      testPolls.forEach((poll) => {
         let docRef = pollsRef.doc()
         batch.set(docRef, poll)
      })
      return batch.commit()
   }
   resetTestStream = async (streamRef, testChats, testQuestions, testPolls) => {
      let batch = this.firestore.batch()

      // reset hand raise and current speaker and activeCallToActionIds
      batch.update(streamRef, {
         handRaiseActive: false,
         currentSpeakerId: streamRef.id,
         activeCallToActionIds: [],
      })

      // Declare all the refs
      let chatsRef = streamRef.collection("chatEntries")
      let questionsRef = streamRef.collection("questions")
      let pollsRef = streamRef.collection("polls")
      let callToActionsRef = streamRef.collection("callToActions")

      // Delete all existing docs
      const questionsDocs = await questionsRef.get()
      if (!questionsDocs.empty) {
         questionsDocs.forEach((doc) => {
            let docRef = doc.ref
            batch.delete(docRef)
         })
      }

      const chatsDocs = await chatsRef.get()
      if (!chatsDocs.empty) {
         chatsDocs.forEach((doc) => {
            let docRef = doc.ref
            batch.delete(docRef)
         })
      }

      const pollsDocs = await pollsRef.get()
      if (!pollsDocs.empty) {
         pollsDocs.forEach((doc) => {
            let docRef = doc.ref
            batch.delete(docRef)
         })
      }

      const callToActionDocs = await callToActionsRef.get()
      if (!callToActionDocs.empty) {
         callToActionDocs.forEach((doc) => {
            let docRef = doc.ref
            batch.delete(docRef)
         })
      }

      // Add in the new Docs

      testQuestions.forEach((question) => {
         let docRef = questionsRef.doc()
         batch.set(docRef, question)
      })

      testChats.forEach((chat) => {
         let docRef = chatsRef.doc()
         batch.set(docRef, chat)
      })
      testPolls.forEach((poll) => {
         let docRef = pollsRef.doc()
         batch.set(docRef, poll)
      })

      return batch.commit()
   }

   //SCHEDULED_LIVESTREAMS

   getScheduledLivestreamById = (livestreamId) => {
      let ref = this.firestore.collection("livestreams").doc(livestreamId)
      return ref.get()
   }

   setMainStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
      let ref = this.firestore.collection("livestreams").doc(livestreamId)
      return ref.update({
         streamIds: [streamId],
      })
   }

   addStreamIdToLivestreamStreamers = (livestreamId, streamId) => {
      let ref = this.firestore.collection("livestreams").doc(livestreamId)
      return ref.update({
         streamIds: firebase.firestore.FieldValue.arrayUnion(streamId),
      })
   }

   removeStreamIdFromLivestreamStreamers = (livestreamId, streamId) => {
      let ref = this.firestore.collection("livestreams").doc(livestreamId)
      return ref.update({
         streamIds: firebase.firestore.FieldValue.arrayRemove(streamId),
      })
   }

   setLivestreamMode = (streamRef, mode) => {
      return streamRef.update({
         mode: mode,
      })
   }

   setDesktopMode = (streamRef, mode, screenSharerId) => {
      return streamRef.update({
         mode,
         screenSharerId,
      })
   }

   setLivestreamSpeakerSwitchMode = (livestreamId, mode) => {
      let ref = this.firestore.collection("livestreams").doc(livestreamId)
      return ref.update({
         speakerSwitchMode: mode,
      })
   }

   setLivestreamCurrentSpeakerId = (streamRef, id) => {
      return streamRef?.update({
         currentSpeakerId: id,
      })
   }

   setLivestreamPresentation = (livestreamId, downloadUrl) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("presentations")
         .doc("presentation")
      return ref.set({
         downloadUrl: downloadUrl,
         page: 1,
      })
   }

   increaseLivestreamPresentationPageNumber = (
      livestreamId: string,
      value: number
   ) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("presentations")
         .doc("presentation")

      return ref.update({
         page: firebase.firestore.FieldValue.increment(value),
      })
   }

   listenToLivestreamPresentation = (livestreamId, callback) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("presentations")
         .doc("presentation")
      return ref.onSnapshot(callback)
   }

   listenToScheduledLivestreamById = (livestreamId, callback) => {
      let ref = this.firestore.collection("livestreams").doc(livestreamId)
      return ref.onSnapshot(callback)
   }

   listenToLiveStreamsByUniversityId = (universityId, callback) => {
      const currentTime = new Date()
      let ref = this.firestore
         .collection("livestreams")
         .where("universities", "array-contains", universityId)
         .where("test", "==", false)
         .where("start", ">", currentTime)
         .orderBy("start", "asc")
      return ref.onSnapshot(callback)
   }

   listenToUpcomingLiveStreamsByGroupId = (groupId, callback) => {
      const ninetyMinutesInMilliseconds = 1000 * 60 * 90
      let ref = this.firestore
         .collection("livestreams")
         .where("groupIds", "array-contains", groupId)
         .where("test", "==", false)
         .where(
            "start",
            ">",
            new Date(Date.now() - ninetyMinutesInMilliseconds)
         )
         .orderBy("start", "asc")
      return ref.onSnapshot(callback)
   }

   queryDraftLiveStreamsByGroupId = (groupId) => {
      return this.firestore
         .collection("draftLivestreams")
         .where("groupIds", "array-contains", groupId)
         .orderBy("start", "asc")
   }

   listenToDraftLiveStreamsByGroupId = (groupId, callback) => {
      let ref = this.firestore
         .collection("draftLivestreams")
         .where("groupIds", "array-contains", groupId)
         .orderBy("start", "asc")
      return ref.onSnapshot(callback)
   }

   getPastLiveStreamsByGroupId = (groupId) => {
      let START_DATE_FOR_REPORTED_EVENTS = "September 1, 2020 00:00:00"
      const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45
      let ref = this.firestore
         .collection("livestreams")
         .where("test", "==", false)
         .where("groupIds", "array-contains", groupId)
         .where(
            "start",
            "<",
            new Date(Date.now() - fortyFiveMinutesInMilliseconds)
         )
         .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
         .orderBy("start", "desc")
      return ref.get()
   }

   listenToPastLiveStreamsByGroupId = (groupId, callback) => {
      let ref = this.firestore
         .collection("livestreams")
         .where("test", "==", false)
         .where("groupIds", "array-contains", groupId)
         .where(
            "start",
            "<",
            new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS)
         )
         .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
         .orderBy("start", "desc")
      return ref.onSnapshot(callback)
   }

   getLivestreamSpeakers = (livestreamId) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("speakers")
      return ref.get()
   }

   getLivestreamSecureToken = (livestreamId) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("tokens")
         .doc("secureToken")
      return ref.get()
   }
   getLivestreamSecureTokenWithRef = (streamRef) => {
      let ref = streamRef.collection("tokens").doc("secureToken")
      return ref.get()
   }

   getBreakoutRoomSecureToken = (livestreamId, breakoutRoomId) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("breakoutRooms")
         .doc(breakoutRoomId)
         .collection("tokens")
         .doc("secureToken")
      return ref.get()
   }

   listenToUpcomingLivestreamQuestions = (streamRef) => {
      return streamRef
         .collection("questions")
         .orderBy("type", "asc")
         .orderBy("votes", "desc")
         .orderBy("timestamp", "asc")
         .where("type", "!=", "done")
   }

   listenToPastLivestreamQuestions = (streamRef) => {
      return streamRef.collection("questions").where("type", "==", "done")
   }

   deleteLivestreamQuestion = (
      streamRef: DocumentReference<firebase.firestore.DocumentData>,
      questionId: string
   ) => {
      return streamRef.collection("questions").doc(questionId).delete()
   }

   listenToLivestreamQuestions = (livestreamId, callback) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .orderBy("votes", "desc")
      return ref.onSnapshot(callback)
   }
   livestreamQuestionsQuery = (livestreamId, sortType = "votes") => {
      if (!livestreamId) return
      return this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .orderBy(sortType, "desc")
   }

   listenToQuestionComments = (streamRef, questionId, callback) => {
      let ref = streamRef
         .collection("questions")
         .doc(questionId)
         .collection("comments")
         .orderBy("timestamp", "asc")
      return ref.onSnapshot(callback)
   }

   updateSpeakersInLivestream = (livestreamRef, speaker) => {
      return this.firestore.runTransaction((transaction) => {
         return transaction.get(livestreamRef).then((livestreamDoc) => {
            let livestream: any = livestreamDoc.data()
            let updatedSpeakers =
               livestream.liveSpeakers?.filter(
                  (existingSpeaker) => existingSpeaker.id !== speaker.id
               ) || []
            if (updatedSpeakers && updatedSpeakers.length > 0) {
               updatedSpeakers.forEach((existingSpeaker) => {
                  if (existingSpeaker.speakerUuid === speaker.speakerUuid) {
                     delete existingSpeaker.speakerUuid
                  }
               })
            }
            updatedSpeakers.push(speaker)
            transaction.update(livestreamRef, {
               liveSpeakers: updatedSpeakers,
            })
         })
      })
   }

   addSpeakerInLivestream = (livestreamRef, speaker) => {
      return this.firestore.runTransaction((transaction) => {
         return transaction.get(livestreamRef).then((livestreamDoc) => {
            let livestream: any = livestreamDoc.data()
            let speakerRef = livestreamRef.collection("speakers").doc()
            speaker.id = speakerRef.id
            let updatedSpeakers = livestream.liveSpeakers
               ? [...livestream.liveSpeakers]
               : []
            updatedSpeakers.forEach((existingSpeaker) => {
               if (existingSpeaker.speakerUuid === speaker.speakerUuid) {
                  delete existingSpeaker.speakerUuid
               }
            })
            updatedSpeakers.push(speaker)
            transaction.update(livestreamRef, {
               liveSpeakers: updatedSpeakers,
            })
         })
      })
   }

   putQuestionComment = (streamRef, questionId, comment) => {
      let ref = streamRef
         .collection("questions")
         .doc(questionId)
         .collection("comments")
      return ref.add({ ...comment, timestamp: this.getServerTimestamp() })
   }

   putQuestionCommentWithTransaction = async (
      livestreamRef,
      questionId,
      comment
   ) => {
      let questionRef = livestreamRef.collection("questions").doc(questionId)
      let commentRef = livestreamRef
         .collection("questions")
         .doc(questionId)
         .collection("comments")
         .doc()
      const newComment = {
         ...comment,
         id: commentRef.id,
         timestamp: this.getServerTimestamp(),
      }

      return this.firestore.runTransaction((transaction) => {
         return transaction.get(questionRef).then((question) => {
            if (question.exists) {
               const questionData: any = question.data()
               const questionDataToUpdate: any = {
                  numberOfComments: firebase.firestore.FieldValue.increment(1),
               }
               if (!questionData.firstComment) {
                  questionDataToUpdate.firstComment = newComment
               }
               transaction.update(questionRef, questionDataToUpdate)
               transaction.set(commentRef, newComment)
            }
         })
      })
   }

   putLivestreamQuestion = (livestreamId, question) => {
      question.timestamp = firebase.firestore.Timestamp.fromDate(new Date())
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
      return ref.add(question)
   }

   addLivestreamQuestion = (
      streamRef,
      question: Omit<LivestreamQuestion, "id" | "timestamp">
   ) => {
      const ref = streamRef.collection("questions")
      const addQuestionData: Omit<LivestreamQuestion, "id"> = {
         ...question,
         timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
      }
      return ref.add(addQuestionData)
   }

   upvoteLivestreamQuestion = (livestreamId, question, userEmail) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .doc(question.id)

      return ref.update({
         votes: firebase.firestore.FieldValue.increment(1),
         emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail),
      })
   }

   upvoteLivestreamQuestionWithRef = (streamRef, question, userEmail) => {
      let ref = streamRef.collection("questions").doc(question.id)
      return ref.update({
         votes: firebase.firestore.FieldValue.increment(1),
         emailOfVoters: firebase.firestore.FieldValue.arrayUnion(userEmail),
      })
   }

   putLivestreamComment = (livestreamId, comment) => {
      comment.timestamp = firebase.firestore.Timestamp.fromDate(new Date())
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("comments")
      return ref.add(comment)
   }

   listenToChatEntries = (
      streamRef: DocumentReference<firebase.firestore.DocumentData>,
      limit: number,
      callback: OnSnapshotCallback<LivestreamChatEntry>
   ) => {
      let ref = streamRef
         .collection("chatEntries")
         .limit(limit)
         .orderBy("timestamp", "desc")
      return ref.onSnapshot(callback)
   }

   deleteChatEntry = (
      streamRef: DocumentReference<firebase.firestore.DocumentData>,
      chatEntryId: string
   ) => {
      let ref = streamRef.collection("chatEntries").doc(chatEntryId)
      return ref.delete()
   }

   deleteAllChatEntries = async (
      streamRef: DocumentReference<firebase.firestore.DocumentData>
   ) => {
      const snaps = await streamRef.collection("chatEntries").get()

      return Promise.allSettled(
         snaps.docs.map((doc) => {
            return doc.ref.delete().catch(console.error)
         })
      )
   }

   putChatEntry = (streamRef, chatEntry) => {
      chatEntry.timestamp = this.getServerTimestamp()
      const newChatEntry = {
         ...chatEntry,
         laughing: [],
         wow: [],
         heart: [],
         thumbsUp: [],
      }
      let ref = streamRef.collection("chatEntries")
      return ref.add(newChatEntry)
   }

   emoteComment = (streamRef, chatEntryId, fieldProp, userEmail) => {
      const otherProps = ["wow", "laughing", "heart", "thumbsUp"].filter(
         (prop) => prop !== fieldProp
      )
      const chatEntryRef = streamRef.collection("chatEntries").doc(chatEntryId)
      const data = {
         [fieldProp]: firebase.firestore.FieldValue.arrayUnion(userEmail),
      }
      otherProps.forEach((otherProp) => {
         data[otherProp] = firebase.firestore.FieldValue.arrayRemove(userEmail)
      })
      return chatEntryRef.update(data)
   }
   unEmoteComment = (streamRef, chatEntryId, fieldProp, userEmail) => {
      const chatEntryRef = streamRef.collection("chatEntries").doc(chatEntryId)
      return chatEntryRef.update({
         [fieldProp]: firebase.firestore.FieldValue.arrayRemove(userEmail),
      })
   }

   setLivestreamHasStarted = (hasStarted, streamRef) => {
      const data: any = {
         hasStarted,
      }

      data.hasEnded = !hasStarted

      return streamRef.update(data)
   }

   getDetailLivestreamCareerCenters = (groupIds: string[]) => {
      let ref = this.firestore
         .collection("careerCenterData")
         .where("test", "==", false)
         .where("groupId", "in", groupIds)
         .withConverter(createCompatGenericConverter<Group>())
      return ref.get()
   }

   goToNextLivestreamQuestion = (
      previousCurrentQuestionId,
      newCurrentQuestionId,
      streamRef
   ) => {
      let batch = this.firestore.batch()
      if (previousCurrentQuestionId) {
         let ref = streamRef
            .collection("questions")
            .doc(previousCurrentQuestionId)
         batch.update(ref, { type: "done" })
      }
      let ref = streamRef.collection("questions").doc(newCurrentQuestionId)
      batch.update(ref, { type: "current" })
      return batch.commit()
   }

   removeLivestreamQuestion = (livestreamId, question) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("questions")
         .doc(question.id)

      return ref.update({
         type: "removed",
      })
   }

   deleteCareerCenter = (careerCenterId) => {
      let careerCenterRef = this.firestore
         .collection("careerCenterData")
         .doc(careerCenterId)
      return careerCenterRef.delete()
   }

   getCareerCenterByUniversityId = (universityId) => {
      let ref = this.firestore
         .collection("careerCenterData")
         .where("test", "==", false)
         .where("universityId", "==", universityId)
      return ref.get()
   }

   listenToCareerCenterById = (groupId, callback) => {
      let ref = this.firestore.collection("careerCenterData").doc(groupId)
      return ref.onSnapshot(callback)
   }

   getAllCareerCenters = () => {
      let ref = this.firestore
         .collection("careerCenterData")
         .where("test", "==", false)
      return ref.get()
   }

   getCareerCentersByGroupId = async (
      arrayOfIds: string[]
   ): Promise<Group[]> => {
      let groups: Group[] = []
      for (const id of arrayOfIds) {
         const snapshot = await this.firestore
            .collection("careerCenterData")
            .doc(id)
            .withConverter(createCompatGenericConverter<Group>())
            .get()
         if (snapshot.exists) {
            groups.push(snapshot.data())
         }
      }
      return groups
   }

   getGroupsByGroupId = async (arrayOfIds = [""]) => {
      let groups = []
      let i,
         j,
         temparray,
         chunk = 10
      for (i = 0, j = arrayOfIds.length; i < j; i += chunk) {
         temparray = arrayOfIds.slice(i, i + chunk)
         const snapshots = await this.firestore
            .collection("careerCenterData")
            .where("groupId", "in", temparray)
            .get()
         const snapGroups = snapshots.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
         }))
         groups = [...groups, ...snapGroups]
      }
      return groups
   }

   /**
    * Get firestore users from an array of emails.
    * @param {Array<string>} arrayOfEmails – Array of email strings
    * @param {({withEmpty: boolean})} options – Config object for the method
    * @return {Array<Object>} Returns the image url with the correct size appended to it.
    */
   getUsersByEmail = async (
      arrayOfEmails = [],
      options = { withEmpty: false }
   ) => {
      let totalUsers = []
      let i,
         j,
         tempArray,
         chunk = 800
      for (i = 0, j = arrayOfEmails.length; i < j; i += chunk) {
         tempArray = arrayOfEmails.slice(i, i + chunk)
         const userSnaps = await Promise.all(
            tempArray
               .filter((email) => email)
               .map((email) =>
                  this.firestore.collection("userData").doc(email).get()
               )
         )
         let newUsers
         if (options.withEmpty) {
            newUsers = userSnaps.map((doc) => ({ id: doc.id, ...doc.data() }))
         } else {
            newUsers = userSnaps
               .filter((doc) => doc.exists)
               .map((doc) => ({ id: doc.id, ...doc.data() }))
         }
         totalUsers = [...totalUsers, ...newUsers]
      }
      return totalUsers
   }

   getFollowingGroups = async (groupIds = []) => {
      const uniqueGroupIds = Array.from(new Set(groupIds))
      const groupSnaps = await Promise.all(
         uniqueGroupIds.map((groupId) =>
            this.firestore.collection("careerCenterData").doc(groupId).get()
         )
      )
      return groupSnaps
         .filter((doc) => doc.exists)
         .map((doc) => ({ id: doc.id, ...doc.data() }))
   }

   getFollowingGroupsWithCache = async (groupIds = []) => {
      const uniqueGroupIds = Array.from(new Set(groupIds))
      const getFromCache = async (groupId) => {
         let snap: any = { notInCache: true, groupId }
         try {
            snap = await this.firestore
               .collection("careerCenterData")
               .doc(groupId)
               .get({ source: "cache" })
         } catch (e) {}
         return snap
      }
      const groupSnapsFromCache = await Promise.all(
         uniqueGroupIds.map((groupId) => getFromCache(groupId))
      )
      const groupSnapsFromServer = await Promise.all(
         groupSnapsFromCache
            .filter((doc) => doc.notInCache)
            .map(({ groupId }) => {
               return this.firestore
                  .collection("careerCenterData")
                  .doc(groupId)
                  .get()
            })
      )
      return [...groupSnapsFromCache, ...groupSnapsFromServer]
         .filter((doc) => doc.exists && !doc.notInCache)
         .map((doc) => ({ id: doc.id, ...doc.data() }))
   }

   getGroupsWithIds = async (arrayOfGroupIds) => {
      return await this.getFollowingGroups(arrayOfGroupIds)
   }

   getFeaturedCompanies = async () => {
      const ref = this.firestore
         .collection("careerCenterData")
         .where("featured", "==", true)
      return ref.get()
   }

   listenToJoinedGroups = (groupIds, callback) => {
      let ref = this.firestore
         .collection("careerCenterData")
         .where("groupId", "in", groupIds)
      return ref.onSnapshot(callback)
   }

   /*
    * Call to action methods
    * */

   createCallToAction = async (streamRef, values) => {
      let callToActionRef = streamRef.collection("callToActions").doc()

      const callToActionData = {
         buttonText: values.buttonText,
         buttonUrl: values.buttonUrl,
         imageUrl: values.imageUrl || null,
         type: values.type,
         message: values.message,
         created: this.getServerTimestamp(),
         numberOfUsersWhoClickedLink: 0,
         numberOfUsersWhoDismissed: 0,
         updated: null,
         sent: null,
         stopped: null,
         active: false,
         isForTutorial: values.isForTutorial,
      }
      const enhancedCallToActionData = this.addCtaExtraData(
         callToActionData,
         values
      )

      await callToActionRef.set(enhancedCallToActionData)

      return callToActionRef.id
   }

   updateCallToAction = (streamRef, callToActionId, newValues) => {
      let callToActionRef = streamRef
         .collection("callToActions")
         .doc(callToActionId)
      const updateData = {
         buttonText: newValues.buttonText,
         buttonUrl: newValues.buttonUrl,
         imageUrl: newValues.imageUrl || null,
         message: newValues.message,
         type: newValues.type,
         updated: this.getServerTimestamp(),
      }
      return callToActionRef.update(this.addCtaExtraData(updateData, newValues))
   }

   addCtaExtraData = (cleanedData, newValues) => {
      const callToActionData = { ...cleanedData }
      if (newValues.type === "social") {
         callToActionData.socialData = {
            socialType: newValues.socialData?.socialType,
         }
      }
      if (newValues.type === "jobPosting") {
         const deadline = newValues.jobData.applicationDeadline
            ? firebase.firestore.Timestamp.fromDate(
                 newValues.jobData.applicationDeadline
              )
            : null
         callToActionData.jobData = {
            applicationDeadline: deadline,
            jobTitle: newValues.jobData?.jobTitle,
            salary: newValues.jobData?.salary,
         }
      }

      return callToActionData
   }

   resendCallToAction = async (streamRef, callToActionId) => {
      let callToActionRef = streamRef
         .collection("callToActions")
         .doc(callToActionId)
      try {
         await this.deactivateCallToAction(streamRef, callToActionId)

         await callToActionRef.update({
            resentAt: this.getServerTimestamp(),
         })

         return await this.activateCallToAction(streamRef, callToActionId)
      } catch (e) {}
   }

   clickOnCallToAction = async (
      streamRef,
      callToActionId,
      userId,
      options = { isDismissAction: false }
   ) => {
      let callToActionRef = streamRef
         .collection("callToActions")
         .doc(callToActionId)

      const isDismissAction = options.isDismissAction

      if (!userId) {
         // Return early and only increment fields when the user is not logged in
         if (isDismissAction) {
            return await callToActionRef.update({
               numberOfUsersWhoDismissed:
                  firebase.firestore.FieldValue.increment(1),
            })
         }
         return await callToActionRef.update({
            numberOfUsersWhoClickedLink:
               firebase.firestore.FieldValue.increment(1),
         })
      }
      let batch = this.firestore.batch()
      let userRef = this.firestore.collection("userData").doc(userId)

      let userInUsersWhoClickedLinkRef = callToActionRef
         .collection("usersWhoClickedLink")
         .doc(userId)

      let userInUsersWhoDismissedRef = callToActionRef
         .collection("usersWhoDismissed")
         .doc(userId)

      const userSnap = await userRef.get()
      if (userSnap.exists) {
         const userData = userSnap.data()
         const userInUsersWhoDismissedSnap =
            await userInUsersWhoDismissedRef.get()
         const userInUsersWhoClickedSnap =
            await userInUsersWhoClickedLinkRef.get()
         const hasAlreadyDismissed = userInUsersWhoDismissedSnap.exists
         const hasAlreadyClicked = userInUsersWhoClickedSnap.exists
         let callToActionUpdateData = {}
         if (isDismissAction && hasAlreadyDismissed) {
            let batch = this.firestore.batch()
            batch.update(userInUsersWhoDismissedRef, {
               ...userData,
               dismissedCallToActionAt: this.getServerTimestamp(),
            })
            batch.update(callToActionRef, {
               numberOfUsersWhoDismissed:
                  firebase.firestore.FieldValue.increment(1),
            })

            return await batch.commit()
         }
         if (!isDismissAction && hasAlreadyClicked) {
            let batch = this.firestore.batch()
            batch.update(userInUsersWhoClickedLinkRef, {
               ...userData,
               clickedCallToActionLinkAt: this.getServerTimestamp(),
            })
            batch.update(callToActionRef, {
               numberOfUsersWhoClickedLink:
                  firebase.firestore.FieldValue.increment(1),
            })
            return await batch.commit()
         }
         if (isDismissAction) {
            batch.set(userInUsersWhoDismissedRef, {
               ...userData,
               dismissedCallToActionAt: this.getServerTimestamp(),
            })
            if (!hasAlreadyDismissed) {
               callToActionUpdateData["numberOfUsersWhoDismissed"] =
                  firebase.firestore.FieldValue.increment(1)
            }

            if (hasAlreadyClicked) {
               // callToActionUpdateData["numberOfUsersWhoClickedLink"] = firebase.firestore.FieldValue.increment(-1)
               // batch.delete(userInUsersWhoClickedLinkRef)
            }
         } else {
            batch.set(userInUsersWhoClickedLinkRef, {
               ...userData,
               clickedCallToActionLinkAt: this.getServerTimestamp(),
            })
            if (!hasAlreadyClicked) {
               callToActionUpdateData["numberOfUsersWhoClickedLink"] =
                  firebase.firestore.FieldValue.increment(1)
            }

            if (hasAlreadyDismissed) {
               //     callToActionUpdateData["numberOfUsersWhoDismissed"] = firebase.firestore.FieldValue.increment(-1)
               //     batch.delete(userInUsersWhoDismissedRef)
            }
         }
         batch.update(callToActionRef, callToActionUpdateData)

         return await batch.commit()
      }
   }

   dismissCallToAction = async (streamRef, callToActionId, userId) => {
      return await this.clickOnCallToAction(streamRef, callToActionId, userId, {
         isDismissAction: true,
      })
   }

   deleteCallToAction = (streamRef, callToActionId) => {
      let batch = this.firestore.batch()

      let callToActionRef = streamRef
         .collection("callToActions")
         .doc(callToActionId)

      batch.delete(callToActionRef)

      batch.update(streamRef, {
         activeCallToActionIds:
            firebase.firestore.FieldValue.arrayRemove(callToActionId),
      })

      return batch.commit()
   }

   activateCallToAction = async (streamRef, callToActionId) => {
      let batch = this.firestore.batch()

      let callToActionRef = streamRef
         .collection("callToActions")
         .doc(callToActionId)

      const callToActionSnap = await callToActionRef.get()

      if (callToActionSnap.exists) {
         batch.update(callToActionRef, {
            sent: this.getServerTimestamp(),
            active: true,
            resentAt: this.getServerTimestamp(),
         })

         batch.update(streamRef, {
            activeCallToActionIds:
               firebase.firestore.FieldValue.arrayUnion(callToActionId),
         })

         return await batch.commit()
      }
   }

   deactivateCallToAction = async (streamRef, callToActionId) => {
      let batch = this.firestore.batch()
      let callToActionRef = streamRef
         .collection("callToActions")
         .doc(callToActionId)

      const callToActionSnap = await callToActionRef.get()

      if (callToActionSnap.exists) {
         batch.update(callToActionRef, {
            stopped: this.getServerTimestamp(),
            active: false,
         })

         batch.update(streamRef, {
            activeCallToActionIds:
               firebase.firestore.FieldValue.arrayRemove(callToActionId),
         })

         return await batch.commit()
      }
   }

   checkIfUserInteractedWithCallToAction = async (callToActionRef, userId) => {
      let userInUsersWhoClickedLinkRef = callToActionRef
         .collection("usersWhoClickedLink")
         .doc(userId)

      let userInUsersWhoDismissedRef = callToActionRef
         .collection("usersWhoDismissed")
         .doc(userId)

      const callToActionSnap = await callToActionRef.get()
      if (!callToActionSnap.exists) {
         return true
      }

      const callToActionData = callToActionSnap.data()
      const userWhoClickedSnap = await userInUsersWhoClickedLinkRef.get()
      const userWhoDismissedSnap = await userInUsersWhoDismissedRef.get()

      const resentDate = callToActionData.resentAt?.toDate?.() || null

      const userDismissDate =
         userWhoDismissedSnap?.data?.()?.dismissedCallToActionAt?.toDate?.() ||
         null
      const userClickDate =
         userWhoClickedSnap?.data?.()?.clickedCallToActionLinkAt?.toDate?.() ||
         null

      const mostRecentInteraction =
         new Date(userDismissDate) > new Date(userClickDate)
            ? userDismissDate
            : userClickDate

      if (!mostRecentInteraction) return false
      if (!resentDate) {
         return Boolean(
            userWhoClickedSnap.exists || userWhoDismissedSnap.exists
         )
      }

      return resentDate < mostRecentInteraction
   }

   getCallToActionsWithAnArrayOfIds = async (streamRef, callToActionIds) => {
      if (!callToActionIds?.length) return []
      const callToActionsRef = streamRef.collection("callToActions")
      const callToActionSnaps = await Promise.all(
         callToActionIds.map((id) => callToActionsRef.doc(id).get())
      )

      return callToActionSnaps
         .filter((doc) => doc.exists)
         .map((doc) => ({ id: doc.id, ...doc.data() }))
   }

   getCtaIdsThatUserHasNotInteractedWith = async (
      streamRef,
      activeCallToActionIds,
      userId
   ) => {
      const callToActionsRef = streamRef.collection("callToActions")
      const arrayOfCallToActionIdsThatUserHasNotInteractedWith =
         await Promise.all(
            activeCallToActionIds.map(async (id) => {
               if (!userId) return id
               const callToActionRef = callToActionsRef.doc(id)
               const hasChecked =
                  await this.checkIfUserInteractedWithCallToAction(
                     callToActionRef,
                     userId
                  )
               return hasChecked ? undefined : id
            })
         )
      return arrayOfCallToActionIdsThatUserHasNotInteractedWith.filter(
         (id) => id
      )
   }

   rateLivestream = async (
      livestreamId: string,
      userEmail: string,
      rating: Pick<EventRatingAnswer, "message" | "rating">,
      ratingDoc: EventRating
   ) => {
      const ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc(ratingDoc.id)
         .collection("voters")
         .doc(userEmail)

      return ref.set({
         ...rating,
         timestamp: this.getServerTimestamp(),
      })
   }

   optOutOfRating = (livestreamId, userEmail, ratingId) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc(ratingId)
         .collection("nonVoters")
         .doc(userEmail)
      return ref.set({
         timestamp: this.getServerTimestamp(),
      })
   }

   checkIfUserRated = async (livestreamId, userEmail, typeOfRating) => {
      try {
         let voterInVotersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(typeOfRating)
            .collection("voters")
            .doc(userEmail)
         let voterInNonVotersRef = this.firestore
            .collection("livestreams")
            .doc(livestreamId)
            .collection("rating")
            .doc(typeOfRating)
            .collection("nonVoters")
            .doc(userEmail)
         const voterInVotersSnap = await voterInVotersRef.get()
         const voterInNonVotersSnap = await voterInNonVotersRef.get()
         return voterInVotersSnap.exists || voterInNonVotersSnap.exists
      } catch (e) {
         console.log("-> e", e)
      }
   }

   createLivestreamPoll = (streamRef, pollQuestion, pollOptions) => {
      let ref = streamRef.collection("polls")
      let pollObject = {
         timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
         question: pollQuestion,
         options: pollOptions,
         voters: [],
         state: "upcoming",
      }

      return ref.add(pollObject)
   }

   updateLivestreamPoll = (streamRef, pollId, pollQuestion, pollOptions) => {
      let ref = streamRef.collection("polls").doc(pollId)
      let pollObject = {
         question: pollQuestion,
         options: pollOptions,
      }
      return ref.update(pollObject)
   }

   listenToPollVoters = (livestreamId, pollId, callback) => {
      const pollVotersRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .doc(pollId)
         .collection("voters")
      return pollVotersRef.onSnapshot(callback)
   }
   listenToPollVotersWithStreamRef = (streamRef, pollId, callback) => {
      const pollVotersRef = streamRef
         .collection("polls")
         .doc(pollId)
         .collection("voters")
      return pollVotersRef.onSnapshot(callback)
   }

   listenToVoteOnPoll = (streamRef, pollId, authEmail, callback) => {
      const pollVotersRef = streamRef
         .collection("polls")
         .doc(pollId)
         .collection("voters")
         .doc(authEmail)
      return pollVotersRef.onSnapshot(callback)
   }

   checkIfHasVotedOnPoll = async (livestreamId, pollId, authEmail) => {
      const pollVoterRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .doc(pollId)
         .collection("voters")
         .doc(authEmail)
      const voterSnap = await pollVoterRef.get()
      return voterSnap.exists
   }

   deleteLivestreamPoll = (streamRef, pollId) => {
      let ref = streamRef.collection("polls").doc(pollId)
      return ref.delete()
   }

   listenToPollEntries = (livestreamId, callback) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("polls")
         .orderBy("timestamp", "asc")
      return ref.onSnapshot(callback)
   }
   listenToPollEntriesWithStreamRef = (streamRef, callback) => {
      let ref = streamRef.collection("polls").orderBy("timestamp", "asc")
      return ref.onSnapshot(callback)
   }

   voteForPollOption = (streamRef, pollId, userEmail, optionId) => {
      let pollRef = streamRef
         .collection("polls")
         .doc(pollId)
         .collection("voters")
         .doc(userEmail)
      return pollRef.set({
         optionId: optionId,
         timestamp: this.getServerTimestamp(),
      })

      // return pollRef.update({
      //     [`options.${optionIndex}.votes`]: firebase.firestore.FieldValue.increment(1),
      //     [`options.${optionIndex}.voters`]: firebase.firestore.FieldValue.arrayUnion(userEmail),
      //     voters: firebase.firestore.FieldValue.arrayUnion(userEmail)
      // })
   }

   setPollState = (streamRef, pollId, state) => {
      let ref = streamRef.collection("polls").doc(pollId)
      return ref.update({ state: state })
   }

   listenToHandRaiseState = (streamRef, userEmail, callback) => {
      let ref = streamRef.collection("handRaises").doc(userEmail)
      return ref.onSnapshot(callback)
   }

   listenToHandRaises = (streamRef, callback) => {
      let ref = streamRef.collection("handRaises")
      return ref.onSnapshot(callback)
   }

   listenToActiveHandRaises = (streamRef, callback) => {
      let ref = streamRef
         .collection("handRaises")
         .where("state", "not-in", ["unrequested", "denied"])
      return ref.onSnapshot(callback)
   }

   setHandRaiseMode = async (streamRef, mode) => {
      if (mode === true) {
         return streamRef.update({
            handRaiseActive: mode,
         })
      }
      if (mode === false) {
         const batch = this.firestore.batch()
         const streamHandRaiseSnaps = await streamRef
            .collection("handRaises")
            .get()
         streamHandRaiseSnaps.docs.forEach((snap) => {
            const handRaiseRef = streamRef.collection("handRaises").doc(snap.id)
            batch.delete(handRaiseRef)
         })
         batch.update(streamRef, {
            handRaiseActive: mode,
         })
         return await batch.commit()
      }
   }

   createHandRaiseRequest = (
      streamRef,
      userEmail,
      userData,
      state?: HandRaiseState
   ) => {
      let ref = streamRef.collection("handRaises").doc(userEmail)
      return ref.set({
         state: state || "requested",
         timestamp: this.getServerTimestamp(),
         name: userData.firstName + " " + userData.lastName,
      })
   }

   updateHandRaiseRequest = (streamRef, userEmail, state) => {
      let ref = streamRef.collection("handRaises").doc(userEmail)
      return ref.set(
         {
            state: state,
            timestamp: this.getServerTimestamp(),
         },
         { merge: true }
      )
   }

   listenToPolls = (streamRef, callback) => {
      let ref = streamRef.collection("polls")
      return ref.onSnapshot(callback)
   }

   getPastLivestreams = () => {
      let START_DATE_FOR_REPORTED_EVENTS = "September 1, 2020 00:00:00"
      const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45
      return this.firestore
         .collection("livestreams")
         .where(
            "start",
            "<",
            new Date(Date.now() - fortyFiveMinutesInMilliseconds)
         )
         .where("start", ">", new Date(START_DATE_FOR_REPORTED_EVENTS))
         .where("test", "==", false)
         .orderBy("start", "desc")
         .get()
   }

   getUpcomingLivestreams = (limit) => {
      const fortyFiveMinutesInMilliseconds = 1000 * 60 * 45
      let ref = this.firestore
         .collection("livestreams")
         .where(
            "start",
            ">",
            new Date(Date.now() - fortyFiveMinutesInMilliseconds)
         )
         .where("test", "==", false)
         .orderBy("start", "asc")
      if (limit) {
         ref = ref.limit(limit)
      }
      return ref.get()
   }

   /**
    * @param {string} livestreamId
    * @param userData
    * @param {*[]} groupsWithPolicies
    * @param userAnsweredLivestreamQuestions
    * @param options - {isRecommended: boolean}
    */
   registerToLivestream = async (
      livestreamId: string,
      userData: UserData,
      groupsWithPolicies: GroupWithPolicy[],
      userAnsweredLivestreamQuestions: LivestreamGroupQuestionsMap,
      options: {
         isRecommended?: boolean
      } = {}
   ): Promise<void> => {
      const userQuestionsAndAnswersDict = getLivestreamGroupQuestionAnswers(
         userAnsweredLivestreamQuestions
      )

      const idsOfGroupsWithPolicies = groupsWithPolicies.map(
         (group) => group.id
      )

      let livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)

      const userLivestreamDataRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("userLivestreamData")
         .doc(userData.userEmail)

      const data: UserLivestreamData = {
         livestreamId,
         userId: userData.authId,
         user: {
            ...userData,
         },
         answers: userQuestionsAndAnswersDict,
         registered: {
            // We store the referral info so that it can be used by a cloud function
            // that applies the rewards
            referral: getReferralInformation(),
            // Store the utm params if they exist
            utm: CookiesUtil.getUTMParams(),
            referrer: SessionStorageUtil.getReferrer(),
            // @ts-ignore
            date: this.getServerTimestamp(),
            ...(options.isRecommended && {
               isRecommended: true,
            }),
         },
         // to allow queries for users that didn't participate
         participated: null,
      }

      const batch = this.firestore.batch()

      batch.update(livestreamRef, {
         // To be depreciated
         registeredUsers: firebase.firestore.FieldValue.arrayUnion(
            userData.userEmail
         ),
      })

      batch.set(userLivestreamDataRef, data, { merge: true })

      for (const groupId of idsOfGroupsWithPolicies) {
         // to be depreciated
         let userInPolicyRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("usersInPolicy")
            .doc(userData.userEmail)

         // to be used from now on
         let authUserInPolicyRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
            .collection("authUsersInPolicy")
            .doc(userData.authId)

         batch.set(userInPolicyRef, {
            ...userData,
            dateAgreed: this.getServerTimestamp(),
         })

         batch.set(authUserInPolicyRef, {
            ...userData,
            dateAgreed: this.getServerTimestamp(),
         })
      }

      // Updates the user's questions and answers in the userData/userGroups subcollection
      this.updateUserGroupQuestionAnswers(
         userData.userEmail,
         userQuestionsAndAnswersDict,
         batch
      )

      await batch.commit()
   }

   updateUserGroupQuestionAnswers = async (
      userEmail: string,
      userQuestionsAndAnswersDict: UserLivestreamGroupQuestionAnswers,
      batch: firebase.firestore.WriteBatch
   ) => {
      const userRef = this.firestore.collection("userData").doc(userEmail)
      Object.keys(userQuestionsAndAnswersDict).forEach((groupId) => {
         const userGroupDataRef = userRef.collection("userGroups").doc(groupId)
         Object.keys(userQuestionsAndAnswersDict[groupId]).forEach(
            (questionId) => {
               const answerId = userQuestionsAndAnswersDict[groupId][questionId]

               batch.set(
                  userGroupDataRef,
                  {
                     groupId: groupId,
                     questions: {
                        [questionId]: answerId,
                     },
                  } as Partial<UserGroupData>,
                  { merge: true }
               )
            }
         )
      })
   }

   deregisterFromLivestream = async (
      livestreamId: string,
      userData: UserData
   ) => {
      const { userEmail } = userData
      let livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
      const userLivestreamDataRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("userLivestreamData")
         .doc(userEmail)

      const userLivestreamDataDoc = await userLivestreamDataRef.get()

      const batch = this.firestore.batch()

      if (userLivestreamDataDoc.exists) {
         batch.update(userLivestreamDataRef, {
            registered: null,
            user: userData,
         } as UserLivestreamData)
      }

      batch.update(livestreamRef, {
         registeredUsers: firebase.firestore.FieldValue.arrayRemove(userEmail),
      })

      await batch.commit()
   }

   joinCompanyTalentPool = (
      companyId: string,
      userData: UserData,
      livestream: LivestreamEvent
   ) => {
      let userRef = this.firestore
         .collection("userData")
         .doc(userData.userEmail)
      let streamRef = this.firestore
         .collection("livestreams")
         .doc(livestream.id)
      const userLivestreamDataRef = this.firestore
         .collection("livestreams")
         .doc(livestream.id)
         .collection("userLivestreamData")
         .doc(userData.userEmail)

      recommendationServiceInstance.joinTalentPool(livestream, userData)

      return this.firestore.runTransaction((transaction) => {
         return transaction.get(userRef).then((userSnap) => {
            if (userSnap.exists) {
               const userData = {
                  ...userSnap.data(),
                  id: userSnap.id,
               } as UserData
               transaction.update(userRef, {
                  talentPools:
                     firebase.firestore.FieldValue.arrayUnion(companyId),
               })
               transaction.update(streamRef, {
                  talentPool: firebase.firestore.FieldValue.arrayUnion(
                     userData.userEmail
                  ),
               })

               // insert related talent profiles (for each group id)
               if (livestream.groupIds) {
                  for (const groupId of livestream.groupIds) {
                     const groupTalentEntryRef = userRef
                        .collection("talentProfiles")
                        .doc(groupId)
                     const data: TalentProfile = {
                        id: groupId,
                        groupId,
                        userId: userData.authId,
                        userEmail: userData.userEmail,
                        user: userData,
                        mostRecentLivestream: livestream,
                        joinedAt: this.getServerTimestamp() as any,
                     }
                     transaction.set(groupTalentEntryRef, data, { merge: true })
                  }
               }

               const data: UserLivestreamData = {
                  userId: userData.authId,
                  livestreamId: livestream.id,
                  user: {
                     ...userData,
                  },
                  talentPool: {
                     companyId,
                     // @ts-ignore
                     date: this.getServerTimestamp(),
                  },
               }
               transaction.set(userLivestreamDataRef, data, { merge: true })
            }
         })
      })
   }

   getLivestreamCompanyId = async (livestreamId) => {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
      const streamSnap = await livestreamRef.get()
      if (!streamSnap.exists) {
         return ""
      }
      const streamData = streamSnap.data()
      return streamData.companyId
   }

   leaveCompanyTalentPool = (
      companyId: string,
      userData: UserData,
      livestream: LivestreamEvent
   ) => {
      let userRef = this.firestore
         .collection("userData")
         .doc(userData.userEmail)
      let streamRef = this.firestore
         .collection("livestreams")
         .doc(livestream.id)
      let userLivestreamDataRef = this.firestore
         .collection("livestreams")
         .doc(livestream.id)
         .collection("userLivestreamData")
         .doc(userData.userEmail)

      recommendationServiceInstance.leaveTalentPool(
         livestream.id,
         userData.authId
      )

      return this.firestore.runTransaction((transaction) => {
         return transaction
            .get(userLivestreamDataRef)
            .then((userLivestreamDataDoc) => {
               if (userLivestreamDataDoc.exists) {
                  const data: Partial<UserLivestreamData> = {
                     talentPool: null,
                     user: userData,
                  }
                  transaction.update(userLivestreamDataRef, data)
               }
               if (livestream.groupIds) {
                  for (const groupId of livestream.groupIds) {
                     const groupTalentEntryRef = userRef
                        .collection("talentProfiles")
                        .doc(groupId)

                     transaction.delete(groupTalentEntryRef)
                  }
               }
               transaction.update(userRef, {
                  talentPools:
                     firebase.firestore.FieldValue.arrayRemove(companyId),
               })
               transaction.update(streamRef, {
                  talentPool: firebase.firestore.FieldValue.arrayRemove(
                     userData.userEmail
                  ),
               })
            })
      })
   }

   listenToUserInTalentPool = (
      livestreamId: string,
      userId: string,
      callback: (snapshot: DocumentSnapshot<DocumentData>) => void
   ) => {
      const userTalentPoolRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("userLivestreamData")
         .doc(userId)
      return userTalentPoolRef.onSnapshot(callback)
   }

   setUserIsParticipatingWithRef = async (
      streamRef: DocumentReference<LivestreamEvent>,
      userData: UserData,
      userStats: UserStats
   ) => {
      let participantsRef = streamRef
         .collection("userLivestreamData")
         .withConverter(createCompatGenericConverter<UserLivestreamData>())
         .doc(userData.userEmail)

      const userLivestreamDataSnap = await participantsRef.get()

      const data: UserLivestreamData = {
         user: {
            ...userData,
         },
         userId: userData?.authId,
         participated: {
            // @ts-ignore
            date: this.getServerTimestamp(),
         },
      }

      if (userLivestreamDataSnap.exists) {
         const userLivestreamData = userLivestreamDataSnap.data()

         const isFirstParticipation = !userLivestreamData.participated?.date

         // If this is the first time the user is participating, we store the user stats
         if (isFirstParticipation) {
            data.participated.initialSnapshot = {
               userData: userData || null,
               userStats: userStats || null,
               // @ts-ignore
               date: this.getServerTimestamp(),
            }
         }

         const batch = this.firestore.batch()

         // Set the user Participating data in the userLivestreamData collection
         batch.set(participantsRef, data, { merge: true })

         // Set the user's email in the participants array of the livestream document
         batch.update(streamRef, {
            participatingStudents: firebase.firestore.FieldValue.arrayUnion(
               userData.userEmail
            ),
         })

         await batch.commit()
      }
   }

   checkIfUserAgreedToGroupPolicy = async (groupId, userEmail) => {
      let userInPolicySnapshot = await this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("usersInPolicy")
         .doc(userEmail)
         .get()
      return !userInPolicySnapshot.exists
   }

   postIcon = (
      livestreamId: string,
      iconName: EmoteMessage["emoteType"],
      authorEmail: string,
      streamerId: string
   ) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("icons")
      return ref.add({
         name: iconName,
         timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
         authorEmail: authorEmail,
         streamerId: streamerId ?? null,
      })
   }

   listenToFutureLivestreamIcons = (
      livestreamId: string,
      callback: (snapshot: firebase.firestore.QuerySnapshot) => void
   ) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("icons")
         .where("timestamp", ">", new Date())
         .orderBy("timestamp", "desc")
      return ref.onSnapshot(
         {
            includeMetadataChanges: true,
         },
         callback
      )
   }

   listenToLivestreamOverallRatings = (livestreamId, callback) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc("overall")
         .collection("voters")
      return ref.onSnapshot(callback)
   }

   listenToLivestreamContentRatings = (livestreamId, callback) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc("company")
         .collection("voters")
      return ref.onSnapshot(callback)
   }

   // Analytics Queries
   listenToAllLivestreamsOfGroup = (groupId, callback, timeframe) => {
      const oneYear = 31536000000
      const oneYearAgo = new Date(Date.now() - oneYear)
      const maxDate = timeframe || oneYearAgo
      let ref = this.firestore
         .collection("livestreams")
         .where("test", "==", false)
         .where("start", ">", maxDate)
         .where("groupIds", "array-contains", groupId)
         .orderBy("start", "desc")
      return ref.onSnapshot(callback)
   }

   updateFeedbackQuestion = async (livestreamId, feedbackId, data) => {
      let feedbackRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc(feedbackId)
      return feedbackRef.update(data)
   }

   deleteFeedbackQuestion = async (livestreamId, feedbackId) => {
      let feedbackRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc(feedbackId)
      return feedbackRef.delete()
   }

   createFeedbackQuestion = async (livestreamId, data) => {
      let feedbackRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
      return feedbackRef.add(data)
   }

   listenToLivestreamRatings = (livestreamId, callback) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
      return ref.onSnapshot(callback)
   }
   listenToLivestreamRatingsWithStreamRef = (streamRef, callback) => {
      let ref = streamRef.collection("rating")
      return ref.onSnapshot(callback)
   }

   getLivestreamRatingVoters = (ratingId, livestreamId) => {
      let ref = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("rating")
         .doc(ratingId)
         .collection("voters")
      return ref.get()
   }

   getFollowers = async (groupId) => {
      let ref = this.firestore
         .collection("userData")
         .where("groupIds", "array-contains", groupId)
      return ref.get()
   }

   getStudentsOfGroupUniversity = async (groupUniversityCode) => {
      let ref = this.firestore
         .collection("userData")
         .where("universityCode", "==", groupUniversityCode)
      return ref.get()
   }

   snapShotsToData = (snapShots) => {
      let dataArray = []
      snapShots.forEach((doc) => {
         const data = doc.data()
         data.id = doc.id
         dataArray.push(data)
      })
      return dataArray
   }

   findTargetEvent = async (eventId) => {
      let targetStream = null
      let typeOfStream = ""
      try {
         const streamSnap = await this.firestore
            .collection("livestreams")
            .doc(eventId)
            .get()
         if (streamSnap.exists) {
            targetStream = { id: streamSnap.id, ...streamSnap.data() }
            const startDate = targetStream.start?.toDate?.()
            typeOfStream = this.isPastEvent(startDate) ? "past" : "upcoming"
         } else {
            const draftSnap = await this.firestore
               .collection("draftLivestreams")
               .doc(eventId)
               .get()
            if (draftSnap.exists) {
               targetStream = { id: draftSnap.id, ...draftSnap.data() }
               typeOfStream = "draft"
            }
         }
      } catch (e) {}
      return { targetStream, typeOfStream }
   }

   isPastEvent = (eventStartDate) => {
      return (
         eventStartDate <
            new Date(Date.now() - FORTY_FIVE_MINUTES_IN_MILLISECONDS) &&
         eventStartDate > new Date(START_DATE_FOR_REPORTED_EVENTS)
      )
   }

   // Approval Queries

   getAllGroupAdminInfo = async (
      arrayOfGroupIds = ["groupId"],
      streamId = ""
   ) => {
      let adminsInfo = []
      const baseUrl = this.getBaseUrl()
      for (const groupId of arrayOfGroupIds) {
         const groupRef = this.firestore
            .collection("careerCenterData")
            .doc(groupId)
         const groupSnap = await groupRef.get()

         if (!groupSnap.exists) continue

         const adminsSnap = await groupRef.collection("groupAdmins").get()

         const newAdminsInfo = adminsSnap.docs.map((adminDoc) => {
            const adminData = adminDoc.data() as GroupAdmin
            return {
               groupId,
               email: adminData.email,
               eventDashboardLink: `${baseUrl}/group/${groupId}/admin/events?eventId=${streamId}`,
               nextLivestreamsLink: `${baseUrl}/next-livestreams/${groupId}?livestreamId=${streamId}`,
            }
         })
         adminsInfo = [...adminsInfo, ...newAdminsInfo]
      }
      return adminsInfo
   }

   // Notification Queries
   createNotification = async (details, options = { force: false }) => {
      const prevNotification = await this.checkForNotification(details)
      if (!prevNotification.empty && options.force === true) {
         const prevNotificationData = prevNotification.docs.map((doc) => ({
            id: doc.id,
         }))
         const notificationId = prevNotificationData[0].id
         if (options.force === true) {
            return await this.updateNotification(notificationId, details)
         }
         throw `Notification Already Exists as document ${notificationId}`
      }
      let ref = this.firestore.collection("notifications")
      const newNotification = {
         details: details,
         open: true,
         created: this.getServerTimestamp(),
      }
      return ref.add(newNotification)
   }

   updateNotification = async (notificationId, details, open = true) => {
      const newNotification = {
         details,
         open,
         updated: this.getServerTimestamp(),
      }
      let ref = this.firestore.collection("notifications").doc(notificationId)
      await ref.set(newNotification, { merge: true })
      return { id: notificationId }
   }

   deleteNotification = async (notificationId) => {
      const notificationRef = this.firestore
         .collection("notifications")
         .doc(notificationId)
      await notificationRef.delete()
   }

   checkForNotification = (
      detailFieldsToCheck = { property1: "value1", property2: "property2" }
   ) => {
      let query = this.firestore
         .collection("notifications")
         .where("details", "==", detailFieldsToCheck)
         .limit(1)

      return query.get()
   }

   getStreamTokenWithRef = (streamRef) => {
      return streamRef.collection("tokens").doc("secureToken").get()
   }

   // Breakout Rooms

   /**
    * @param {string} mainStreamId
    * @param {function} callback
    */
   listenToBreakoutRoomSettings = (mainStreamId, callback) => {
      const settingsRef = this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
         .collection("breakoutRoomsSettings")
         .doc("breakoutRoomsSetting")
      return settingsRef.onSnapshot(callback)
   }

   /**
    * @param {string} mainStreamId
    * @param {boolean} canReturnToMainStream
    */
   updateCanReturnToMainStream = (mainStreamId, canReturnToMainStream) => {
      const settingsRef = this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
         .collection("breakoutRoomsSettings")
         .doc("breakoutRoomsSetting")

      return settingsRef.set(
         {
            canReturnToMainStream: canReturnToMainStream,
         },
         { merge: true }
      )
   }

   /**
    * @param {firebase.firestore.UpdateData|string} newData
    * @param {string} roomId
    * @param {string} mainStreamId
    */
   updateBreakoutRoom = (newData, roomId, mainStreamId) => {
      const breakoutRoomRef = this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
         .collection("breakoutRooms")
         .doc(roomId)
      return breakoutRoomRef.update(newData)
   }

   /**
    * @param {string} title
    * @param {string} mainStreamId
    */
   addBreakoutRoom = (title, mainStreamId) => {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
      return this.firestore.runTransaction((transaction) => {
         return transaction.get(livestreamRef).then((livestreamSnap) => {
            const livestreamData = {
               ...livestreamSnap.data(),
               id: livestreamSnap.id,
            } as LivestreamEvent
            const breakoutRoomRef = livestreamRef
               .collection("breakoutRooms")
               .doc()
            const newBreakoutRoom = this.buildBreakoutRoom(
               breakoutRoomRef.id,
               livestreamData,
               title,
               false
            )
            transaction.set(breakoutRoomRef, newBreakoutRoom)
            if (!livestreamData.test) {
               // If the main stream isn't a test, we will then need secure tokens for each breakout room
               const breakoutTokenRef = breakoutRoomRef
                  .collection("tokens")
                  .doc("secureToken")
               const token = uuidv4()
               transaction.set(breakoutTokenRef, {
                  value: token,
               })
            }
         })
      })
   }

   /**
    * @param {string} roomId
    * @param {string} mainStreamId
    */
   deleteBreakoutRoom = (roomId, mainStreamId) => {
      const breakoutRoomRef = this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
         .collection("breakoutRooms")
         .doc(roomId)
      return breakoutRoomRef.delete()
   }

   /**
    * @param {string} mainStreamId
    */
   openAllBreakoutRooms = async (mainStreamId) => {
      const batch = this.firestore.batch()
      const breakoutRoomsSnaps = await this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
         .collection("breakoutRooms")
         .get()
      for (const breakoutRoomSnap of breakoutRoomsSnaps.docs) {
         if (breakoutRoomSnap.exists) {
            const roomRef = breakoutRoomSnap.ref
            batch.update(roomRef, {
               hasStarted: true,
            })
         }
      }
      return await batch.commit()
   }

   /**
    * @param {string} mainStreamId
    */
   closeAllBreakoutRooms = async (mainStreamId) => {
      const batch = this.firestore.batch()
      const breakoutRoomsSnaps = await this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
         .collection("breakoutRooms")
         .get()
      for (const breakoutRoomSnap of breakoutRoomsSnaps.docs) {
         if (breakoutRoomSnap.exists) {
            const roomRef = breakoutRoomSnap.ref
            batch.update(roomRef, {
               hasStarted: false,
               hasEnded: true,
            })
         }
      }
      return await batch.commit()
   }

   buildBreakoutRoom = (breakoutRoomId, livestreamData, title, index) => {
      const test = livestreamData.test
      const companyLogo = livestreamData.companyLogoUrl || ""
      return {
         start: this.getServerTimestamp(),
         id: breakoutRoomId,
         hasStarted: false,
         hasEnded: false,
         test,
         companyLogo,
         title,
         parentLivestream: pickPublicDataFromLivestream(livestreamData),
         ...(index && { index: index }),
      }
   }

   getEventsWithArrayOfIds = async (arrayOfIds = []) => {
      const eventSnaps = await Promise.all(
         arrayOfIds.map((eventId) =>
            this.firestore.collection("livestreams").doc(eventId).get()
         )
      )

      return eventSnaps
         .filter((doc) => doc.exists)
         .map((doc) => ({ id: doc.id, ...doc.data() }))
   }

   listenToRecommendedEvents = (recommendedEventIds, callback) => {
      const ref = this.firestore
         .collection("livestreams")
         .where("id", "in", recommendedEventIds || [])
      return ref.onSnapshot(callback)
   }

   createMultipleBreakoutRooms = async (
      livestreamId = "",
      numberOfRooms = 0
   ) => {
      const livestreamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)
      return this.firestore.runTransaction((transaction) => {
         return transaction.get(livestreamRef).then((livestreamSnap) => {
            const livestreamData = {
               ...livestreamSnap.data(),
               id: livestreamSnap.id,
            } as LivestreamEvent
            for (let i = 1; i <= numberOfRooms; i++) {
               const breakoutRoomRef = livestreamRef
                  .collection("breakoutRooms")
                  .doc()
               const newBreakoutRoom = this.buildBreakoutRoom(
                  breakoutRoomRef.id,
                  livestreamData,
                  `Breakout Room ${i}`,
                  i
               )
               transaction.set(breakoutRoomRef, newBreakoutRoom)
               if (!livestreamData.test) {
                  // If the main stream isn't a test, we will then need secure tokens for each breakout room
                  const breakoutTokenRef = breakoutRoomRef
                     .collection("tokens")
                     .doc("secureToken")
                  const token = uuidv4()
                  transaction.set(breakoutTokenRef, {
                     value: token,
                  })
               }
            }
         })
      })
   }

   /**
    * @param {string} announcement
    * @param {string} mainStreamId
    * @param {({name:string, email:string})} author
    */
   sendBroadcastToBreakoutRooms = async (
      announcement,
      mainStreamId,
      author
   ) => {
      const batch = this.firestore.batch()
      const mainStreamRef = this.firestore
         .collection("livestreams")
         .doc(mainStreamId)

      const mainStreamChatRef = mainStreamRef.collection("chatEntries").doc()
      const breakoutRoomsRef = mainStreamRef.collection("breakoutRooms")

      const breakoutRoomsSnaps = await breakoutRoomsRef.get()

      const broadcastMessage = {
         authorEmail: author.email,
         authorName: author.name,
         message: announcement,
         timestamp: this.getServerTimestamp(),
         type: "broadcast",
      }
      for (const breakoutSnap of breakoutRoomsSnaps.docs) {
         let breakoutChatRef = breakoutSnap.ref.collection("chatEntries").doc()
         batch.set(breakoutChatRef, broadcastMessage)
      }

      batch.set(mainStreamChatRef, broadcastMessage)

      return await batch.commit()
   }

   getBreakoutRoomWithIds = (mainStreamId, breakoutRoomId) => {
      const ref = this.firestore
         .collection("livestreams")
         .doc(mainStreamId)
         .collection("breakoutRooms")
         .doc(breakoutRoomId)
      return ref.get()
   }

   // Streamer Helpers

   /**
    * Get the streamer's data from the current stream using their ID
    * @param {({liveSpeakers: array})|| Boolean} currentLivestream
    * @param {string} streamerId
    * @returns {({firstName: string, lastName: string})} streamerData
    */
   getStreamerData = (currentLivestream, streamerId) => {
      return (
         currentLivestream?.liveSpeakers?.find(
            (speaker) => speaker.speakerUuid === streamerId
         ) || {
            firstName: "Streamer",
            lastName: "Streamer",
         }
      )
   }

   // Rewards

   rewardListenToUnSeenUserRewards = (
      userDataId,
      callback: (QuerySnapshot) => void
   ) => {
      let ref = this.firestore
         .collection("userData")
         .doc(userDataId)
         .collection("rewards")
         .where("seenByUser", "==", false)
      return ref.onSnapshot(callback)
   }

   rewardMarkManyAsSeen = (rewardRefs: DocumentReference[]) => {
      let batch = this.firestore.batch()

      for (let rewardRef of rewardRefs) {
         batch.update(rewardRef, { seenByUser: true })
      }

      return batch.commit()
   }

   applyReferralCode = async (referralCode: string) => {
      return await this.functions.httpsCallable("applyReferralCode_eu")(
         referralCode
      )
   }

   // Impressions
   async addImpression(
      livestreamId: string,
      impressionData: Omit<LivestreamImpression, "createdAt" | "id">
   ): Promise<void> {
      const streamRef = this.firestore
         .collection("livestreams")
         .doc(livestreamId)

      const impressionsCounter = new Counter(streamRef, "impressions")
      const recommendedImpressionsCounter = new Counter(
         streamRef,
         "recommendedImpressions"
      )

      const data: Omit<LivestreamImpression, "id"> = {
         ...impressionData,
         createdAt: this.getServerTimestamp() as any,
      }

      await this.firestore
         .collection("livestreams")
         .doc(livestreamId)
         .collection("impressions")
         .add(data)

      // Don't use the distributed counter for emulators
      if (shouldUseEmulators()) {
         const toUpdate: Pick<
            LivestreamEvent,
            "impressions" | "recommendedImpressions"
         > = {
            impressions: firebase.firestore.FieldValue.increment(1) as any,
         }
         if (impressionData.isRecommended) {
            toUpdate.recommendedImpressions =
               firebase.firestore.FieldValue.increment(1) as any
         }

         return streamRef.update(toUpdate)
      } else {
         impressionsCounter.incrementBy(1).catch(console.error)

         if (impressionData.isRecommended) {
            // If the impression is recommended, increment the recommended impressions counter
            recommendedImpressionsCounter.incrementBy(1).catch(console.error)
         }
         return
      }
   }

   trackDetailPageView = async (
      eventId: string,
      visitorId: string
   ): Promise<void> => {
      const pageViewRef = this.firestore
         .collection("livestreams")
         .doc(eventId)
         .collection("detailPageViews")
         .doc(visitorId)

      const livestreamStatsRef = this.firestore
         .collection("livestreams")
         .doc(eventId)
         .collection("stats")
         .doc("livestreamStats")

      const pageViewVisitorSnap = await pageViewRef.get()

      const hasViewed = pageViewVisitorSnap.exists

      if (!hasViewed) {
         const generalStatsFieldPath = getAValidLivestreamStatsUpdateField(
            "numberOfPeopleReached"
         )

         const generalDetailPageViewCounter = new Counter(
            livestreamStatsRef,
            generalStatsFieldPath
         )

         generalDetailPageViewCounter.incrementBy(1).catch(console.error)

         return pageViewRef.set({
            createdAt: this.getServerTimestamp(),
         })
      } else {
         return
      }
   }

   trackCompanyPageView = async (
      groupId: string,
      visitorId: string
   ): Promise<void> => {
      const pageViewRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("companyPageViews")
         .doc(visitorId)

      const groupStatsRef = this.firestore
         .collection("careerCenterData")
         .doc(groupId)
         .collection("stats")
         .doc("groupStats")

      const pageViewVisitorSnap = await pageViewRef.get()

      const hasViewed = pageViewVisitorSnap.exists

      if (!hasViewed) {
         const generalStatsFieldPath = getAValidGroupStatsUpdateField(
            "numberOfPeopleReachedCompanyPage"
         )

         const generalDetailPageViewCounter = new Counter(
            groupStatsRef,
            generalStatsFieldPath
         )

         generalDetailPageViewCounter.incrementBy(1).catch(console.error)
         return pageViewRef.set({
            createdAt: this.getServerTimestamp(),
         })
      } else {
         return
      }
   }

   // Backfill user data
   backfillUserData = async ({ timezone }) => {
      return this.functions.httpsCallable("backfillUserData_eu")({ timezone })
   }

   // DB functions
   getStorageRef = () => {
      return this.storage.ref()
   }

   getBaseUrl = () => {
      let baseUrl = "https://careerfairy.io"
      if (window?.location?.origin) {
         baseUrl = window.location.origin
      }
      return baseUrl
   }

   getServerTimestamp = () => {
      return firebase.firestore.FieldValue.serverTimestamp()
   }
   getFieldsOfStudiesByIds = async (
      fieldOfStudyIds: string[]
   ): Promise<{ id: string; name: string }[]> => {
      const promises = fieldOfStudyIds.map((id) =>
         this.firestore.collection("fieldsOfStudy").doc(id).get()
      )
      const snapshots = await Promise.all(promises)
      return snapshots
         .filter((snap) => snap.exists)
         .map((doc) => ({
            ...doc.data(),
            id: doc.id,
         })) as { id: string; name: string }[]
   }
}

/**
 * Singleton instance, since this is quite a big object without localstate
 * we share the same instance everywhere
 * @type {FirebaseService}
 */
export const firebaseServiceInstance = new FirebaseService(firebaseApp)

export default FirebaseService
