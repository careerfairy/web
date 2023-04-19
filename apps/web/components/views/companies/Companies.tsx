import { FC } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import { Grid } from "@mui/material"
import useInfiniteCompanies from "./useInfiniteCompanies"
import { useRouter } from "next/router"
import { sxStyles } from "../../../types/commonTypes"
import CompanyCard from "./CompanyCard"

const styles = sxStyles({
   flexItem: {
      display: "flex",
   },
})

type Props = {
   initialData?: Group[]
}

const Companies: FC<Props> = ({ initialData }) => {
   const {
      query: { searchQuery },
   } = useRouter()

   const { data: companies } = useInfiniteCompanies(
      10,
      {
         searchText: searchQuery as string,
      },
      initialData
   )

   return (
      <Grid container spacing={2}>
         {companies?.map((company) => (
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
