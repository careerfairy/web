import React, { FC, useEffect, useMemo, useState } from "react"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import Paper from "@mui/material/Paper"
import { StylesProps } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import { AvatarGroup, Button, Typography } from "@mui/material"
import Avatar from "@mui/material/Avatar"
import { stringAvatar } from "../../../util/CommonUtil"
import userRepo from "../../../data/firebase/UserRepository"
import { getMaxLineStyles } from "../../helperFunctions/HelperFunctions"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import Stack from "@mui/material/Stack"
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt"
import CommentIcon from "@mui/icons-material/ChatBubbleOutline"
import { wishListBorderRadius } from "../../../constants/pages"
import { alpha } from "@mui/material/styles"

interface WishCardProps {
   wish: Wish
   interests: Interest[]
}

const styles: StylesProps = {
   root: {
      p: 1,
      // borderRadius: 0,
      minHeight: "100px",
      display: "flex",
      borderRadius: wishListBorderRadius,
   },
   inner: {
      flex: 1,
      borderLeft: (theme) => `3px solid ${theme.palette.grey["300"]}`,
      borderLeftWidth: 4,
      borderLeftStyle: "solid",

      display: "flex",
      flexWrap: "wrap",
      flexDirection: { xs: "column", sm: "row" },
      px: { xs: 1, sm: 0 },
      "& > *": {
         p: 1,
         px: { xs: 0, sm: 1 },
      },
   },
   wishDetails: {
      flex: 1,
      display: "flex",
      borderRight: (theme) => ({
         sm: `2px solid ${theme.palette.grey["300"]}`,
         xs: "none",
      }),
      borderBottom: (theme) => ({
         xs: `2px solid ${theme.palette.grey["300"]}`,
         sm: "none",
      }),
   },
   title: {
      ...getMaxLineStyles(2),
   },
   category: {
      textTransform: "capitalize",
   },
   detailsHeader: {
      ml: { xs: 1, sm: 1 },
   },
   wishEngagement: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      pb: "0px !important",
      "& > *": {
         flex: 0.5,
         p: 0.5,
      },
   },
   totalLikes: {
      border: "none !important",
      background: "none",
      color: "black",
      fontWeight: 600,
      borderColor: "none",
      ml: "-2px !important",
   },
   engagementBottom: {
      borderTop: (theme) => `2px solid ${theme.palette.grey["300"]}`,
   },
   engagementTop: {},
   wishDetail: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
   },
   wishDetailContent: {
      height: 45,
      display: "flex",
      alignItems: "center",
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

const WishDetail: FC<{ title: string }> = ({ children, title }) => {
   return (
      <Box sx={styles.wishDetail}>
         <Typography color={"text.secondary"} variant={"h6"}>
            {title}
         </Typography>
         <Box sx={styles.wishDetailContent}>{children}</Box>
      </Box>
   )
}
const WishCard = ({ wish, interests }: WishCardProps) => {
   // get wish author from authorUid
   const [authorData, setAuthorData] = useState(undefined)
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

   const authorProps = useMemo(
      () => stringAvatar(`${authorData?.firstName} ${authorData?.lastName}`),
      []
   )

   return (
      <Paper variant="outlined" sx={styles.root}>
         <Box
            sx={{
               ...styles.inner,
               borderLeftColor: alpha(authorProps.sx.bgcolor, 0.6),
            }}
         >
            <Box sx={styles.wishDetails}>
               <Avatar
                  // src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
                  src={authorData?.avatarUrl}
                  {...authorProps}
                  // variant={"rounded"}
               />
               <Box sx={styles.detailsHeader}>
                  <Typography gutterBottom sx={styles.category} variant="h6">
                     {wish.category}
                  </Typography>
                  <Typography
                     sx={styles.title}
                     color={"text.secondary"}
                     variant={"subtitle1"}
                     gutterBottom
                  >
                     {wish.title}
                  </Typography>
                  {!!wish.companyNames.length && (
                     <Typography variant="subtitle2" component="div">
                        {wish.companyNames.map((name, index) => (
                           <>
                              {!!index && bull}
                              {name}
                           </>
                        ))}
                     </Typography>
                  )}
                  {!!wishInterests.length && (
                     <Box>
                        <Typography
                           color={"text.secondary"}
                           variant="subtitle2"
                           component="div"
                        >
                           {wishInterests.map((int, index) => (
                              <>
                                 {!!index && bull}
                                 {int.name}
                              </>
                           ))}
                        </Typography>
                        {/*{wishInterests.map((int) => (*/}
                        {/*   <Chip*/}
                        {/*      sx={{ maxWidth: "80%" }}*/}
                        {/*      stacked*/}
                        {/*      variant={"outlined"}*/}
                        {/*      size={"small"}*/}
                        {/*      key={int.id}*/}
                        {/*      label={int.name}*/}
                        {/*   />*/}
                        {/*))}*/}
                     </Box>
                  )}
               </Box>
            </Box>
            <Box sx={styles.wishEngagement}>
               <Stack spacing={2} direction={"row"} sx={styles.engagementTop}>
                  <WishDetail title={"Comments"}>
                     <Typography variant={"h6"}>
                        {wish.numberOfComments}
                     </Typography>
                  </WishDetail>
                  <WishDetail title={"Likes"}>
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
                  </WishDetail>
               </Stack>
               <Stack
                  spacing={2}
                  direction={"row"}
                  justifyContent={"space-around"}
                  alignItems={"center"}
                  sx={styles.engagementBottom}
               >
                  <Button
                     size={"large"}
                     color={"grey"}
                     startIcon={<ThumbUpOffAltIcon />}
                  >
                     Like
                  </Button>
                  <Button
                     size={"large"}
                     color={"grey"}
                     startIcon={<CommentIcon />}
                  >
                     Comment
                  </Button>
               </Stack>
            </Box>
         </Box>
      </Paper>
   )
}

export default WishCard
