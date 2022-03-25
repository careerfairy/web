import React, { useEffect, useState } from "react"

import { withFirebase } from "../context/firebase/FirebaseServiceContext"

import Head from "next/head"
import { Button, Container, TextField, Typography } from "@mui/material"
import GeneralLayout from "../layouts/GeneralLayout"

function WishFactoryPlay(props) {
   const [newWish, setNewWish] = useState("")
   const [newWishLoading, setNewWishLoading] = useState(false)

   const [wishes, setWishes] = useState([])
   const [latestFulfilledWishes, setLatestFulfilledWishes] = useState([])

   useEffect(() => {
      updateWishList()
      updateFulfilledWishList()
   }, [])

   const fulfilledWishList = latestFulfilledWishes.map((wish, index) => {
      return (
         <div className="wishContainer fulfilled" key={index}>
            <Typography
               variant="h5"
               style={{
                  margin: "10px 0",
                  fontWeight: "400",
                  fontSize: "1.8em",
               }}
            >
               {wish.wish}
            </Typography>
            <div className="fulfilledWishSubcontent">
               <Button
                  color="primary"
                  onClick={() => goToProfile(wish.companyId)}
               >
                  CareerFairy granted this wish!
               </Button>
            </div>
            <style jsx>{`
               .wishContainer {
                  padding: 10px 20px 10px 20px;
                  background-color: rgb(246, 246, 246);
                  border-radius: 5px;
                  margin: 10px 0;
                  text-align: center;
                  width: 100%;
                  margin: 10px auto;
               }

               .wishContainer.fulfilled {
                  background-color: rgba(0, 210, 170, 0.3);
                  color: white;
               }
            `}</style>
         </div>
      )
   })

   const wishList = wishes.map((wish, index) => {
      return (
         <div className="wishContainer" key={index}>
            <Typography
               variant="h5"
               style={{
                  margin: "10px 0",
                  fontWeight: "400",
                  fontSize: "1.8em",
               }}
            >
               {wish.wish}
            </Typography>
            <div className="ranking">
               <Button color="primary" onClick={() => addVoteToWish(wish)}>
                  Upvote
               </Button>
               <p>Upvoted {wish.vote} times</p>
            </div>
            <style jsx>{`
               .wishContainer {
                  padding: 10px 20px 10px 20px;
                  background-color: rgb(246, 246, 246);
                  border-radius: 5px;
                  margin: 10px 0;
                  text-align: center;
                  width: 100%;
                  margin: 10px auto;
               }

               .wishContainer #wish {
                  margin: 10px 0;
                  font-weight: 400;
                  font-size: 1.8em;
               }

               .wishContainer.fulfilled {
                  background-color: rgba(0, 210, 170, 0.3);
                  color: white;
               }

               .ranking {
                  margin-top: 20px;
               }

               .ranking button,
               .ranking p {
                  display: inline-block;
               }

               .ranking p {
                  margin-left: 20px;
               }
            `}</style>
         </div>
      )
   })

   function updateWishList() {
      props.firebase.getWishList().then((querySnapshot) => {
         var array = []
         querySnapshot.forEach((doc) => {
            let wish = doc.data()
            wish.id = doc.id
            array.push(wish)
         })
         setWishes(array)
      })
   }

   function updateFulfilledWishList() {
      props.firebase.getLatestFulfilledWishes().then((querySnapshot) => {
         var wishes = []
         querySnapshot.forEach((doc) => {
            let wish = doc.data()
            wish.id = doc.id
            wishes.push(wish)
         })
         setLatestFulfilledWishes(wishes)
      })
   }

   function addVoteToWish(wish) {
      props.firebase.addVoteToWish(wish, props.user).then(() => {
         updateWishList()
      })
   }

   function addNewWish() {
      setNewWishLoading(true)
      props.firebase.addNewWish(props.user, newWish).then(() => {
         updateWishList()
         setNewWishLoading(false)
         setNewWish("")
      })
   }

   function goToProfile(companyId) {
      props.history.push("/catalog/" + companyId)
   }

   return (
      <React.Fragment>
         <Head>
            <title key="title">CareerFairy | Wishlist</title>
         </Head>
         <GeneralLayout fullScreen>
            <Container
               style={{
                  minHeight: "60vh",
               }}
            >
               <Typography
                  align="center"
                  variant="h1"
                  style={{ margin: "30px 0", fontSize: "2.8em" }}
               >
                  <span>wish a company</span>
               </Typography>
               <div className="wishListHeader">
                  <TextField
                     id="add-new-wish"
                     value={newWish}
                     onChange={(event) => setNewWish(event.target.value)}
                     fullWidth={true}
                     placeholder="Tell us your wish today!"
                  />
                  <Button color="primary" onClick={() => addNewWish()}>
                     Add Your Wish
                  </Button>
               </div>
               <div className="wishListContent">
                  {fulfilledWishList}
                  {wishList}
               </div>
            </Container>
         </GeneralLayout>
      </React.Fragment>
   )
}

export default withFirebase(WishFactoryPlay)
