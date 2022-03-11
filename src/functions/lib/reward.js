const { admin } = require("../api/firestoreAdmin");
const { RewardActions, getPoints } = require("../../shared/rewards");
const pick = require("lodash/pick");

exports.rewardCreateReferralSignUpLeader = (leaderId, followerUserData) => {
   return rewardCreate(leaderId, RewardActions.REFERRAL_SIGNUP_LEADER, {
      userId: followerUserData.id,
      userData: pickDetailsFromUserData(followerUserData),
   });
};

exports.rewardCreateReferralSignUpFollower = (
   justRegisteredUserId,
   leaderUserData
) => {
   return rewardCreate(
      justRegisteredUserId,
      RewardActions.REFERRAL_SIGNUP_LEADER,
      {
         userId: leaderUserData.id,
         userData: pickDetailsFromUserData(leaderUserData),
      }
   );
};

exports.rewardCreateLivestreamInviteCompleteFollower = (
   userThatAttendedTheEventId,
   leaderUserData,
   livestreamData
) => {
   console.log({
      userId: leaderUserData.id,
      livestreamId: livestreamData.id,
      userData: pickDetailsFromUserData(leaderUserData),
      livestreamData: pickDetailsFromLivestreamData(livestreamData),
   });
   return rewardCreate(
      userThatAttendedTheEventId,
      RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER,
      {
         userId: leaderUserData.id,
         livestreamId: livestreamData.id,
         userData: pickDetailsFromUserData(leaderUserData),
         livestreamData: pickDetailsFromLivestreamData(livestreamData),
      }
   );
};

exports.rewardCreateLivestreamInviteCompleteLeader = (
   leaderId,
   followerUserData,
   livestreamData
) => {
   return rewardCreate(
      leaderId,
      RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER,
      {
         userId: followerUserData.id,
         livestreamId: livestreamData.id,
         userData: pickDetailsFromUserData(followerUserData),
         livestreamData: pickDetailsFromLivestreamData(livestreamData),
      }
   );
};

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
      );
};

exports.rewardGetInvitationForLivestream = async (userDataId, livestreamId) => {
   let querySnapshot = await admin
      .firestore()
      .collection("userData")
      .doc(userDataId)
      .collection("rewards")
      .where("livestreamId", "==", livestreamId)
      .where("action", "==", RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER)
      .limit(1)
      .get();

   if (querySnapshot.empty) {
      return null;
   }

   return querySnapshot.docs[0].data();
};

const pickDetailsFromUserData = (userData) => {
   return pick(userData, ["firstName", "lastName"]);
};

const pickDetailsFromLivestreamData = (livestreamData) => {
   return pick(livestreamData, [
      "title",
      "summary",
      "company",
      "companyLogoUrl",
      "start",
   ]);
};
