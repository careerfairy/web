import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import { v4 as uuidv4 } from "uuid"
import { Timestamp } from "../../api/firestoreAdmin"

type NewAndOldUserLivestreamDataOptions = {
   registered?: boolean
   talentPool?: boolean
   participated?: boolean
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
   const email = "john@example.com"
   const authUid = uuidv4()
   const livestreamId = uuidv4()

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
      userId: options.user.authId,
      livestreamId: options.livestreamId,
   }
}
const timestampFromDate = (date: Date) => {
   return Timestamp.fromDate(date)
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
      createdAt: timestampFromDate(pastDate),
      groupIds: [],
      id: options.email,
      lastActivityAt: timestampFromDate(pastDate),
      linkedinUrl: "",
      userEmail: options.email,
      userResume: "www.resume.com",
      validationPin: 0,
      firstName: "John",
      lastName: "Doe",
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
      date: timestampFromDate(pastDate),
   }
}

const generateTalentPool = (): UserLivestreamData["talentPool"] => {
   return {
      date: timestampFromDate(pastDate),
      companyId: uuidv4(),
   }
}

const generateParticipated = (): UserLivestreamData["participated"] => {
   return {
      date: timestampFromDate(pastDate),
   }
}

const pastDate = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 2)
