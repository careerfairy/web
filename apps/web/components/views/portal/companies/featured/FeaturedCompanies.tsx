import { sxStyles } from "@careerfairy/shared-ui"
import { Box } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFeaturedCompanies from "components/custom-hook/group/useFeaturedCompanies"
import { useFieldOfStudyById } from "components/custom-hook/useCollection"
import useIsMobile from "components/custom-hook/useIsMobile"
import { FeaturedCompaniesHeader } from "./FeaturedCompaniesHeader"

const styles = sxStyles({
   root: {
      mx: 2,
      borderRadius: 2,
      background: "linear-gradient(125deg, #5A86E2 0%, #5F9BD9 100%)",
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
      </Box>
   )
}
