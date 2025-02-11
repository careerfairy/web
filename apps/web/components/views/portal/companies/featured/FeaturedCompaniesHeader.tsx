import { FieldOfStudyCategory } from "@careerfairy/shared-lib/fieldOfStudy"
import { Box, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "react-feather"

type FeaturedCompaniesHeader = {
   category: FieldOfStudyCategory
   onPreviousClick: () => void
   onNextClick: () => void
}

export const FeaturedCompaniesHeader = ({
   category,
   onPreviousClick,
   onNextClick,
}: FeaturedCompaniesHeader) => {
   const isMobile = useIsMobile()

   const MobileHeader = (
      <Typography variant="h6">Featured Companies: {category}</Typography>
   )

   return (
      <ConditionalWrapper condition={!isMobile} fallback={MobileHeader}>
         <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
         >
            <Typography variant="h6">
               Featured Companies v2: {category}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1}>
               <Link href={`/portal/companies/featured/${category}`}>
                  <Typography>Sell all companies</Typography>
               </Link>
               <Box component={ChevronLeft} onClick={onPreviousClick} />
               <Box component={ChevronRight} onClick={onNextClick} />
            </Stack>
         </Stack>
      </ConditionalWrapper>
   )
}
