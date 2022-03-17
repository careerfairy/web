/**
 * When changing shared files, be sure to deploy both the webapp and the functions using this code
 */

/**
 * Actions
 */
const RewardActions = {
   REFERRAL_SIGNUP_LEADER: "REFERRAL_SIGNUP_LEADER",
   REFERRAL_SIGNUP_FOLLOWER: "REFERRAL_SIGNUP_FOLLOWER",
   LIVESTREAM_REGISTER_COMPLETE_LEADER: "LIVESTREAM_REGISTER_COMPLETE_LEADER",
   LIVESTREAM_REGISTER_COMPLETE_FOLLOWER:
      "LIVESTREAM_REGISTER_COMPLETE_FOLLOWER",
   LIVESTREAM_INVITE_COMPLETE_LEADER: "LIVESTREAM_INVITE_COMPLETE_LEADER", // event attendance complete
   LIVESTREAM_INVITE_COMPLETE_FOLLOWER: "LIVESTREAM_INVITE_COMPLETE_FOLLOWER",
}

/**
 * Points
 */
const RewardPoints = {
   [RewardActions.REFERRAL_SIGNUP_LEADER]: 20,
   [RewardActions.REFERRAL_SIGNUP_FOLLOWER]: 20,
   [RewardActions.LIVESTREAM_REGISTER_COMPLETE_LEADER]: 0,
   [RewardActions.LIVESTREAM_REGISTER_COMPLETE_FOLLOWER]: 0,
   [RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER]: 20,
   [RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER]: 20,
}

const REWARD_LIVESTREAM_ATTENDANCE_SECONDS = 5 * 60 // 5 minutes

const getPoints = (action) => RewardPoints[action]

const getHumanStringDescriptionForAction = (action) => {
   switch (action) {
      case RewardActions.REFERRAL_SIGNUP_FOLLOWER:
         return "SignUp through a referral"
      case RewardActions.REFERRAL_SIGNUP_LEADER:
         return "Referral SignUp Successful"
      case RewardActions.LIVESTREAM_REGISTER_COMPLETE_LEADER:
         return "Registered an invited event"
      case RewardActions.LIVESTREAM_REGISTER_COMPLETE_FOLLOWER:
         return "Event Registration Successful"
      case RewardActions.LIVESTREAM_INVITE_COMPLETE_FOLLOWER:
         return "Attended an invited event"
      case RewardActions.LIVESTREAM_INVITE_COMPLETE_LEADER:
         return "Event Invitation Successful"
      default:
         return action
   }
}

module.exports = {
   RewardActions,
   RewardPoints,
   getPoints,
   getHumanStringDescriptionForAction,
   REWARD_LIVESTREAM_ATTENDANCE_SECONDS,
}
