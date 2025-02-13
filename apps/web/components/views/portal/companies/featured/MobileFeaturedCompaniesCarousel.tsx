import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { chunkArray } from "@careerfairy/shared-lib/utils"
import { sxStyles } from "@careerfairy/shared-ui"
import { Stack } from "@mui/material"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { FeaturedCompanyCard } from "./FeaturedCompaniesCarousel"

const styles = sxStyles({
   carouselRoot: {
      overflow: "hidden",
      px: 2,
   },
})

type Props = {
   companies: GroupPresenter[]
}

export const MobileFeaturedCompaniesCarousel = ({ companies }: Props) => {
   const chunkedCompanies = chunkArray(companies, 2)

   return (
      <ContentCarousel slideWidth={317} viewportSx={styles.carouselRoot}>
         {chunkedCompanies.map((chunk, idx) => (
            <Stack key={`chunk-${idx}`} p={0} m={0}>
               {chunk.map((company) => (
                  <FeaturedCompanyCard key={company.id} company={company} />
               ))}
            </Stack>
         ))}
      </ContentCarousel>
   )
}
