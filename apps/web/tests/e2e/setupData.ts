import { Group } from "@careerfairy/shared-lib/dist/groups"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import GroupSeed from "@careerfairy/seed-data/dist/groups"
import LivestreamSeed, {
   createLivestreamGroupQuestions,
} from "@careerfairy/seed-data/dist/livestreams"

/**
 * Creates a livestream document with a group and group questions
 */
export async function setupLivestreamData(
   overrideGroupDetails: Partial<Group> = {},
   overrideLivestreamDetails: Partial<LivestreamEvent> = {},
   livestreamType: "create" | "createPast" | "createLive" = "create"
) {
   const group = await GroupSeed.createGroup(
      Object.assign({}, overrideGroupDetails)
   )

   const groupQuestions = createLivestreamGroupQuestions(group.id)

   const livestream = await LivestreamSeed[livestreamType](
      Object.assign(
         {
            groupIds: [group.id],
            groupQuestionsMap: {
               [group.id]: groupQuestions,
            },
         },
         overrideLivestreamDetails
      )
   )

   return { group, livestream }
}
