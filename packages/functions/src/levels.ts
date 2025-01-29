import { Group, PublicGroup } from "@careerfairy/shared-lib/groups"
import { Creator } from "@careerfairy/shared-lib/groups/creators"
import { LevelsMentor } from "@careerfairy/shared-lib/talent-guide/types"
import * as functions from "firebase-functions"
import { uniqBy } from "lodash"
import { groupRepo, userRepo } from "./api/repositories"
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import { userAuthExists } from "./middlewares/validations"

const CAREER_FAIRY_GROUP_ID = "i8NjOiRu85ohJWDuFPwo"
const MIN_CREATORS_COUNT = 8

export const mapCreatorToLevelsMentors = (
   creator: Creator,
   followedCompany: Group | PublicGroup
) => {
   return {
      ...creator,
      companyName: followedCompany.universityName,
      companyLogoUrl: followedCompany.logoUrl,
   }
}

export const getFollowedCreators = functions.region(config.region).https.onCall(
   middlewares(userAuthExists(), async (_, context) => {
      try {
         const userEmail = context.auth.token.email

         const followedCompanies = await userRepo.getCompaniesUserFollows(
            userEmail,
            8
         )

         const followedCompaniesLookup = followedCompanies.reduce(
            (acc, company) => ({
               ...acc,
               [company.groupId]: company.group,
            }),
            {}
         )

         const creatorsPromises = (followedCompanies ?? []).map((company) =>
            groupRepo.getCreatorsWithPublicContent(company.group)
         )

         let creators = (await Promise.all(creatorsPromises)).flat()
         creators = uniqBy(creators, "id")

         let levelsMentors: LevelsMentor[] = creators.map((creator) => {
            return mapCreatorToLevelsMentors(
               creator,
               followedCompaniesLookup[creator.groupId]
            )
         })

         if (levelsMentors.length < MIN_CREATORS_COUNT) {
            const careerFairyGroup = await groupRepo.getGroupById(
               CAREER_FAIRY_GROUP_ID
            )

            if (careerFairyGroup) {
               const allCareerFairyCreators =
                  await groupRepo.getCreatorsWithPublicContent(careerFairyGroup)

               const careerFairyCreatorsWithLinkedIn =
                  allCareerFairyCreators.filter(
                     (creator) =>
                        creator.linkedInUrl && creator.linkedInUrl.trim() !== ""
                  )

               const careerFairyMentors = careerFairyCreatorsWithLinkedIn.map(
                  (creator) =>
                     mapCreatorToLevelsMentors(creator, careerFairyGroup)
               )

               const creatorsNeeded = MIN_CREATORS_COUNT - creators.length
               levelsMentors = levelsMentors.concat(
                  careerFairyMentors.slice(0, creatorsNeeded)
               )
            }
         }

         return levelsMentors
      } catch (error) {
         functions.logger.error("Error in getFollowedCreators:", error)
         throw new functions.https.HttpsError(
            "internal",
            "Error fetching followed creators"
         )
      }
   })
)
