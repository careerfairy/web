import {
   dummyFieldsOfStudy,
   dummyLevelsOfStudy,
} from "@careerfairy/seed-data/fieldsOfStudy"

export const credentials = {
   correctEmail: "john@careerfairy.io",
   correctUserEmail: "john@test.io",
   unregisteredEmail: "unregistered@careerfairy.io",
   correctPassword: "Correct@Password420",
   wrongPassword: "wrongpassword",
   defaultPassword: "password",
   invalidEmailAddress: "invalidemailaddress",
   correctFirstName: "John",
   correctLastName: "Smith",
   wrongFirstName: "123John",
   wrongLastName: "123Smith",
   correctUniversityCountry: "Switzerland",
   linkedinUrl: "http://www.linkedin.com/in/user",
   wrongLinkedinUrl: "http://www.linkAdin.com/in/user",
   spokenLanguagesIds: ["en", "pt", "de"],
   countriesOfInterestIds: ["GB", "PT", "DE"],
   regionsOfInterestIds: ["asia", "africa"],
   businessFunctionsTagIds: ["SupplyChainLogistics"],
   contentTopicsTagIds: ["DayInTheLife"],
   correctFieldOfStudyName: dummyFieldsOfStudy[0].name,
   correctLevelOfStudyName: dummyLevelsOfStudy[0].name,
}

export const imageLogoPath = "tests/e2e/assets/logo.png"
export const pdfSamplePath = "tests/e2e/assets/sample.pdf"
export const creatorAvatarImagePath = "tests/e2e/assets/creatorAvatar.png"

export const streaming = {
   streamer: {
      firstName: credentials.correctFirstName,
      lastName: credentials.correctLastName,
      occupation: "Software Engineer", //TODO: remove this when old room tests are removed
      linkedin: credentials.linkedinUrl,
      position: "Software Engineer",
      email: credentials.correctEmail,
      avatar: creatorAvatarImagePath,
   },
}

export const correctRegistrationAnalyticsSteps = {
   steps: ["Social", "Location", "Interests"],
   totalSteps: 3,
   updatedAt:
      "Thu Jul 14 2022 22:47:56 GMT+0100 (Western European Summer Time)\n",
   userId: "john@careerfairy.io",
}

export const correctCompany = {
   industry: "Technology & IT",
   location: "Switzerland",
} as const
