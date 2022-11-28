import UserEventRecommendationService from "../lib/recommendation/services/UserEventRecommendationService"
import { admin } from "./firestoreAdmin"
import { userRepo } from "./repositories"

export const userEventRecommendationService =
   new UserEventRecommendationService(admin, userRepo)
