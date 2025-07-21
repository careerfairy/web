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
      it("should match user by country only (any university)", () => {
         const targeting = {
            countries: ["CH", "US"],
            universities: [], // No specific universities = all universities in these countries
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

      it("should match user by country AND specific university", () => {
         const targeting = {
            countries: ["CH", "US"],
            universities: [
               { id: "ethz_code", name: "ETH Zurich", country: "CH" },
               { id: "mit_code", name: "MIT", country: "US" },
            ],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(true)
      })

      it("should not match user when country matches but university doesn't", () => {
         const targeting = {
            countries: ["CH"],
            universities: [
               { id: "epfl_code", name: "EPFL", country: "CH" }, // Only EPFL, not ETH
            ],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })

      it("should match user by field of study", () => {
         const targeting = {
            countries: [],
            universities: [],
            fieldsOfStudy: ["computer_science", "engineering"],
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

   describe("🎯 User's specific use case: Specific universities in Germany, all universities in Switzerland", () => {
      const germanTUMStudent = {
         universityCountryCode: "DE",
         university: { code: "tum_code", name: "TU Munich" },
         fieldOfStudy: { id: "computer_science", name: "Computer Science" },
      }

      const germanHeidelbergStudent = {
         universityCountryCode: "DE",
         university: {
            code: "heidelberg_code",
            name: "University of Heidelberg",
         },
         fieldOfStudy: { id: "computer_science", name: "Computer Science" },
      }

      const swissETHStudent = {
         universityCountryCode: "CH",
         university: { code: "ethz_code", name: "ETH Zurich" },
         fieldOfStudy: { id: "computer_science", name: "Computer Science" },
      }

      const swissUniBernStudent = {
         universityCountryCode: "CH",
         university: { code: "unibe_code", name: "University of Bern" },
         fieldOfStudy: { id: "computer_science", name: "Computer Science" },
      }

      it("✅ should match German student at TUM (specific university targeted)", () => {
         const targeting = {
            countries: ["DE", "CH"], // Target both Germany and Switzerland
            universities: [
               { id: "tum_code", name: "TU Munich", country: "DE" },
               { id: "rwth_code", name: "RWTH Aachen", country: "DE" },
               // No Swiss universities specified = all Swiss universities allowed
            ],
            fieldsOfStudy: ["computer_science"],
         }

         expect(userMatchesTargeting(germanTUMStudent, targeting)).toBe(true)
      })

      it("❌ should NOT match German student at Heidelberg (not in targeted universities)", () => {
         const targeting = {
            countries: ["DE", "CH"], // Target both Germany and Switzerland
            universities: [
               { id: "tum_code", name: "TU Munich", country: "DE" },
               { id: "rwth_code", name: "RWTH Aachen", country: "DE" },
               // No Swiss universities specified = all Swiss universities allowed
            ],
            fieldsOfStudy: ["computer_science"],
         }

         expect(userMatchesTargeting(germanHeidelbergStudent, targeting)).toBe(
            false
         )
      })

      it("✅ should match ANY Swiss student (no Swiss universities specified = all allowed)", () => {
         const targeting = {
            countries: ["DE", "CH"], // Target both Germany and Switzerland
            universities: [
               { id: "tum_code", name: "TU Munich", country: "DE" },
               { id: "rwth_code", name: "RWTH Aachen", country: "DE" },
               // No Swiss universities specified = all Swiss universities allowed
            ],
            fieldsOfStudy: ["computer_science"],
         }

         expect(userMatchesTargeting(swissETHStudent, targeting)).toBe(true)
         expect(userMatchesTargeting(swissUniBernStudent, targeting)).toBe(true)
      })

      it("✅ should work with mixed targeting: specific German unis + specific Swiss unis", () => {
         const targeting = {
            countries: ["DE", "CH"],
            universities: [
               { id: "tum_code", name: "TU Munich", country: "DE" },
               { id: "rwth_code", name: "RWTH Aachen", country: "DE" },
               { id: "ethz_code", name: "ETH Zurich", country: "CH" },
               { id: "epfl_code", name: "EPFL", country: "CH" },
            ],
            fieldsOfStudy: ["computer_science"],
         }

         expect(userMatchesTargeting(germanTUMStudent, targeting)).toBe(true)
         expect(userMatchesTargeting(germanHeidelbergStudent, targeting)).toBe(
            false
         )
         expect(userMatchesTargeting(swissETHStudent, targeting)).toBe(true)
         expect(userMatchesTargeting(swissUniBernStudent, targeting)).toBe(
            false
         ) // Not EPFL or ETH
      })

      it("✅ perfect use case: specific German universities + all Swiss universities", () => {
         const targeting = {
            countries: ["DE", "CH"], // Target both countries
            universities: [
               // Only specify German universities
               { id: "tum_code", name: "TU Munich", country: "DE" },
               { id: "rwth_code", name: "RWTH Aachen", country: "DE" },
               // Don't specify any Swiss universities = all Swiss universities allowed
            ],
            fieldsOfStudy: ["computer_science"],
         }

         // German students: only TUM and RWTH should match
         expect(userMatchesTargeting(germanTUMStudent, targeting)).toBe(true)
         expect(userMatchesTargeting(germanHeidelbergStudent, targeting)).toBe(
            false
         )

         // Swiss students: all should match (no Swiss universities specified)
         expect(userMatchesTargeting(swissETHStudent, targeting)).toBe(true)
         expect(userMatchesTargeting(swissUniBernStudent, targeting)).toBe(true)
      })
   })

   describe("Combined criteria matching", () => {
      it("should match user when both country and field of study match", () => {
         const targeting = {
            countries: ["CH", "US"],
            universities: [],
            fieldsOfStudy: ["computer_science", "engineering"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(true)
      })

      it("should not match user when country matches but field of study doesn't", () => {
         const targeting = {
            countries: ["CH", "US"],
            universities: [],
            fieldsOfStudy: ["medicine", "law"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })

      it("should not match user when field of study matches but country doesn't", () => {
         const targeting = {
            countries: ["US", "DE"],
            universities: [],
            fieldsOfStudy: ["computer_science"],
         }

         expect(userMatchesTargeting(sampleUser, targeting)).toBe(false)
      })
   })

   describe("Edge cases with missing user data", () => {
      it("should not match when user has no country but targeting requires country", () => {
         const userWithoutCountry = {
            university: { code: "ethz_code", name: "ETH Zurich" },
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: ["CH"],
            universities: [],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(userWithoutCountry, targeting)).toBe(false)
      })

      it("should not match when user has no university but targeting requires specific university", () => {
         const userWithoutUniversity = {
            universityCountryCode: "CH",
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: ["CH"],
            universities: [
               { id: "ethz_code", name: "ETH Zurich", country: "CH" },
            ],
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(userWithoutUniversity, targeting)).toBe(
            false
         )
      })

      it("should match when user has no university but no specific universities required", () => {
         const userWithoutUniversity = {
            universityCountryCode: "CH",
            fieldOfStudy: { id: "computer_science", name: "Computer Science" },
         }

         const targeting = {
            countries: ["CH"],
            universities: [], // No specific universities required
            fieldsOfStudy: [],
         }

         expect(userMatchesTargeting(userWithoutUniversity, targeting)).toBe(
            true
         )
      })

      it("should not match when user has no field of study but targeting requires it", () => {
         const userWithoutFieldOfStudy = {
            universityCountryCode: "CH",
            university: { code: "ethz_code", name: "ETH Zurich" },
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
   })
})
