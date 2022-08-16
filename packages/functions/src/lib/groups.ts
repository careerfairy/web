import { LivestreamJobAssociation } from "@careerfairy/shared-lib/dist/livestreams"
import { groupRepo } from "../api/repositories"

/**
 * Get the Linked Account secret tokens
 *
 * Returns a map integrationId => token
 * @param associations
 */
export const getATSTokensForJobAssociations = async (
   associations: LivestreamJobAssociation[]
) => {
   const map: Record<string, string> = {}

   for (const association of associations) {
      if (map[association.integrationId]) {
         // we already have the token for this integration, skip
         continue
      }

      const tokenDoc = await groupRepo.getATSIntegrationTokens(
         association.groupId,
         association.integrationId
      )

      map[association.integrationId] = tokenDoc.merge?.account_token
   }

   return map
}
