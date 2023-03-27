import { chunkArray } from "@careerfairy/shared-lib/utils"
import functions = require("firebase-functions")
import { userRepo } from "./api/repositories"
import { userEventRecommendationService } from "./api/services"
import config from "./config"
import { setCORSHeaders } from "./util"

export const newsletter = functions
   .runWith({
      timeoutSeconds: 60 * 9,
      memory: "512MB",
   })
   .region(config.region)
   .https.onRequest(async (req, res) => {
      setCORSHeaders(req, res)

      const subscribedUsers = await userRepo.getSubscribedUsers()
      console.log(
         "DEBUGPRINT[1]: newsletter.ts:8: subscribedUsers=",
         subscribedUsers.length
      )

      const chunkedUsers = chunkArray(subscribedUsers, 50)
      const mappedRecommendations: Record<string, string[]> = {}

      let idx = 1
      for (const chunk of chunkedUsers) {
         const promises = []

         for (const user of chunk) {
            if (user.userEmail) {
               promises.push(
                  userEventRecommendationService
                     .getRecommendations(user.userEmail, 3)
                     .then((data) => ({
                        email: user.userEmail,
                        recommendedIds: data,
                     }))
               )
            }
         }

         await Promise.allSettled(promises).then((results) => {
            console.log(
               `chunk results ${idx++} of ${chunkedUsers.length}`,
               results.filter((r) => r.status === "rejected").length,
               results.filter((r) => r.status === "fulfilled").length
            )

            for (const result of results) {
               if (result.status === "fulfilled") {
                  mappedRecommendations[result.value.email] =
                     result.value.recommendedIds
               } else {
                  console.log("Rejected promise", result.reason)
               }
            }
         })
      }

      console.log(
         "Mapped recommendations length",
         Object.keys(mappedRecommendations).length
      )
      console.log(
         "Mapped recommendations users with 0 recommendations",
         Object.values(mappedRecommendations).filter((r) => r.length === 0)
            .length
      )

      res.send("Hello from Firebase!")
   })
