import WishListLayout from "../../layouts/WishListLayout"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import wishRepo from "../../data/firebase/WishRepository"
import Container from "@mui/material/Container"
import useInfiniteScrollSubscribe from "../../components/custom-hook/useInfiniteScrollSubscribe"
import { Grid, Typography } from "@mui/material"
import CreateWish from "../../components/views/wishlist/CreateWish"
import WishSection from "../../components/views/wishlist/WishSection"

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
                  <Typography variant={"h1"}>Wishes</Typography>
               </Grid>
               <Grid item xs={12}>
                  <CreateWish />
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
