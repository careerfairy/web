import { transformCreatorNameIntoSlug } from "@careerfairy/shared-lib/groups/creators"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils/utils"

/**
 * Builds the mentor page URL with proper encoding
 */
export const buildMentorPageLink = (params: {
   universityName: string
   firstName: string
   lastName: string
   creatorId: string
}) => {
   const { universityName, firstName, lastName, creatorId } = params

   return `/company/${encodeURIComponent(
      companyNameSlugify(universityName)
   )}/mentor/${encodeURIComponent(
      transformCreatorNameIntoSlug(firstName, lastName)
   )}/${creatorId}`
}
