import React, { FC, Fragment, useEffect, useState } from "react"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import Paper from "@mui/material/Paper"
import { StylesProps } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import { AvatarGroup, Button, Typography } from "@mui/material"
import Avatar from "@mui/material/Avatar"
import userRepo from "../../../data/firebase/UserRepository"
import { getMaxLineStyles } from "../../helperFunctions/HelperFunctions"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import Stack from "@mui/material/Stack"
import CommentIcon from "@mui/icons-material/ChatBubbleOutline"
import { wishListBorderRadius } from "../../../constants/pages"
import UserAvatar from "../common/UserAvatar"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import UpvoteIcon from "@mui/icons-material/ArrowUpward"
import DownvoteIcon from "@mui/icons-material/ArrowDownward"

interface WishCardProps {
   wish: Wish
   interests: Interest[]
}

const styles: StylesProps = {
   root: {
      p: 2,
      minHeight: "100px",
      display: "flex",
      borderRadius: wishListBorderRadius,
      boxShadow: "0px 8px 25px rgba(33, 32, 32, 0.1)",
   },
   name: {
      fontWeight: 600,
   },
   title: {
      ...getMaxLineStyles(2),
   },
   totalLikes: {
      border: "none !important",
      background: "none",
      color: "black",
      fontWeight: 600,
      borderColor: "none",
      ml: "-2px !important",
   },
}

const bull = (
   <Box
      component="span"
      sx={{
         display: "inline-block",
         mx: "2px",
         transform: "scale(0.8)",
         color: "text.secondary",
      }}
   >
      •
   </Box>
)
const WishCard = ({ wish, interests }: WishCardProps) => {
   // get wish author from authorUid
   const [authorData, setAuthorData] = useState<UserData>({} as UserData)
   const [wishInterests, setWishInterests] = useState<Interest[]>([])

   useEffect(() => {
      setWishInterests(
         interests.filter((interest) => wish.interestIds.includes(interest.id))
      )
   }, [])

   useEffect(() => {
      ;(async () => {
         const newAuthorData = await userRepo.getUserDataByUid(wish.authorUid)
         setAuthorData(newAuthorData)
      })()
   }, [])

   return (
      <Paper
         component={Stack}
         spacing={2}
         justifyContent={"center"}
         alignItems={{ xs: "center", sm: "start" }}
         direction={{ xs: "column", sm: "row" }}
         sx={styles.root}
      >
         <UserAvatar size={"large"} differentUserData={authorData} />
         <Stack spacing={2}>
            <Box>
               <Typography sx={styles.name} variant={"h6"}>{`${
                  authorData?.firstName || ""
               } ${authorData?.lastName || ""}`}</Typography>
               <Typography
                  sx={styles.title}
                  color={"text.secondary"}
                  variant={"subtitle1"}
                  gutterBottom
               >
                  {wish.description}
               </Typography>
               <Typography
                  color={"text.secondary"}
                  variant="subtitle2"
                  component="div"
               >
                  {wishInterests.map((int, index) => (
                     <Fragment key={int.id}>
                        {!!index && bull}
                        {int.name}
                     </Fragment>
                  ))}
               </Typography>
            </Box>
            <Stack
               spacing={2}
               flexWrap={"wrap"}
               alignContent={"center"}
               direction={"row"}
            >
               <Button
                  startIcon={<UpvoteIcon color={"secondary"} />}
                  variant={"text"}
                  color={"grey"}
               >
                  upvote
               </Button>
               <AvatarGroup
                  spacing={"small"}
                  componentsProps={{
                     additionalAvatar: { sx: styles.totalLikes },
                  }}
                  max={4}
                  // total={wish.numberOfUpvotes}
                  total={20}
               >
                  <Avatar
                     alt="Remy Sharp"
                     src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                  />
                  <Avatar
                     alt="Travis Howard"
                     src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                  />
                  <Avatar
                     alt="Agnes Walker"
                     src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                  />
                  <Avatar
                     alt="Trevor Henderson"
                     src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                  />
               </AvatarGroup>
               <Button
                  startIcon={<DownvoteIcon color={"secondary"} />}
                  variant={"text"}
                  color={"grey"}
               >
                  downvote
               </Button>
               <Button
                  size={"large"}
                  color={"grey"}
                  startIcon={<CommentIcon color={"secondary"} />}
               >
                  {wish.numberOfComments} comments
               </Button>
            </Stack>
         </Stack>
      </Paper>
   )
}

export default WishCard
