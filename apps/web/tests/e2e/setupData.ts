import GroupSeed from "@careerfairy/seed-data/dist/groups"
import LivestreamSeed, {
   createLivestreamGroupQuestions,
} from "@careerfairy/seed-data/dist/livestreams"
import { Group } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import UniversitiesSeed from "@careerfairy/seed-data/dist/universities"
import InterestSeed from "@careerfairy/seed-data/dist/interests"
import FieldsOfStudySeed from "@careerfairy/seed-data/dist/fieldsOfStudy"

/**
 * Creates a livestream document with a group and group questions
 */
export async function setupLivestreamData(
   group: Group = null,
   options: {
      livestreamType?: "create" | "createPast" | "createLive"
      userQuestions?: string[]
      feedbackQuestions?: string[]
      overrideGroupDetails?: Partial<Group>
      overrideLivestreamDetails?: Partial<LivestreamEvent>
   } = {
      livestreamType: "create",
      userQuestions: [],
      feedbackQuestions: [],
      overrideGroupDetails: {},
      overrideLivestreamDetails: {},
   }
) {
   if (!group) {
      group = await GroupSeed.createGroup(
         Object.assign({}, options.overrideGroupDetails)
      )
   }

   const groupQuestions = createLivestreamGroupQuestions(group.id)

   const livestream = await LivestreamSeed[options.livestreamType](
      Object.assign(
         {
            groupIds: [group.id],
            groupQuestionsMap: {
               [group.id]: groupQuestions,
            },
         },
         options.overrideLivestreamDetails
      )
   )

   if (options.userQuestions.length) {
      await LivestreamSeed.addUserQuestionsToLivestream(
         livestream.id,
         options.userQuestions
      )
   }

   if (options.feedbackQuestions.length) {
      await LivestreamSeed.addFeedbackQuestionsToLivestream(
         livestream.id,
         options.feedbackQuestions
      )
   }

   return { group, livestream }
}

/**
 * Creates the necessary data required to successfully signup a user
 */
export async function setupUserSignUpData() {
   await Promise.all([
      InterestSeed.createBasicInterests(),
      UniversitiesSeed.createBasicUniversities(),
      FieldsOfStudySeed.createCollection("fieldsOfStudy"),
      FieldsOfStudySeed.createCollection("levelsOfStudy"),
   ])
}
