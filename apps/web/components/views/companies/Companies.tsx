import { FC, useMemo } from "react"
import { Group } from "@careerfairy/shared-lib/groups"
import { Grid } from "@mui/material"
import useInfiniteCompanies, {
   UseInfiniteCompanies,
} from "./useInfiniteCompanies"
import { sxStyles } from "../../../types/commonTypes"
import CompanyCard, { CompanyCardSkeleton } from "./CompanyCard"
import { PAGE_SIZE } from "../../../pages/companies"
import InfiniteScroll from "react-infinite-scroll-component"

const styles = sxStyles({
   flexItem: {
      display: "flex",
   },
})

type Props = {
   initialData?: Group[]
}

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
      <InfiniteScroll
         dataLength={companies.length}
         hasMore={hasMore}
         next={getMore}
         loader={<></>}
         style={{ overflow: "inherit" }}
      >
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
            {loading ? (
               <Grid sx={styles.flexItem} item xs={12} sm={6} lg={4} xl={3}>
                  <CompanyCardSkeleton />
               </Grid>
            ) : null}
         </Grid>
      </InfiniteScroll>
   )
}

export default Companies
