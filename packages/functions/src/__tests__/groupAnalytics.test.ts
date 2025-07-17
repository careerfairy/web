import { userMatchesTargeting } from "../groupAnalytics"

describe("userMatchesTargeting", () => {
   const sampleUser = {
      universityCountryCode: "CH",
      university: { code: "ethz_code", name: "ETH Zurich" },
      fieldOfStudy: { id: "computer_science", name: "Computer Science" },
   }

   describe("Empty targeting (no criteria)", () => {
      it("should return true when no targeting criteria are provided", () => {
         const targeting = {
            countries: [],
            universities: [],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(true)
      })
   })

   describe("Single criterion matching", () => {
      it("should match user by country", () => {
         const targeting = {
            countries: ["CH", "US"],
            universities: [],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(true)
      })

      it("should not match user by wrong country", () => {
         const targeting = {
            countries: ["US", "DE"],
            universities: [],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })

      it("should match user by university", () => {
         const targeting = {
            countries: [],
            universities: ["ethz_code", "mit_code"],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(true)
      })

      it("should not match user by wrong university", () => {
         const targeting = {
            countries: [],
            universities: ["mit_code", "stanford_code"],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })

      it("should match user by field of study", () => {
         const targeting = {
            countries: [],
            universities: [],
            fieldsOfStudy: ["computer_science", "engineering"], // Field of study IDs, not names
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(true)
      })

      it("should not match user by wrong field of study", () => {
         const targeting = {
            countries: [],
            universities: [],
            fieldsOfStudy: ["medicine", "law"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })
   })

   describe("Multiple criteria matching (AND logic)", () => {
      it("should match user when ALL criteria match", () => {
         const targeting = {
            countries: ["CH", "US"],
            universities: ["ethz_code", "mit_code"],
            fieldsOfStudy: ["computer_science", "engineering"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(true)
      })

      it("should not match user when country matches but university doesn't", () => {
         const targeting = {
            countries: ["CH", "US"],
            universities: ["mit_code", "stanford_code"],
            fieldsOfStudy: ["computer_science", "engineering"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })

      it("should not match user when university matches but country doesn't", () => {
         const targeting = {
            countries: ["US", "DE"],
            universities: ["ethz_code", "mit_code"],
            fieldsOfStudy: ["computer_science", "engineering"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })

      it("should not match user when field of study matches but others don't", () => {
         const targeting = {
            countries: ["US", "DE"],
            universities: ["mit_code", "stanford_code"],
            fieldsOfStudy: ["computer_science", "engineering"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })
   })

   describe("Edge cases with missing user data", () => {
      it("should not match when user has no country but targeting requires country", () => {
         const userWithoutCountry = {
            university: { code: "ethz", name: "ETH Zurich" },
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: ["CH"],
            universities: [],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(userWithoutCountry, targeting)).toBe(false)
      })

      it("should not match when user has no university but targeting requires university", () => {
         const userWithoutUniversity = {
            universityCountryCode: "CH",
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: [],
            universities: ["ethz_code"],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(userWithoutUniversity, targeting)).toBe(
            false
         )
      })

      it("should not match when user has no field of study but targeting requires it", () => {
         const userWithoutFieldOfStudy = {
            universityCountryCode: "CH",
            university: { code: "ethz", name: "ETH Zurich" },
         }

         const targeting = {
            countries: [],
            universities: [],
            fieldsOfStudy: ["computer_science"],
         }

         expect(userMatchesTargeting(userWithoutFieldOfStudy, targeting)).toBe(
            false
         )
      })

      it("should not match when university exists but has no code", () => {
         const userWithUniversityButNoCode = {
            universityCountryCode: "CH",
            university: { name: "ETH Zurich" },
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: [],
            universities: ["ethz_code"],
            fieldsOfStudy: [],
         }

         expect(
            userMatchesTargeting(userWithUniversityButNoCode, targeting)
         ).toBe(false)
      })

      it("should not match when field of study exists but has no id", () => {
         const userWithFieldOfStudyButNoId = {
            universityCountryCode: "CH",
            university: { code: "ethz", name: "ETH Zurich" },
            fieldOfStudy: { name: "Computer Science" },
         }

         const targeting = {
            countries: [],
            universities: [],
            fieldsOfStudy: ["computer_science"],
         }

         expect(
            userMatchesTargeting(userWithFieldOfStudyButNoId, targeting)
         ).toBe(false)
      })
   })

   describe("Real-world scenarios", () => {
      it("should match Swiss computer science students at ETH", () => {
         const swissETHCSStudent = {
            universityCountryCode: "CH",
            university: { code: "ethz_code", name: "ETH Zurich" },
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: ["CH"],
            universities: ["ethz_code", "epfl_code"],
            fieldsOfStudy: ["computer_science", "engineering"],
         }

         expect(userMatchesTargeting(swissETHCSStudent, targeting)).toBe(true)
      })

      it("should not match American MIT students when targeting only Swiss universities", () => {
         const americanMITStudent = {
            universityCountryCode: "US",
            university: { code: "mit_code", name: "MIT" },
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: ["CH"],
            universities: ["ethz_code", "epfl_code"],
            fieldsOfStudy: ["computer_science", "engineering"],
         }

         expect(userMatchesTargeting(americanMITStudent, targeting)).toBe(false)
      })

      it("should handle targeting with only some criteria specified", () => {
         const germanStudent = {
            universityCountryCode: "DE",
            university: { code: "tum_code", name: "TU Munich" },
            fieldOfStudy: { id: "engineering", name: "Engineering" },
         }

         // Only targeting specific fields of study, any country/university
         const targeting = {
            countries: [],
            universities: [],
            fieldsOfStudy: ["engineering", "computer_science"],
         }

         expect(userMatchesTargeting(germanStudent, targeting)).toBe(true)
      })
   })
})
