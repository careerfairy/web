import { sxStyles } from "@careerfairy/shared-ui"
import { Box, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import useFeaturedCompanies from "components/custom-hook/group/useFeaturedCompanies"

const styles = sxStyles({
   root: {
      mx: 2,
   },
})

export const FeaturedCompanies = () => {
   const { userData } = useAuth()

   // Possibly return null if user also does not have a field of study
   if (!userData) return null

   return <FeaturedCompaniesComponent suspense={false} />
}

type Props = {
   suspense?: boolean
}

const FeaturedCompaniesComponent = ({ suspense = true }: Props) => {
   const { data: featuredCompanies } = useFeaturedCompanies(suspense)

   if (!featuredCompanies) return null
   return (
      <Box sx={styles.root}>
         <Typography variant="h6">
            Featured Companies: {featuredCompanies?.length}
         </Typography>
      </Box>
   )
}
