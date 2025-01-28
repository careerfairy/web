import { transformCreatorNameIntoSlug } from "@careerfairy/shared-lib/groups/creators"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils/utils"
import { LinkProps } from "next/link"
import { NextRouter } from "next/router"

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

/**
 * Builds the query parameters for level navigation with proper type safety
 */
export const buildLevelQueryParams = (params: {
   levelSlug: string
   currentQuery: NextRouter["query"]
}): LinkProps => {
   const { levelSlug, currentQuery } = params

   return {
      href: {
         pathname: "/levels",
         query: {
            ...currentQuery,
            levelSlug: levelSlug,
         },
      },
      shallow: true,
      scroll: false,
   }
}
