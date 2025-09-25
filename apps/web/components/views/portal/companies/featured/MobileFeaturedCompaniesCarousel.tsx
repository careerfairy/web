import { Group } from "@careerfairy/shared-lib/groups"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import { useUserFollowingCompanies } from "components/custom-hook/user/useUserFollowingCompanies"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { FeaturedCompanyCard } from "./FeaturedCompaniesCarousel"

const styles = sxStyles({
   carouselRoot: {
      overflow: "hidden",
      px: 2,
   },
})

type Props = {
   companies: Group[]
}

export const MobileFeaturedCompaniesCarousel = ({ companies }: Props) => {
   const chunkedCompanies = chunkArray(companies, 2)
   const followingCompanies = useUserFollowingCompanies()

   return (
      <ContentCarousel slideWidth={317} viewportSx={styles.carouselRoot}>
         {chunkedCompanies.map((chunk, idx) => (
            <Stack key={`chunk-${idx}`} spacing={1}>
               {chunk.map((company) => (
                  <FeaturedCompanyCard
                     key={company.id}
                     company={company}
                     following={Boolean(
                        followingCompanies.find(
                           (data) => data.groupId === company.id
                        )
                     )}
                  />
               ))}
            </Stack>
         ))}
      </ContentCarousel>
   )
}
