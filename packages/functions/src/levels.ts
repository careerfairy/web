import * as functions from "firebase-functions"
import { uniqBy } from "lodash"
import { groupRepo, userRepo } from "./api/repositories"
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import { userAuthExists } from "./middlewares/validations"

const CAREER_FAIRY_GROUP_ID = "i8NjOiRu85ohJWDuFPwo"
const MIN_CREATORS_COUNT = 8

export const getFollowedCreators = functions.region(config.region).https.onCall(
   middlewares(userAuthExists(), async (_, context) => {
      try {
         const userEmail = context.auth.token.email

         const followedCompanies = await userRepo.getCompaniesUserFollows(
            userEmail,
            8
         )

         const creatorsPromises = followedCompanies.map((company) =>
            groupRepo.getCreatorsWithPublicContent(company.group)
         )

         let creators = (await Promise.all(creatorsPromises)).flat()

         creators = uniqBy(creators, "id")

         if (creators.length < MIN_CREATORS_COUNT) {
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

               const newCareerFairyCreators =
                  careerFairyCreatorsWithLinkedIn.filter(
                     (cfCreator) =>
                        !creators.some((creator) => creator.id === cfCreator.id)
                  )

               const creatorsNeeded = MIN_CREATORS_COUNT - creators.length
               creators = creators.concat(
                  newCareerFairyCreators.slice(0, creatorsNeeded)
               )
            }
         }

         return creators
      } catch (error) {
         functions.logger.error("Error in getFollowedCreators:", error)
         throw new functions.https.HttpsError(
            "internal",
            "Error fetching followed creators"
         )
      }
   })
)
