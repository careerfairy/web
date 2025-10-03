import {
   OfflineEventStatsAction,
   OfflineEventUserStats,
} from "@careerfairy/shared-lib/offline-events/offline-events"
import { UserData } from "@careerfairy/shared-lib/users"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { buildOfflineEventStatsUpdateData } from "../util"

describe("buildOfflineEventStatsUpdateData", () => {
   const mockUserData = {
      authId: "user123",
      userEmail: "test@example.com",
      firstName: "Test",
      lastName: "User",
      university: {
         code: "TUM",
         name: "Technical University of Munich",
      },
      universityCountryCode: "DE",
      fieldOfStudy: {
         id: "cs",
         name: "Computer Science",
      },
      linkedinUrl: "",
      userResume: "",
      backFills: [],
      validationPin: 0,
      lastActivityAt: null,
      createdAt: null,
      id: "",
   } satisfies UserData

   describe("View Action - First Time", () => {
      it("should increment both total and unique talent reached for first view", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            null, // No existing user stats
            mockUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
            "generalStats.uniqueNumberOfTalentReached": FieldValue.increment(1),
         })
      })

      it("should increment university stats for first view", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            null,
            mockUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            "universityStats.DE_TUM.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "universityStats.DE_TUM.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
         })
      })

      it("should increment country stats for first view", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            null,
            mockUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            "countryStats.DE.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "countryStats.DE.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
         })
      })

      it("should increment field of study stats for first view", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            null,
            mockUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            "fieldOfStudyStats.cs.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "fieldOfStudyStats.cs.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
         })
      })
   })

   describe("View Action - Subsequent Views", () => {
      const existingUserStats: Partial<OfflineEventUserStats> = {
         user: mockUserData,
         lastSeenAt: {
            date: Timestamp.now(),
            utm: null,
         },
      }

      it("should increment only total talent reached for subsequent views", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            mockUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
         })
         // Should NOT include unique increment
         expect(result).not.toHaveProperty(
            "generalStats.uniqueNumberOfTalentReached"
         )
      })

      it("should increment only total university stats for subsequent views", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            mockUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            "universityStats.DE_TUM.totalNumberOfTalentReached":
               FieldValue.increment(1),
         })
         // Should NOT include unique increment
         expect(result).not.toHaveProperty(
            "universityStats.DE_TUM.uniqueNumberOfTalentReached"
         )
      })
   })

   describe("Click Action - First Time", () => {
      it("should increment both total and unique register clicks for first click", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.Click,
            null,
            mockUserData,
            "RegisterClicks"
         )

         expect(result).toMatchObject({
            "generalStats.totalNumberOfRegisterClicks": FieldValue.increment(1),
            "generalStats.uniqueNumberOfRegisterClicks":
               FieldValue.increment(1),
         })
      })

      it("should increment university stats for first click", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.Click,
            null,
            mockUserData,
            "RegisterClicks"
         )

         expect(result).toMatchObject({
            "universityStats.DE_TUM.totalNumberOfRegisterClicks":
               FieldValue.increment(1),
            "universityStats.DE_TUM.uniqueNumberOfRegisterClicks":
               FieldValue.increment(1),
         })
      })
   })

   describe("Click Action - Subsequent Clicks", () => {
      const existingUserStats: Partial<OfflineEventUserStats> = {
         user: mockUserData,
         listClickedAt: {
            date: Timestamp.now(),
            utm: null,
         },
      }

      it("should increment only total register clicks for subsequent clicks", () => {
         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.Click,
            existingUserStats,
            mockUserData,
            "RegisterClicks"
         )

         expect(result).toMatchObject({
            "generalStats.totalNumberOfRegisterClicks": FieldValue.increment(1),
         })
         // Should NOT include unique increment
         expect(result).not.toHaveProperty(
            "generalStats.uniqueNumberOfRegisterClicks"
         )
      })
   })

   describe("University Migration", () => {
      it("should transfer unique stats when user changes university (view action)", () => {
         const oldUserData = {
            ...mockUserData,
            university: {
               code: "LMU",
               name: "Ludwig Maximilian University",
            },
         }
         const existingUserStats: Partial<OfflineEventUserStats> = {
            user: oldUserData,
            lastSeenAt: {
               date: Timestamp.now(),
               utm: null,
            },
         }

         const newUserData = {
            ...mockUserData,
            university: {
               code: "TUM",
               name: "Technical University of Munich",
            },
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            newUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            // Decrement old university
            "universityStats.DE_LMU.uniqueNumberOfTalentReached":
               FieldValue.increment(-1),
            // Increment new university (both total and unique)
            "universityStats.DE_TUM.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "universityStats.DE_TUM.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
            // General stats should only increment total, not unique
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
         })
         // Should NOT increment general unique stats
         expect(result).not.toHaveProperty(
            "generalStats.uniqueNumberOfTalentReached"
         )
      })

      it("should transfer unique stats when user changes university (click action)", () => {
         const oldUserData = {
            ...mockUserData,
            university: {
               code: "LMU",
               name: "Ludwig Maximilian University",
            },
         }
         const existingUserStats: Partial<OfflineEventUserStats> = {
            user: oldUserData,
            listClickedAt: {
               date: Timestamp.now(),
               utm: null,
            },
         }

         const newUserData = {
            ...mockUserData,
            university: {
               code: "TUM",
               name: "Technical University of Munich",
            },
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.Click,
            existingUserStats,
            newUserData,
            "RegisterClicks"
         )

         expect(result).toMatchObject({
            // Decrement old university
            "universityStats.DE_LMU.uniqueNumberOfRegisterClicks":
               FieldValue.increment(-1),
            // Increment new university
            "universityStats.DE_TUM.totalNumberOfRegisterClicks":
               FieldValue.increment(1),
            "universityStats.DE_TUM.uniqueNumberOfRegisterClicks":
               FieldValue.increment(1),
         })
      })
   })

   describe("Country Migration", () => {
      it("should transfer unique stats when user changes country", () => {
         const oldUserData = {
            ...mockUserData,
            universityCountryCode: "FR",
         }
         const existingUserStats: Partial<OfflineEventUserStats> = {
            user: oldUserData,
            lastSeenAt: {
               date: Timestamp.now(),
               utm: null,
            },
         }

         const newUserData = {
            ...mockUserData,
            universityCountryCode: "DE",
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            newUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            // Decrement old country
            "countryStats.FR.uniqueNumberOfTalentReached":
               FieldValue.increment(-1),
            // Increment new country
            "countryStats.DE.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "countryStats.DE.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
            // University stats also change because key includes country code
            "universityStats.FR_TUM.uniqueNumberOfTalentReached":
               FieldValue.increment(-1),
            "universityStats.DE_TUM.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "universityStats.DE_TUM.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
         })
      })
   })

   describe("Field of Study Migration", () => {
      it("should transfer unique stats when user changes field of study", () => {
         const oldUserData = {
            ...mockUserData,
            fieldOfStudy: {
               id: "math",
               name: "Mathematics",
            },
         }
         const existingUserStats: Partial<OfflineEventUserStats> = {
            user: oldUserData,
            lastSeenAt: {
               date: Timestamp.now(),
               utm: null,
            },
         }

         const newUserData = {
            ...mockUserData,
            fieldOfStudy: {
               id: "cs",
               name: "Computer Science",
            },
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            newUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            // Decrement old field
            "fieldOfStudyStats.math.uniqueNumberOfTalentReached":
               FieldValue.increment(-1),
            // Increment new field
            "fieldOfStudyStats.cs.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "fieldOfStudyStats.cs.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
         })
      })
   })

   describe("Multiple Migrations at Once", () => {
      it("should handle all three migrations simultaneously", () => {
         const oldUserData: UserData = {
            ...mockUserData,
            university: {
               code: "LMU",
               name: "Ludwig Maximilian University",
            },
            universityCountryCode: "FR",
            fieldOfStudy: {
               id: "math",
               name: "Mathematics",
            },
         }
         const existingUserStats: Partial<OfflineEventUserStats> = {
            user: oldUserData,
            lastSeenAt: {
               date: Timestamp.now(),
               utm: null,
            },
         }

         const newUserData: UserData = {
            ...mockUserData,
            university: {
               code: "TUM",
               name: "Technical University of Munich",
            },
            universityCountryCode: "DE",
            fieldOfStudy: {
               id: "cs",
               name: "Computer Science",
            },
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            newUserData,
            "TalentReached"
         )

         expect(result).toMatchObject({
            // Decrements from old values (university key now includes country)
            "universityStats.FR_LMU.uniqueNumberOfTalentReached":
               FieldValue.increment(-1),
            "countryStats.FR.uniqueNumberOfTalentReached":
               FieldValue.increment(-1),
            "fieldOfStudyStats.math.uniqueNumberOfTalentReached":
               FieldValue.increment(-1),
            // Increments to new values
            "universityStats.DE_TUM.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "universityStats.DE_TUM.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
            "countryStats.DE.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "countryStats.DE.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
            "fieldOfStudyStats.cs.totalNumberOfTalentReached":
               FieldValue.increment(1),
            "fieldOfStudyStats.cs.uniqueNumberOfTalentReached":
               FieldValue.increment(1),
            // General stats should only increment total
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
         })
      })
   })

   describe("Edge Cases", () => {
      it("should handle user with no university data", () => {
         const userWithoutUniversity = {
            ...mockUserData,
            university: undefined,
            universityCountryCode: undefined,
            fieldOfStudy: undefined,
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            null,
            userWithoutUniversity,
            "TalentReached"
         )

         // Should only have general stats
         expect(result).toMatchObject({
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
            "generalStats.uniqueNumberOfTalentReached": FieldValue.increment(1),
         })

         // Should not have any segmented stats
         expect(
            Object.keys(result).some((key) => key.startsWith("universityStats"))
         ).toBe(false)
         expect(
            Object.keys(result).some((key) => key.startsWith("countryStats"))
         ).toBe(false)
         expect(
            Object.keys(result).some((key) =>
               key.startsWith("fieldOfStudyStats")
            )
         ).toBe(false)
      })

      it("should not decrement when user removes university (edge case)", () => {
         const oldUserData = {
            ...mockUserData,
            university: {
               code: "TUM",
               name: "Technical University of Munich",
            },
         }
         const existingUserStats: Partial<OfflineEventUserStats> = {
            user: oldUserData,
            lastSeenAt: {
               date: Timestamp.now(),
               utm: null,
            },
         }

         const newUserData = {
            ...mockUserData,
            university: undefined,
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            newUserData,
            "TalentReached"
         )

         // Should only increment general total stats
         expect(result).toMatchObject({
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
         })

         // Should NOT decrement old university (user just removed it, not migrated)
         expect(Object.keys(result).some((key) => key.includes("DE_TUM"))).toBe(
            false
         )
      })

      it("should handle adding university for first time after previous action", () => {
         const oldUserData = {
            ...mockUserData,
            university: undefined,
         }
         const existingUserStats: Partial<OfflineEventUserStats> = {
            user: oldUserData,
            lastSeenAt: {
               date: Timestamp.now(),
               utm: null,
            },
         }

         const newUserData = {
            ...mockUserData,
            university: {
               code: "TUM",
               name: "Technical University of Munich",
            },
         }

         const result = buildOfflineEventStatsUpdateData(
            OfflineEventStatsAction.View,
            existingUserStats,
            newUserData,
            "TalentReached"
         )

         // Should only increment total for university (not unique, as user already viewed)
         // The user was already counted as a unique viewer at the general level
         expect(result).toMatchObject({
            "universityStats.DE_TUM.totalNumberOfTalentReached":
               FieldValue.increment(1),
            // General should only increment total
            "generalStats.totalNumberOfTalentReached": FieldValue.increment(1),
         })

         // Should NOT increment unique university stat (user already viewed)
         expect(result).not.toHaveProperty(
            "universityStats.DE_TUM.uniqueNumberOfTalentReached"
         )
      })
   })
})
