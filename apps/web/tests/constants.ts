import {
   dummyLevelsOfStudy,
   dummyFieldsOfStudy,
} from "@careerfairy/seed-data/dist/fieldsOfStudy"

export const credentials = {
   correctEmail: "john@careerfairy.io",
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
   interestsIds: ["Le9yVcgRtkReAdwyh6tq"],
   correctFieldOfStudyName: dummyFieldsOfStudy[0].name,
   correctLevelOfStudyName: dummyLevelsOfStudy[0].name,
}

export const streaming = {
   streamer: {
      firstName: "John",
      lastName: "Smith",
      occupation: "Software Engineer",
      linkedin: "https://linkedin.com/in/your-profile",
   },
}

export const correctRegistrationAnalyticsSteps = {
   steps: ["Social", "Location", "Interests"],
   totalSteps: 3,
   updatedAt:
      "Thu Jul 14 2022 22:47:56 GMT+0100 (Western European Summer Time)\n",
   userId: "john@careerfairy.io",
}

export const imageLogoPath = "tests/e2e/assets/logo.png"

export const correctCompany = {
   industry: "Technology & IT",
   location: "Switzerland",
} as const
