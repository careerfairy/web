export default class UserUtil {
   static userProfileIsComplete(userProfile) {
      return userProfile.firstName && userProfile.lastName
   }
}
