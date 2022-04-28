import WishListLayout from "../../layouts/WishListLayout"
import { useState } from "react"
import { usePagination } from "use-pagination-firestore"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import wishRepo from "../../data/firebase/WishRepository"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import CreateWish from "../../components/views/wishlist/CreateWish"

const Wishlist = () => {
   // creat a wishlist
   const [pageSize, setPageSize] = useState(5)
   const { items, isLoading, isStart, isEnd, getPrev, getNext } =
      usePagination<Wish>(wishRepo.getWishesQuery(), {
         limit: pageSize,
      })
   console.log("-> items", items)

   return (
      <WishListLayout>
         <Container>
            <Grid maxWidth={"md"} container spacing={2}>
               <Grid item xs={12} md={10}>
                  <CreateWish />
               </Grid>

               {/*   create empty grid layout*/}
               <Grid item xs={12}>
                  {items.map((wish: Wish, idx) => (
                     <Grid item xs={12} sm={6} md={4} key={wish.id}>
                        wish - {idx}
                     </Grid>
                  ))}
               </Grid>

               <Grid item xs={12}>
                  {isStart && <span>Start</span>}
                  {!isStart && <button onClick={getPrev}>Prev</button>}
                  {isEnd && <span>End</span>}
                  {!isEnd && <button onClick={getNext}>Next</button>}
               </Grid>
            </Grid>
         </Container>
      </WishListLayout>
   )
}

export default Wishlist
