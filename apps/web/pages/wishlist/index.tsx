import WishListLayout from "../../layouts/WishListLayout"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import wishRepo from "../../data/firebase/WishRepository"
import Container from "@mui/material/Container"
import useInfiniteScrollSubscribe from "../../components/custom-hook/useInfiniteScrollSubscribe"
import { Grid, Typography } from "@mui/material"
import CreateAndFilter from "../../components/views/wishlist/CreateAndFilter"
import WishSection from "../../components/views/wishlist/WishSection"
import Header from "../../components/views/wishlist/Header"

const pageSize = 10
const Wishlist = () => {
   const {
      loading,
      loadingError,
      loadingMore,
      loadingMoreError,
      mappedItems: wishes,
   } = useInfiniteScrollSubscribe<Wish>(wishRepo.getWishesQuery(), pageSize)

   return (
      <WishListLayout>
         <Container maxWidth={"md"}>
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
      </WishListLayout>
   )
}

export default Wishlist
