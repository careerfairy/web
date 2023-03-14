import { admin } from "../../../api/firestoreAdmin"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { faker } from "@faker-js/faker"
import { UserData } from "@careerfairy/shared-lib/users"

type NewAndOldUserLivestreamDataOptions = {
   registered?: boolean
   talentPool?: boolean
   participated?: boolean
   numberOfJobApplications?: number
   universityData?: {
      countryCode: string
      code: string
      name: string
   }
   fieldOfStudy?: string
}

export const createNewAndOldUserLivestreamData = (
   newUserOptions: NewAndOldUserLivestreamDataOptions = {},
   oldUserOptions: NewAndOldUserLivestreamDataOptions = {}
): {
   newUserLivestreamData: UserLivestreamData
   oldUserLivestreamData: UserLivestreamData
} => {
   const email = faker.internet.email()
   const authUid = faker.datatype.uuid()
   const livestreamId = faker.datatype.uuid()

   const newUser = generateUserData({
      email,
      authUid,
      fieldOfStudy: newUserOptions.fieldOfStudy,
      universityData: newUserOptions.universityData,
   })

   const oldUser = generateUserData({
      email,
      authUid,
      fieldOfStudy: oldUserOptions.fieldOfStudy,
      universityData: oldUserOptions.universityData,
   })

   return {
      newUserLivestreamData: generateUserLivestreamDataObj({
         livestreamId,
         user: newUser,
         ...newUserOptions,
      }),
      oldUserLivestreamData: generateUserLivestreamDataObj({
         livestreamId,
         user: oldUser,
         ...oldUserOptions,
      }),
   }
}

type UserLivestreamDataOptions = {
   user: UserData
   livestreamId: string
   talentPool?: boolean
   registered?: boolean
   participated?: boolean
   numberOfJobApplications?: number
}
const generateUserLivestreamDataObj = (
   options: UserLivestreamDataOptions
): UserLivestreamData => {
   return {
      id: options.user.id,
      user: options.user,
      talentPool: options.talentPool ? generateTalentPool() : null,
      registered: options.registered ? generateRegistered() : null,
      participated: options.participated ? generateParticipated() : null,
      jobApplications: options.numberOfJobApplications
         ? generateJobApplications(options.numberOfJobApplications)
         : null,
      userId: options.user.authId,
      livestreamId: options.livestreamId,
   }
}
const timestampFromDate = (date: Date): admin.firestore.Timestamp => {
   return admin.firestore.Timestamp.fromDate(date)
}

type GenerateUserDataOptions = {
   email: string
   authUid: string
   fieldOfStudy?: string
   universityData?: NewAndOldUserLivestreamDataOptions["universityData"]
}
const generateUserData = (
   options: GenerateUserDataOptions
): UserLivestreamData["user"] => {
   return {
      authId: options.authUid,
      backFills: [],
      createdAt: timestampFromDate(faker.date.past()),
      groupIds: [],
      id: options.email,
      lastActivityAt: timestampFromDate(faker.date.past()),
      linkedinUrl: "",
      userEmail: options.email,
      userResume: faker.internet.url(),
      validationPin: 0,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      university: {
         name: options.universityData?.name,
         code: options.universityData?.code,
      },
      fieldOfStudy: options.fieldOfStudy
         ? {
              name: options.fieldOfStudy + "_name",
              id: options.fieldOfStudy + "_id",
           }
         : null,
      universityCountryCode: options.universityData?.countryCode,
   }
}

const generateRegistered = (): UserLivestreamData["registered"] => {
   return {
      date: timestampFromDate(faker.date.past()),
      utm: { source: faker.random.word() },
      referrer: faker.internet.url(),
      isRecommended: faker.datatype.boolean(),
   }
}

const generateTalentPool = (): UserLivestreamData["talentPool"] => {
   return {
      date: timestampFromDate(faker.date.past()),
      companyId: faker.datatype.uuid(),
   }
}

const generateParticipated = (): UserLivestreamData["participated"] => {
   return {
      date: timestampFromDate(faker.date.past()),
   }
}

const generateJobApplications = (
   numberOfApplications?: number
): UserLivestreamData["jobApplications"] => {
   const jobApplications: UserLivestreamData["jobApplications"] = {}

   if (!numberOfApplications) return jobApplications

   for (let i = 0; i < numberOfApplications; i++) {
      const jobId = faker.datatype.uuid()
      jobApplications[jobId] = {
         applicationId: faker.datatype.uuid(),
         jobId: faker.datatype.uuid(),
         job: {},
         groupId: faker.datatype.uuid(),
         integrationId: faker.datatype.uuid(),
         date: timestampFromDate(faker.date.past()),
      }
   }
   return jobApplications
}
