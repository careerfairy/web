import { admin } from "../api/firestoreAdmin"
import { RewardActions, RewardDoc } from "@careerfairy/shared-lib/rewards"
import pick = require("lodash/pick")
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Create } from "@careerfairy/shared-lib/commonTypes"

export const rewardCreateReferralSignUpLeader = (
   leaderId,
   followerUserData
) => {
   return rewardCreate(leaderId, RewardActions.REFERRAL_SIGNUP_LEADER, {
      userId: followerUserData.id,
      userData: pickDetailsFromUserData(followerUserData),
   })
}

export const rewardCreateReferralSignUpFollower = (
   justRegisteredUserId,
   leaderUserData
) => {
   return rewardCreate(
      justRegisteredUserId,
      RewardActions.REFERRAL_SIGNUP_FOLLOWER,
      {
         userId: leaderUserData.id,
         userData: pickDetailsFromUserData(leaderUserData),
      }
   )
}

export const rewardCreateLivestream = (
   userBeingRewardedId,
   action,
   relatedUserData,
   relatedLivestreamData
) => {
   return rewardCreate(userBeingRewardedId, action, {
      userId: relatedUserData.id,
      livestreamId: relatedLivestreamData.id,
      userData: pickDetailsFromUserData(relatedUserData),
      livestreamData: pickDetailsFromLivestreamData(relatedLivestreamData),
   })
}

export const rewardCreateUserAction = (
   userBeingRewardedId,
   action,
   relatedLivestreamData?: LivestreamEvent
) => {
   // do not send reward notifications for user actions
   // by marking the reward as seen the user doesn't receive a notification
   const otherData: Partial<RewardDoc> = { seenByUser: true }

   if (relatedLivestreamData) {
      otherData.livestreamId = relatedLivestreamData.id
      otherData.livestreamData = pickDetailsFromLivestreamData(
         relatedLivestreamData
      )
   }

   return rewardCreate(userBeingRewardedId, action, otherData)
}

const rewardCreate = async (
   rewardedUserId,
   action: string,
   otherData: Partial<RewardDoc> = {}
) => {
   const doc: Create<RewardDoc> = Object.assign(
      {
         action: action,
         seenByUser: false,
         createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      otherData
   )

   return admin
      .firestore()
      .collection("userData")
      .doc(rewardedUserId)
      .collection("rewards")
      .add(doc)
}

export const rewardGetRelatedToLivestream = async (
   userDataId,
   livestreamId,
   action
) => {
   const querySnapshot = await admin
      .firestore()
      .collection("userData")
      .doc(userDataId)
      .collection("rewards")
      .where("livestreamId", "==", livestreamId)
      .where("action", "==", action)
      .limit(1)
      .get()

   if (querySnapshot.empty) {
      return null
   }

   return querySnapshot.docs[0].data()
}

const pickDetailsFromUserData = (userData) => {
   return pick(userData, ["firstName", "lastName"])
}

export const pickDetailsFromLivestreamData = (livestreamData) => {
   return pick(livestreamData, [
      "title",
      "summary",
      "company",
      "companyLogoUrl",
      "start",
   ])
}
