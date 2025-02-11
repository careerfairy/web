import { FieldOfStudyCategory } from "@careerfairy/shared-lib/fieldOfStudy"
import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFeaturedCompanies from "components/custom-hook/group/useFeaturedCompanies"
import { useFieldOfStudyById } from "components/custom-hook/useCollection"
import useIsMobile from "components/custom-hook/useIsMobile"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "react-feather"

const styles = sxStyles({
   root: {
      mx: 2,
   },
})

export const FeaturedCompanies = () => {
   const { userData } = useAuth()

   // Possibly return null if user also does not have a field of study
   // Checking field of study, as the copy of the header is based on the field of study
   if (!userData || !userData.fieldOfStudy?.id) return null

   return (
      <FeaturedCompaniesComponent
         fieldOfStudyId={userData.fieldOfStudy.id}
         suspense={false}
      />
   )
}

type Props = {
   fieldOfStudyId: string
   suspense?: boolean
}

const FeaturedCompaniesComponent = ({
   fieldOfStudyId,
   suspense = true,
}: Props) => {
   const { data: featuredCompanies } = useFeaturedCompanies(suspense)
   const { data: fieldOfStudy } = useFieldOfStudyById(fieldOfStudyId, suspense)

   if (!featuredCompanies) return null

   return (
      <Box sx={styles.root}>
         <FeaturedCompaniesHeader
            category={fieldOfStudy?.category}
            onPreviousClick={() => {}}
            onNextClick={() => {}}
         />
      </Box>
   )
}

type FeaturedCompaniesHeader = {
   category: FieldOfStudyCategory
   onPreviousClick: () => void
   onNextClick: () => void
}

const FeaturedCompaniesHeader = ({
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
