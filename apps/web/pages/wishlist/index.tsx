import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import wishRepo from "../../data/firebase/WishRepository"
import Container from "@mui/material/Container"
import { Grid } from "@mui/material"
import CreateAndFilter from "../../components/views/wishlist/CreateAndFilter"
import WishSection from "../../components/views/wishlist/WishSection"
import Header from "../../components/views/wishlist/Header"
import GeneralLayout from "../../layouts/GeneralLayout"
import { useRouter } from "next/router"
import {
   DateSort,
   UpvoteSort,
} from "../../components/views/wishlist/FilterMenu"
import useInfiniteScrollGet from "../../components/custom-hook/useInfiniteScrollGet"
import { useMemo } from "react"

const pageSize = 2
const Wishlist = () => {
   const { query } = useRouter()

   const date = query.date as DateSort
   const upvote = query.upvote as UpvoteSort
   const interests = query.interests as string
   const wishQuery = useMemo(() => {
      return wishRepo.getWishesQuery({
         ...(date && { orderByDate: date }),
         ...(upvote && { orderByUpvotes: upvote }),
         ...(interests && {
            targetInterestIds: interests.split(","),
         }),
         limit: pageSize,
      })
   }, [date, upvote, interests])
   const {
      loading,
      loadingError,
      loadingMore,
      loadingMoreError,
      data: wishes,
   } = useInfiniteScrollGet<Wish>(wishQuery, pageSize)

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
                  <WishSection
                     loading={loading}
                     loadingError={loadingError}
                     loadingMore={loadingMore}
                     loadingMoreError={loadingMoreError}
                     wishes={wishes}
                  />
               </Grid>
            </Grid>
         </Container>
      </GeneralLayout>
   )
}

export default Wishlist
