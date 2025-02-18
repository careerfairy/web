import { Group } from "@careerfairy/shared-lib/groups"
import { Grid } from "@mui/material"
import { useFeaturedGroupsSWR } from "components/custom-hook/group/useFeaturedGroupsSWR"
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
}

const Companies: FC<Props> = ({ companies }) => {
   const { data: featuredGroups } = useFeaturedGroupsSWR()

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
               <CompanyCard company={company} />
            </Grid>
         ))}
      </Grid>
   )
}

export default Companies
