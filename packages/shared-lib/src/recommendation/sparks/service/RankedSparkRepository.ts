import { FieldOfStudyCategory } from "../../../fieldOfStudy"
import { GroupOption, PublicGroup } from "../../../groups"
import { Spark, SparkStats } from "../../../sparks/sparks"
import { sortSparkStats } from "../../../utils/utils"
import { sortRankedByPoints } from "../../utils"
import { RankedSpark } from "../RankedSpark"

type RankSparkArgs = {
   rankedSparks: RankedSpark[]
   targetUserIds: unknown[]
   targetSparkIdsGetter: (stream: RankedSpark) => string[]
   pointsPerMatch: number
   pointsPerMissingMatch?: number
}

/**
 * Repository that fetches sparks accordingly with some filters and ranks them
 *
 * Currently fetches the data from Firestore directly but we can
 * update it to fetch the data from a data bundle
 */
export class RankedSparkRepository {
   private readonly featuredGroupSparkPointsMultiplier = 1.25
   // from userData
   private readonly pointsPerTargetedCountryMatch = 5
   private readonly pointsPerTargetedFieldOfStudyMatch = 5
   private readonly pointsPerTargetedUniversityMatch = 2

   // from sparks
   private readonly pointsPerCompanyCountryMatch = 4
   private readonly pointsPerCompanyIndustryMatch = 2
   private readonly pointsPerCompanySizeMatch = 1
   private readonly pointsPerQuestionCategoryMatch = 4

   private readonly pointsToDeductPerSeenSpark = -30
   private readonly pointsPerTrialPlan = 15

   private readonly sparks: RankedSpark[]

   constructor(sparksStats: SparkStats[]) {
      const filtered = sparksStats.filter((stat) => stat.spark.published)

      // sort in place asc
      filtered.sort((a, b) => sortSparkStats(a, b, true))

      this.sparks = filtered.map(RankedSpark.create)
   }

