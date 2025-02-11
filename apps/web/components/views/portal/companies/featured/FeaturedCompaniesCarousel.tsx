import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { Box, Typography } from "@mui/material"

type Props = {
   companies: GroupPresenter[]
}

export const FeaturedCompaniesCarousel = ({ companies }: Props) => {
   console.log("🚀 ~ FeaturedCompaniesCarousel ~ companies:", companies)
   return (
      <Box>
         <Typography>Featured Companies</Typography>
      </Box>
   )
}
