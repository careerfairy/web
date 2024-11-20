import { Group } from "@careerfairy/shared-lib/groups"
import { Grid } from "@mui/material"
import { FC } from "react"
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
   companies?: Partial<Group>[]
}

const Companies: FC<Props> = ({ companies }) => {
   return (
      <Grid sx={styles.root} container spacing={2}>
         {companies?.map((company: Group) => (
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
