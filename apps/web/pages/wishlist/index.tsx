import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import Container from "@mui/material/Container"
import { Grid } from "@mui/material"
import CreateAndFilter from "../../components/views/wishlist/CreateAndFilter"
import Header from "../../components/views/wishlist/Header"
import GeneralLayout from "../../layouts/GeneralLayout"
import { useRouter } from "next/router"
import { SortType } from "../../components/views/wishlist/FilterMenu"
import { useEffect, useState } from "react"
import { SearchResponse } from "../../types/algolia"
import algoliaRepo from "../../data/algolia/AlgoliaRepository"

const pageSize = 2
const Wishlist = () => {
   const { query } = useRouter()
   const [searchResponse, setSearchResponse] =
      useState<SearchResponse<Wish> | null>(null)
   const sortType = query.sortType as SortType
   const interests = query.interests as string
   const searchQuery = query.search as string

   useEffect(() => {
      ;(async function search() {
         const searchResponse = await algoliaRepo.searchWishes(searchQuery, {
            sortType: sortType,
            ...(interests && {
               targetInterestIds: interests.split(","),
            }),
         })
         setSearchResponse(searchResponse)
         console.log("-> searchResponse", searchResponse)
      })()
   }, [searchQuery, sortType, interests])
   // const wishQuery = useMemo(() => {
   //    return wishRepo.getWishesQuery({
   //       sort: getFirebaseSortType(sortType),
   //       ...(interests && {
   //          targetInterestIds: interests.split(","),
   //       }),
   //       limit: pageSize,
   //    })
   // }, [sortType, interests])
   //
   // const {
   //    loading,
   //    loadingError,
   //    loadingMore,
   //    loadingMoreError,
   //    data: wishes,
   // } = useInfiniteScrollGet<Wish>(wishQuery, pageSize)

   return (
      <GeneralLayout backgroundColor={"white"} persistent>
         <Container sx={{ py: 2 }} maxWidth={"md"}>
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <Header
                     title={"Wishlist"}
                     subtitle={
                        "Add a company or topic that you’d like to see hosted on CareerFairy"
                     }
                  />
               </Grid>
               <Grid item xs={12}>
                  <CreateAndFilter />
               </Grid>
               <Grid item xs={12}>
                  {/*<WishSection*/}
                  {/*   loading={loading}*/}
                  {/*   loadingError={loadingError}*/}
                  {/*   loadingMore={loadingMore}*/}
                  {/*   loadingMoreError={loadingMoreError}*/}
                  {/*   wishes={wishes}*/}
                  {/*/>*/}
               </Grid>
            </Grid>
         </Container>
      </GeneralLayout>
   )
}

export default Wishlist
