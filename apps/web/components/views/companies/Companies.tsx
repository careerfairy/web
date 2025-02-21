import { Group } from "@careerfairy/shared-lib/groups"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Grid } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import { useFeaturedGroupsSWR } from "components/custom-hook/group/useFeaturedGroupsSWR"
import useUserCountryCode from "components/custom-hook/useUserCountryCode"
import { FC, useMemo } from "react"
import { CompanySearchResult } from "types/algolia"
import { sxStyles } from "../../../types/commonTypes"
import CompanyCard from "./CompanyCard"

const styles = sxStyles({
   flexItem: {
      display: "flex",
   },
   root: {
      pb: 3,
   },
})

type Props = {
   companies?: (Group | CompanySearchResult)[]
   hasFilters?: boolean
}

const Companies: FC<Props> = ({ companies, hasFilters }) => {
   const { userData } = useAuth()
   const { userCountryCode } = useUserCountryCode()
   const { data: featuredGroups } = useFeaturedGroupsSWR(
      userData?.countryIsoCode || userCountryCode,
      {
         disabled: hasFilters,
      }
   )

   const allCompanies = useMemo(() => {
      return (featuredGroups || []).concat((companies as Group[]) || [])
   }, [companies, featuredGroups])

   return (
      <Grid sx={styles.root} container spacing={2}>
         {allCompanies?.map((company) => (
            <Grid
               sx={styles.flexItem}
               key={company.id}
               item
               xs={12}
               sm={6}
               lg={4}
               xl={3}
            >
               <CompanyCard
                  company={company}
                  interactionSource={InteractionSources.Companies_Overview_Page}
               />
            </Grid>
         ))}
      </Grid>
   )
}

export default Companies
