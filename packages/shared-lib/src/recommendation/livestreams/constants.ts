export const RECOMMENDATION_POINTS = {
   // These values are isolated, as in the current design they are not needed
   pointsPerInterestMatch: 1,
   pointsPerCompanyIndustryMatch: 2,
   pointsPerCompanySizeMatch: 1,

   /** These values are in the same order as provided in the Figma design as to be easier to match the points system
      5 points if live stream TargetCountry matches
      5 points if live stream TargetFieldofStudy matches
      3 points if live stream TargetUniversity matches
      2 points if live stream TargetLevelofStudy matches
      15 points if Language matches
      10 points if Company matches
      2 points if company TargetCountry matches with user country
      1 point if company TargetCountry matches with user country of interest
      2 points if company TargetUniversity matches
      1 points if company TargetFieldofStudy matches
    */
   pointsPerUniversityCountryMatch: 5,
   pointsPerTargetUniversityNameMatch: 5,
   pointsPerFieldOfStudyMatch: 3,
   pointsPerTargetLevelOfStudyMatch: 2,
   pointsPerSpokenLanguageMatch: 15,
   pointsPerSpokenLanguageDeduct: 10,
   pointsPerCompanyMatch: 10,
   pointsPerCompanyTargetCountryMatch: 2,
   pointsPerCountryOfInterestMatch: 1,
   pointsPerCompanyTargetUniversitiesMatch: 2,
   pointsPerCompanyTargetFieldsOfStudyMatch: 1,

   // Aggregation points
   pointsIfJobsLinked: 10,
   popularityDenominator: 1000,
}
