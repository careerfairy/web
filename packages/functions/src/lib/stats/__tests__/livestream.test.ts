import { addOperations } from "../livestream"
import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { increment } from "../util"
import {
   LivestreamStatsKey,
   LivestreamStatsMap,
} from "@careerfairy/shared-lib/livestreams/stats"
import { createNewAndOldUserLivestreamData } from "../testHelpers"

describe("Adding operations to livestream stats", () => {
   test("should not modify operationsToMakeObject when newUserLivestreamData and oldUserLivestreamData are identical", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData()
      const operationsToMakeObject = {}
      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )
      expect(operationsToMakeObject).toStrictEqual({})
   })

   test("should increment numberOfParticipants when user participates to event", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               participated: true,
            },
            {
               participated: false,
            }
         )

      const operationsToMakeObject: any = {}
      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [generalSat("numberOfParticipants")]: increment(1),
      })
   })

   test("should decrement numberOfRegistrations when user de-registers", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               registered: false,
            },
            {
               registered: true,
            }
         )
      const operationsToMakeObject: any = {}
      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [generalSat("numberOfRegistrations")]: increment(-1),
      })
   })

   test("should increment numberOfApplicants when user applies to another job", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               numberOfJobApplications: 2,
            },
            {
               numberOfJobApplications: 1,
            }
         )

      const operationsToMakeObject: any = {}

      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [generalSat("numberOfApplicants")]: increment(1),
      })
   })

   test("should increment numberOfTalentPoolProfiles when user joins talent pool", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               talentPool: true,
            },
            {
               talentPool: false,
            }
         )

      const operationsToMakeObject: any = {}

      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [generalSat("numberOfTalentPoolProfiles")]: increment(1),
      })
   })

   test("should transfer user's university stats to new university when they change their university", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               universityData: { code: "u1", countryCode: "c1", name: "n1" },
               participated: true,
            },
            {
               universityData: { code: "u2", countryCode: "c2", name: "n2" },
               participated: true,
            }
         )

      const operationsToMakeObject: any = {}

      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [countrySat(oldUserLivestreamData, "numberOfParticipants")]:
            increment(-1),
         [universitySat(oldUserLivestreamData, "numberOfParticipants")]:
            increment(-1),
         [countrySat(newUserLivestreamData, "numberOfParticipants")]:
            increment(1),
         [universitySat(newUserLivestreamData, "numberOfParticipants")]:
            increment(1),
      })
   })

   test("should increment numberOfParticipants of the same user's university after having already registered", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               universityData: { code: "u1", countryCode: "c1", name: "n1" },
               participated: true,
               registered: true,
            },
            {
               universityData: { code: "u1", countryCode: "c1", name: "n1" },
               registered: true,
            }
         )

      const operationsToMakeObject: any = {}
      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [generalSat("numberOfParticipants")]: increment(1),
         [universitySat(newUserLivestreamData, "numberOfParticipants")]:
            increment(1),
         [countrySat(newUserLivestreamData, "numberOfParticipants")]:
            increment(1),
      })
   })

   test("should increment university related stats once the user's university is added and user participates to event", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               universityData: { code: "u1", countryCode: "c1", name: "n1" },
               fieldOfStudy: "f1",
               registered: true,
               participated: true,
            },
            {
               registered: true,
            }
         )

      const operationsToMakeObject = {}
      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [universitySat(newUserLivestreamData, "numberOfRegistrations")]:
            increment(1),
         [universitySat(newUserLivestreamData, "numberOfParticipants")]:
            increment(1),
         [generalSat("numberOfParticipants")]: increment(1),
         [countrySat(newUserLivestreamData, "numberOfRegistrations")]:
            increment(1),
         [countrySat(newUserLivestreamData, "numberOfParticipants")]:
            increment(1),
         [fieldOfStudySat(newUserLivestreamData, "numberOfRegistrations")]:
            increment(1),
         [fieldOfStudySat(newUserLivestreamData, "numberOfParticipants")]:
            increment(1),
      })
   })

   test("should decrement universityStats property when user's university is removed", () => {
      const { newUserLivestreamData, oldUserLivestreamData } =
         createNewAndOldUserLivestreamData(
            {
               registered: true,
            },
            {
               universityData: { code: "u1", countryCode: "c1", name: "n1" },
               registered: true,
            }
         )

      const operationsToMakeObject: any = {}

      addOperations(
         newUserLivestreamData,
         oldUserLivestreamData,
         operationsToMakeObject
      )

      expect(operationsToMakeObject).toStrictEqual({
         [universitySat(oldUserLivestreamData, "numberOfRegistrations")]:
            increment(-1),
         [countrySat(oldUserLivestreamData, "numberOfRegistrations")]:
            increment(-1),
      })
   })

   test("should not throw an error when newUserLivestreamData or oldUserLivestreamData is null or undefined", () => {
      const operationsToMakeObject = {}
      expect(() =>
         addOperations(null, null, operationsToMakeObject)
      ).not.toThrow()
   })
})

const universitySat = (
   userLivestreamData: UserLivestreamData,
   statsProp: LivestreamStatsKey
) => `universityStats.${userLivestreamData.user.university.code}.${statsProp}`

const countrySat = (
   userLivestreamData: UserLivestreamData,
   statsProp: LivestreamStatsKey
) =>
   `countryStats.${userLivestreamData.user.universityCountryCode}.${statsProp}`
const fieldOfStudySat = (
   userLivestreamData: UserLivestreamData,
   statsProp: LivestreamStatsKey
) =>
   `fieldOfStudyStats.${userLivestreamData.user.fieldOfStudy?.id}.${statsProp}`

const generalSat = (statsProp: keyof LivestreamStatsMap) =>
   `generalStats.${statsProp}`
