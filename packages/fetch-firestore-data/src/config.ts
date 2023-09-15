import * as path from "path"

export default {
   /**
    * Remote folder that we want to fetch
    * Should be updated from time to time using the export.ts script
    */
   BUCKET_FOLDER: "fetched",

   BUCKET: "careerfairy-backup",

   /**
    * Relative to the project root, data will be extracted into this folder
    */
   LOCAL_FOLDER: "emulatorData",

   rootFolder: path.join(__dirname, "../../../"),

   /*
    * Only set this to true if you want to fetch the user data from the production database,
    * but be sure to delete the downloaded backup when done testing because of GDPR
    *
    * When false, during the export script, some collections with user data will not be exported
    * */
   INCLUDE_USERDATA: process.env.INCLUDE_USERDATA === "true",

   /**
    * The firestore collections that will be exported from production and
    * imported to the emulators
    *
    * The collection id can be a parent collection or subcollection
    * MAX of 60
    */
   COLLECTION_IDS: [
      "admins",
      "analytics",
      "ats",
      "atsRelations",
      "breakoutRooms",
      "breakoutRoomsSettings",
      "careerCenterData",
      "comments",
      "companyData",
      "currentPositions",
      "draftLivestreams",
      "fieldsOfStudy",
      "filterGroups",
      "groupAdmins",
      "groupDashboardInvites",
      "groupQuestions",
      "handRaises",
      "highlights",
      "interests",
      "jobApplications",
      "levelsOfStudy",
      "liveSpeakers",
      "livestreamReferrals",
      "livestreams",
      "marketingUsers",
      "nonVoters",
      "notifications",
      "participatingStats",
      "polls",
      "preferences",
      "presentations",
      "promotions",
      "questions",
      "rating",
      "ratings",
      "recommendedEvents",
      "recordingToken",
      "registeredGroups",
      "rewards",
      "roles",
      "speakers",
      "stats",
      "support",
      "tokens",
      "universitiesByCountry",
      "userAdminGroups",
      "userData",
      "userGroups",
      "userInterface",
      "userLivestreamData",
      "userReminders",
      "recordingStats",
      "usersWhoClicked",
      "usersWhoDismissed",
      "videos",
      "wishes",
      "wishList",
      "voters",
      "sparksNotifications",
   ],
}
