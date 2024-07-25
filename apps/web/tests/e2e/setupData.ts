import FieldsOfStudySeed from "@careerfairy/seed-data/fieldsOfStudy"
import GroupSeed from "@careerfairy/seed-data/groups"
import LivestreamSeed, {
   createLivestreamGroupQuestions,
} from "@careerfairy/seed-data/livestreams"
import UniversitiesSeed from "@careerfairy/seed-data/universities"
import { Group } from "@careerfairy/shared-lib/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

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
   const type = options.livestreamType || "create"
   if (!group) {
      group = await GroupSeed.createGroup(
         Object.assign({}, options.overrideGroupDetails)
      )
   }

   const groupQuestions = createLivestreamGroupQuestions(group.id)

   const livestream = await LivestreamSeed[type](
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

   if (options.userQuestions?.length) {
      await LivestreamSeed.addUserQuestionsToLivestream(
         livestream.id,
         options.userQuestions
      )
   }

   if (options.feedbackQuestions?.length) {
      await LivestreamSeed.addFeedbackQuestionsToLivestream(
         livestream.id,
         options.feedbackQuestions
      )
   }

   await Promise.all([
      FieldsOfStudySeed.createCollection("fieldsOfStudy"),
      FieldsOfStudySeed.createCollection("levelsOfStudy"),
   ])

   return { group, livestream }
}

/**
 * Creates the necessary data required to successfully signup a user
 */
export async function setupUserSignUpData() {
   await Promise.all([
      UniversitiesSeed.createBasicUniversities(),
      FieldsOfStudySeed.createCollection("fieldsOfStudy"),
      FieldsOfStudySeed.createCollection("levelsOfStudy"),
   ])
}
