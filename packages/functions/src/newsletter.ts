import functions = require("firebase-functions")
import { groupRepo, userRepo } from "./api/repositories"
import config from "./config"
import { NewsletterService } from "./lib/NewsletterService"
import { NewsletterDataFetcher } from "./lib/recommendation/services/DataFetcherRecommendations"
import { setCORSHeaders } from "./util"

export const newsletter = functions
   .runWith({
      timeoutSeconds: 60 * 9,
      memory: "512MB",
   })
   .region(config.region)
   .https.onRequest(async (req, res) => {
      setCORSHeaders(req, res)

      const dataLoader = await NewsletterDataFetcher.create()
      const newsletterService = new NewsletterService(
         userRepo,
         groupRepo,
         dataLoader
      )

      await newsletterService.fetchRequiredData()
      await newsletterService.generateRecommendations()
      await newsletterService.populateUsers()
      newsletterService.send()

      res.send("Hello from Firebase!")
   })
