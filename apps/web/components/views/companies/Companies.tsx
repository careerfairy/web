import { FC, useMemo } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import { Grid } from "@mui/material"
import useInfiniteCompanies, {
   UseInfiniteCompanies,
} from "./useInfiniteCompanies"
import { sxStyles } from "../../../types/commonTypes"
import CompanyCard, { CompanyCardSkeleton } from "./CompanyCard"
import CustomInfiniteScroll from "../common/CustomInfiniteScroll"

const styles = sxStyles({
   flexItem: {
      display: "flex",
   },
   root: {
      pb: 3,
   },
})

type Props = {
   initialData?: Group[]
}

const PAGE_SIZE = 12

const Companies: FC<Props> = ({ initialData }) => {
   const options = useMemo<UseInfiniteCompanies>(
      () => ({
         filters: {},
         initialData,
         limit: PAGE_SIZE,
      }),
      [initialData]
   )

   const {
      documents: companies,
      getMore,
      hasMore,
      loading,
   } = useInfiniteCompanies(options)

   return (
      <CustomInfiniteScroll hasMore={hasMore} next={getMore} loading={loading}>
         <Grid sx={styles.root} container spacing={2}>
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
            {loading ? (
               <Grid sx={styles.flexItem} item xs={12} sm={6} lg={4} xl={3}>
                  <CompanyCardSkeleton />
               </Grid>
            ) : null}
         </Grid>
      </CustomInfiniteScroll>
   )
}

export default Companies
