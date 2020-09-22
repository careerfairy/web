export default class UserUtil {
    static userProfileIsComplete(userProfile) {
        console.log("userProfile", userProfile);
        return userProfile.firstName && userProfile.lastName
    }
}