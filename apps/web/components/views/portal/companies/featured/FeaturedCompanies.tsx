import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Divider, Stack, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFeaturedCompanies from "components/custom-hook/group/useFeaturedCompanies"
import { useFieldOfStudyById } from "components/custom-hook/useCollection"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ChevronRight } from "react-feather"
import { FeaturedCompaniesCarousel } from "./FeaturedCompaniesCarousel"
import { FeaturedCompaniesHeader } from "./FeaturedCompaniesHeader"

const styles = sxStyles({
   root: {
      mx: 2,
      borderRadius: 2,
      background: "linear-gradient(125deg, #5A86E2 0%, #5F9BD9 100%)",
      mb: "40px",
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
   const isMobile = useIsMobile()
   const { data: featuredCompanies } = useFeaturedCompanies(suspense)
   const { data: fieldOfStudy } = useFieldOfStudyById(fieldOfStudyId, suspense)

   if (!featuredCompanies) return null

   return (
      <Box sx={[styles.root, isMobile ? { borderRadius: 0 } : {}]}>
         <FeaturedCompaniesHeader
            category={fieldOfStudy?.category}
            onPreviousClick={() => {}}
            onNextClick={() => {}}
         />
         <FeaturedCompaniesCarousel companies={featuredCompanies} />
         {isMobile ? (
            <Box>
               <Divider />
               <Stack direction="row">
                  <Typography>Explore more companies</Typography>
                  <Box component={ChevronRight} />
               </Stack>
            </Box>
         ) : null}
      </Box>
   )
}
