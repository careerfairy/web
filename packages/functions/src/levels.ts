import { CreatorWithContent } from "@careerfairy/shared-lib/groups/creators"
import * as functions from "firebase-functions"
import { uniqBy } from "lodash"
import { groupRepo, userRepo } from "./api/repositories"
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import { userAuthExists } from "./middlewares/validations"

const CAREER_FAIRY_GROUP_ID = "i8NjOiRu85ohJWDuFPwo"
const MAX_CREATORS_COUNT = 8

export const mapCreatorToLevelsMentors = (
   creator: CreatorWithContent
): CreatorWithContent => {
   return {
      ...creator,
      numberOfContent: creator.numberOfContent,
      companyName: creator.companyName,
      companyLogoUrl: creator.companyLogoUrl,
      companyBannerUrl: creator.companyBannerUrl,
   }
}

export const getFollowedCreators = functions.region(config.region).https.onCall(
   middlewares(userAuthExists(), async (_, context) => {
      try {
         const userEmail = context.auth.token.email

         const allFollowedCompanies = await userRepo.getCompaniesUserFollows(
            userEmail,
            20
         )

         const followedCompanies = allFollowedCompanies.filter(
            (company) => company.groupId !== CAREER_FAIRY_GROUP_ID
         )

         const creatorsPromises = (followedCompanies ?? []).map((company) =>
            groupRepo.getMentorsForLevels(company.group)
         )

         const creatorsWithContent = (
            await Promise.all(creatorsPromises)
         ).flat()

         const levelsMentors: CreatorWithContent[] = uniqBy(
            creatorsWithContent,
            "id"
         )
            .sort((a, b) => b.numberOfContent - a.numberOfContent)
            .slice(0, MAX_CREATORS_COUNT)
            .map(mapCreatorToLevelsMentors)

         if (levelsMentors.length == MAX_CREATORS_COUNT) {
            return levelsMentors
         }

         const careerFairyGroup = await groupRepo.getGroupById(
            CAREER_FAIRY_GROUP_ID
         )

         if (!careerFairyGroup) {
            return levelsMentors
         }

         const allCareerFairyCreators = await groupRepo.getMentorsForLevels(
            careerFairyGroup
         )

         const careerFairyCreatorsWithLinkedIn = allCareerFairyCreators.filter(
            (creator) =>
               creator.linkedInUrl && creator.linkedInUrl.trim() !== ""
         )

         const careerFairyMentors = careerFairyCreatorsWithLinkedIn
            .sort((a, b) => b.numberOfContent - a.numberOfContent)
            .map(mapCreatorToLevelsMentors)

         const creatorsNeeded = MAX_CREATORS_COUNT - levelsMentors.length

         const result = levelsMentors.concat(
            careerFairyMentors.slice(0, creatorsNeeded)
         )

         return result
      } catch (error) {
         functions.logger.error("Error in getFollowedCreators:", error)
         throw new functions.https.HttpsError(
            "internal",
            "Error fetching followed creators"
         )
      }
   })
)
