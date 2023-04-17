import { admin } from "../api/firestoreAdmin"
import {
   RewardAction,
   RewardDoc,
   REWARDS,
} from "@careerfairy/shared-lib/rewards"
import {
   LivestreamEvent,
   pickPublicDataFromLivestream,
} from "@careerfairy/shared-lib/livestreams"
import { Create } from "@careerfairy/shared-lib/commonTypes"
import { pickPublicDataFromUser, UserData } from "@careerfairy/shared-lib/users"

export const rewardCreateReferralSignUpLeader = (
   leaderId: string,
   followerUserData: UserData
) => {
   return rewardCreate(leaderId, "REFERRAL_SIGNUP_LEADER", {
      userId: followerUserData.id,
      userData: pickPublicDataFromUser(followerUserData),
   })
}

export const rewardCreateReferralSignUpFollower = (
   justRegisteredUserId: string,
   leaderUserData: UserData
) => {
   return rewardCreate(justRegisteredUserId, "REFERRAL_SIGNUP_FOLLOWER", {
      userId: leaderUserData.id,
      userData: pickPublicDataFromUser(leaderUserData),
   })
}

export const rewardCreateLivestream = (
   userBeingRewardedId: string,
   action: RewardAction,
   relatedUserData: UserData,
   relatedLivestreamData: LivestreamEvent
) => {
   return rewardCreate(userBeingRewardedId, action, {
      userId: relatedUserData.id,
      livestreamId: relatedLivestreamData.id,
      userData: pickPublicDataFromUser(relatedUserData),
      livestreamData: pickPublicDataFromLivestream(relatedLivestreamData),
   })
}

export const rewardCreateUserAction = (
   userBeingRewardedId: string,
   action: RewardAction,
   relatedLivestreamData?: LivestreamEvent
) => {
   // do not send reward notifications for user actions
   // by marking the reward as seen the user doesn't receive a notification
   const otherData: Partial<RewardDoc> = { seenByUser: true }

   if (relatedLivestreamData) {
      otherData.livestreamId = relatedLivestreamData.id
      otherData.livestreamData = pickPublicDataFromLivestream(
         relatedLivestreamData
      )
   }

   return rewardCreate(userBeingRewardedId, action, otherData)
}

const rewardCreate = async (
   rewardedUserId: string,
   action: RewardAction,
   otherData: Partial<RewardDoc> = {}
) => {
   const doc: Create<RewardDoc> = Object.assign(
      {
         action: action,
         seenByUser: false,
         createdAt: admin.firestore.FieldValue.serverTimestamp(),
         credits: REWARDS[action]?.credits ?? 0,
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
   userDataId: string,
   livestreamId: string,
   action: RewardAction
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