   public getAllInitialRankedSparks(): RankedSpark[] {
      return this.sparks
   }
   /**
    * Get sparks based on the countries of interest
    *
    * @param countriesIds - Array of country IDs
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the countries of interest
    */
   public getSparksBasedOnCountriesOfInterest(
      countriesIds: string[],
      limit = 30
   ): RankedSpark[] {
      // Get sparks filtered by targeted countries based on the countries of interest
      const sparks = this.getSparksFilteredByGroupArrayFields(
         "targetedCountries",
         countriesIds,
         limit,
         "id"
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerTargetedCountryMatch,
         rankedSparks: sparks,
         targetUserIds: countriesIds,
         targetSparkIdsGetter: (spark) => spark.getCompanyTargetCountriesIds(),
      })
   }

   /**
    * Get sparks based on the university country code
    *
    * @param universityCountryCode - Country code of the university
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the university country code
    */
   public getSparksBasedOnUniversityCountryCode(
      universityCountryCode: string,
      limit = 30
   ): RankedSpark[] {
      // Get sparks filtered by targeted universities based on the university country
      const sparks = this.getSparksFilteredByGroupArrayFields(
         "targetedUniversities",
         [universityCountryCode],
         limit,
         "country"
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerTargetedUniversityMatch,
         rankedSparks: sparks,
         targetUserIds: [universityCountryCode],
         targetSparkIdsGetter: (spark) =>
            spark.getCompanyTargetUniversityCountryIds(),
      })
   }

   /**
    * Get sparks based on the university code
    *
    * @param universityCode - Code of the university
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the university code
    */
   public getSparksBasedOnUniversityCode(
      universityCode: string,
      limit = 30
   ): RankedSpark[] {
      // Get sparks filtered by targeted universities based on the university code
      const sparks = this.getSparksFilteredByGroupArrayFields(
         "targetedUniversities",
         [universityCode],
         limit,
         "id"
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerTargetedUniversityMatch,
         rankedSparks: sparks,
         targetUserIds: [universityCode],
         targetSparkIdsGetter: (spark) => spark.getCompanyTargetUniversityIds(),
      })
   }

   /**
    * Get sparks based on the field of studies
    *
    * @param fieldOfStudyIds - Array of field of study IDs
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the field of studies
    */
   public getSparksBasedOnFieldOfStudies(
      fieldOfStudyIds: string[],
      limit = 30
   ): RankedSpark[] {
      // Get sparks filtered by targeted fields of study
      const sparks = this.getSparksFilteredByGroupArrayFields(
         "targetedFieldsOfStudy",
         fieldOfStudyIds,
         limit,
         "id"
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerTargetedFieldOfStudyMatch,
         rankedSparks: sparks,
         targetUserIds: fieldOfStudyIds,
         targetSparkIdsGetter: (spark) =>
            spark.getCompanyTargetFieldsOfStudyIds(),
      })
   }

   /**
    * Get sparks based on the trial plan
    *
    * @param trialPlanIds - Array of trial plan IDs
    * @returns Array of ranked sparks based on the trial plan
    */
   public getSparksBasedOnTrialPlan(trialPlanIds: string[]): RankedSpark[] {
      // Get sparks filtered by trial plan
      const sparks = this.getSparksFilteredByField(
         "id",
         trialPlanIds,
         trialPlanIds.length
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerTrialPlan,
         rankedSparks: sparks,
         targetUserIds: trialPlanIds,
         targetSparkIdsGetter: (spark) => [spark.getId()],
      })
   }

   /**
    * Get sparks based on the company's country
    *
    * @param companyCountryIds - Array of company country IDs
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the company's country
    */
   public getSparksBasedOnCompanyCountry(
      companyCountryIds: string[],
      limit = 30
   ): RankedSpark[] {
      // Get sparks filtered by company's country
      const sparks = this.getSparksFilteredByGroupArrayFields(
         "companyCountry",
         companyCountryIds,
         limit,
         "id"
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerCompanyCountryMatch,
         rankedSparks: sparks,
         targetUserIds: companyCountryIds,
         targetSparkIdsGetter: (spark) => [spark.getCompanyCountryId()],
      })
   }

   /**
    * Get sparks based on the company's industries
    *
    * @param industriesIds - Array of industry IDs
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the industries
    */
   public getSparksBasedOnIndustries(
      industriesIds: string[],
      limit = 30
   ): RankedSpark[] {
      // Get sparks filtered by company's industries
      const sparks = this.getSparksFilteredByGroupArrayFields(
         "companyIndustries",
         industriesIds,
         limit,
         "id"
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerCompanyIndustryMatch,
         rankedSparks: sparks,
         targetUserIds: industriesIds,
         targetSparkIdsGetter: (spark) => spark.getCompanyIndustryIds(),
      })
   }

   /**
    * Get sparks based on the company's size
    *
    * @param companySizes - Array of company size IDs
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the company's size
    */
   public getSparksBasedOnCompanySizes(
      companySizes: string[],
      limit = 30
   ): RankedSpark[] {
      const sparks = this.getSparksFilteredByGroupArrayFields(
         "companySize",
         companySizes,
         limit
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerCompanySizeMatch,
         rankedSparks: sparks,
         targetUserIds: companySizes,
         targetSparkIdsGetter: (spark) => [spark.getCompanySize()],
      })
   }

   /**
    * Get sparks based on the category IDs
    *
    * @param categoryIds - Array of category IDs
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks based on the category IDs
    */
   public getSparksBasedOnCategory(
      categoryIds: string[],
      limit = 30
   ): RankedSpark[] {
      // Get sparks filtered by category IDs
      const sparks = this.getSparksFilteredByField(
         "category",
         categoryIds,
         limit
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsPerQuestionCategoryMatch,
         rankedSparks: sparks,
         targetUserIds: categoryIds,
         targetSparkIdsGetter: (spark) => [spark.getCategoryId()],
      })
   }

   /**
    * Apply featured group spark points multiplier, if the spark belongs to a featured group and
    * the user belongs to the target audience and country.
    *
    * @param sparks - Array of ranked sparks
    * @param countryIsoCode - Country ISO code
    * @param fieldOfStudyCategory - Field of study category
    * @returns Array of ranked sparks after applying the multiplier
    */
   public applyFeaturedGroupSparkPointsMultiplier(
      sparks: RankedSpark[],
      countryIsoCode: string,
      fieldOfStudyCategory: FieldOfStudyCategory
   ): RankedSpark[] {
      if (countryIsoCode && fieldOfStudyCategory) {
         sparks.forEach((rankedSpark) => {
            if (
               rankedSpark.model.spark.group?.featured?.targetAudience?.includes(
                  fieldOfStudyCategory
               ) &&
               rankedSpark.model.spark.group?.featured?.targetCountries?.includes(
                  countryIsoCode
               ) &&
               rankedSpark.getPoints() > 0
            ) {
               rankedSpark.setPoints(
                  rankedSpark.getPoints() *
                     this.featuredGroupSparkPointsMultiplier
               )
            }
         })
      }

      return sparks
   }

   /**
    * Deduct points for seen sparks
    *
    * @param seenSparkIds - Array of seen spark IDs
    * @returns Array of ranked sparks after deducting points for seen sparks
    */
   public deductSeenSparks(seenSparkIds: string[]): RankedSpark[] {
      // Get sparks filtered by IDs
      const sparks = this.getSparksFilteredByField(
         "id",
         seenSparkIds,
         seenSparkIds.length
      )

      return this.rankSparks({
         pointsPerMatch: this.pointsToDeductPerSeenSpark,
         rankedSparks: sparks,
         targetUserIds: seenSparkIds,
         targetSparkIdsGetter: (spark) => [spark.getId()],
      })
   }

   /**
    * Filter sparks by a specific fields
    *
    * @param field - The field to filter by
    * @param values - Array of values to match
    * @param limit - Maximum number of sparks to return
    * @returns Array of ranked sparks filtered by the specified field ID
    */
   private getSparksFilteredByField(
      field: keyof Omit<
         Spark,
         "contentTopicsTagIds" | "languageTagIds" | "linkedCustomJobsTagIds"
      >,
      values: unknown[],
      limit: number
   ): RankedSpark[] {
      return this.sparks
         .filter((rankedSpark) => {
            const sparkFieldValue = rankedSpark.model.spark[field]

            // When adding other fields to Spark it should be omitted
            if (sparkFieldValue && Array.isArray(sparkFieldValue)) {
               return sparkFieldValue.some((value) =>
                  values.includes(value?.id)
               )
            }

            if (sparkFieldValue && typeof sparkFieldValue === "string") {
               return values.includes(sparkFieldValue)
            }

            if (
               sparkFieldValue &&
               typeof sparkFieldValue === "object" &&
               "id" in sparkFieldValue
            ) {
               return values.includes(sparkFieldValue?.id)
            }

            return false
         })
         .slice(0, limit)
   }

   /**
    * Filter sparks by group array fields
    *
    * @param field - The field to filter by
    * @param values - Array of values to match
    * @param limit - Maximum number of sparks to return
    * @param validationField - The field to validate against
    * @returns Array of ranked sparks filtered by the specified group array fields
    */
   private getSparksFilteredByGroupArrayFields(
      field: keyof PublicGroup,
      values: unknown[],
      limit: number,
      validationField?: keyof GroupOption | "country"
   ): RankedSpark[] {
      return this.sparks
         .filter((spark) => {
            const sparkFieldValue = spark.model.spark.group[field]

            if (
               sparkFieldValue &&
               Array.isArray(sparkFieldValue) &&
               validationField
            ) {
               return sparkFieldValue.some((value) =>
                  values.includes(value[validationField])
               )
            }

            if (sparkFieldValue && typeof sparkFieldValue === "string") {
               return values.includes(sparkFieldValue)
            }

            if (
               sparkFieldValue &&
               typeof sparkFieldValue === "object" &&
               "id" in sparkFieldValue
            ) {
               return values.includes(sparkFieldValue?.id)
            }

            return false
         })
         .slice(0, limit)
   }

   private rankSparks({
      pointsPerMatch,
      rankedSparks,
      targetSparkIdsGetter,
      targetUserIds,
      pointsPerMissingMatch = 0,
   }: RankSparkArgs): RankedSpark[] {
      rankedSparks.forEach((rankedSpark) => {
         // This is the number of matches between the user's industries or
         // company location, etc and the sparks's interests or field Of Studies, etc

         const targetIds = targetSparkIdsGetter(rankedSpark)

         const numMatches = targetIds.filter((sparkDataId) =>
            targetUserIds.includes(sparkDataId)
         ).length

         const numMissingMatches = targetUserIds.length - numMatches

         if (numMissingMatches > 0) {
            const missMatchPoints = numMissingMatches * pointsPerMissingMatch
            rankedSpark.addPoints(missMatchPoints)
         }

         // Add points to the event based on the number of matches
         rankedSpark.addPoints(numMatches * pointsPerMatch)
      })

      return sortRankedByPoints<RankedSpark>(rankedSparks) // Sort the events by points
   }
}
