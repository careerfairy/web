
export default class UserUtil {
    static userProfileIsComplete(userProfile) {
        return userProfile.firstName && userProfile.lastName && userProfile.university && userProfile.faculty && userProfile.levelOfStudy;
    }
}