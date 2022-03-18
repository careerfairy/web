import { admin } from "../api/firestoreAdmin"
import { RewardActions, getPoints } from "@careerfairy/shared-lib/dist/rewards"
import pick = require("lodash/pick")

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

const rewardCreate = async (rewardedUserId, action, otherData = {}) => {
   return admin
      .firestore()
      .collection("userData")
      .doc(rewardedUserId)
      .collection("rewards")
      .add(
         Object.assign(
            {
               action: action,
               points: getPoints(action),
               seenByUser: false,
               createdAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            otherData
         )
      )
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

const pickDetailsFromLivestreamData = (livestreamData) => {
   return pick(livestreamData, [
      "title",
      "summary",
      "company",
      "companyLogoUrl",
      "start",
   ])
}
