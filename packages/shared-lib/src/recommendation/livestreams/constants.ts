export const RECOMMENDATION_POINTS = {
   // These values are isolated, as in the current design they are not needed
   POINTS_PER_INTEREST_MATCH: 1,
   POINTS_PER_COMPANY_INDUSTRY_MATCH: 2,
   POINTS_PER_COMPANY_SIZE_MATCH: 1,

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
   POINTS_PER_UNIVERSITY_COUNTRY_MATCH: 5,
   POINTS_PER_TARGET_UNIVERSITY_NAME_MATCH: 5,
   POINTS_PER_FIELD_OF_STUDY_MATCH: 3,
   POINTS_PER_TARGET_LEVEL_OF_STUDY_MATCH: 2,
   POINTS_PER_SPOKEN_LANGUAGE_MATCH: 15,
   POINTS_PER_SPOKEN_LANGUAGE_DEDUCT: 10,
   POINTS_PER_COMPANY_MATCH: 10,
   POINTS_PER_COMPANY_TARGET_COUNTRY_MATCH: 2,
   POINTS_PER_COUNTRY_OF_INTEREST_MATCH: 1,
   POINTS_PER_COMPANY_TARGET_UNIVERSITIES_MATCH: 2,
   POINTS_PER_COMPANY_TARGET_FIELDS_OF_STUDY_MATCH: 1,

   // Initial points calculation
   POINTS_IF_JOBS_LINKED: 10,
   POPULARITY_NUMERATOR: 1000,
}
