/* eslint-disable */
import React, { Fragment, useEffect, useState } from "react"
import { Rating, Wish } from "@careerfairy/shared-lib/wishes"
import Paper from "@mui/material/Paper"
import { StylesProps } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import {
   AvatarGroup,
   Button,
   CircularProgress,
   Typography,
} from "@mui/material"
import { Interest } from "@careerfairy/shared-lib/interests"
import Stack from "@mui/material/Stack"
import { wishListBorderRadius } from "../../../constants/pages"
import UserAvatar from "../common/UserAvatar"
import { UserData } from "@careerfairy/shared-lib/users"
import UpvoteIcon from "@mui/icons-material/ArrowUpward"
import DownvoteIcon from "@mui/icons-material/ArrowDownward"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useDispatch } from "react-redux"
import * as actions from "../../../store/actions"
import DateUtil from "../../../util/DateUtil"
import { useRouter } from "next/router"
import WishCardMenuButton from "./WishCardMenuButton"
import WishSEOSchemaScriptTag from "../common/WishSEOSchemaScriptTag"
import { userRepo, wishlistRepo } from "../../../data/RepositoryInstances"
import { Hit } from "@algolia/client-search"

interface WishCardProps {
   wish: Hit<Wish>
}

const styles: StylesProps = {
   paper: {
      p: 2,
      minHeight: "100px",
      display: "flex",
      borderRadius: wishListBorderRadius,
      boxShadow: "0px 8px 25px rgba(33, 32, 32, 0.1)",
   },
   root: {
      position: "relative",
      "& em": {
         fontWeight: 600,
      },
   },
   moreIconButton: {
      position: "absolute",
      top: 10,
      right: 10,
   },
   rightContent: {
      flex: 1,
   },
   name: {
      fontWeight: 600,
   },
   text: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
   },
   description: {
      fontWeight: 500,
   },
   totalLikes: {
      border: "none !important",
      background: "none",
      color: "black",
      fontWeight: 600,
      borderColor: "none",
      ml: "-2px !important",
   },
   actionsWrapper: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      alignContent: "center",
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

const WishCard = ({ wish }: WishCardProps) => {
   // get wish author from authorUid
   const [authorData, setAuthorData] = useState<UserData>(null)
   const [deleted, setDeleted] = useState(false)
   const [description, setDescription] = useState(
      wish._highlightResult?.description?.value || wish.description
   )
   const [userRating, setUserRating] = useState<Rating>(null)
   const [wishInterestNames, setWishInterestNames] = useState<string[]>([])
   const [gettingAuthor, setGettingAuthor] = useState(false)
   const [upvoters, setUpvoters] = useState<UserData[]>(
      Array(wish.uidsOfRecentUpvoters.length || 0).fill(null)
   )
   const { push, asPath } = useRouter()
   // @ts-ignore
   const [date] = useState<Date>(new Date(wish.createdAt))
   const [numberOfUpvotes, setNumberOfUpvotes] = useState(wish.numberOfUpvotes)
   const { authenticatedUser, userData, isLoggedIn } = useAuth()
   const dispatch = useDispatch()
   const [voting, setVoting] = useState(false)

   useEffect(() => {
      setDescription(
         wish._highlightResult?.description?.value || wish.description
      )
   }, [wish._highlightResult?.description?.value, wish.description])

   useEffect(() => {
      ;(async function getUpvotersData() {
         if (wish.uidsOfRecentUpvoters.length) {
            const upvotersData = await userRepo.getUsersDataByUuids(
               wish.uidsOfRecentUpvoters
            )
            setUpvoters(upvotersData)
         }
      })()
   }, [wish.uidsOfRecentUpvoters])
   useEffect(() => {
      const interests = wish._highlightResult?.interests?.length
         ? wish._highlightResult.interests.map(
              (interest) => interest.name.value
           )
         : wish.interests.map((interest) => interest.name)
      setWishInterestNames(interests)
   }, [wish._highlightResult?.interests, wish.interests])

   useEffect(() => {
      ;(async () => {
         try {
            setGettingAuthor(true)
            const newAuthorData = await userRepo.getUserDataByUid(
               wish.authorUid
            )
            setAuthorData(newAuthorData)
         } catch (error) {
            dispatch(actions.sendGeneralError(error))
         }
         setGettingAuthor(false)
      })()
   }, [])

   useEffect(() => {
      ;(async function getUserRating() {
         if (isLoggedIn) {
            const userRating = await wishlistRepo.getUserRating(
               wish.id,
               authenticatedUser.uid
            )
            setUserRating(userRating)
         }
      })()
   }, [isLoggedIn])

   const handleRate = async (type: "upvote" | "downvote") => {
      try {
         if (!isLoggedIn) return goToLogin()
         setVoting(true)
         const newRating = await wishlistRepo.toggleRateWish(
            authenticatedUser.uid,
            wish.id,
            type
         )
         if (!newRating?.type) {
            setUpvoters((prevUpvoters) => {
               const filtered = prevUpvoters.filter(
                  (upvoter) => upvoter.authId !== authenticatedUser.uid
               )
               if (filtered.length < prevUpvoters.length) {
                  // @ts-ignore
                  setNumberOfUpvotes(numberOfUpvotes - 1)
               }
               return filtered
            })
         } else if (newRating.type === "downvote") {
            setUpvoters((prevUpvoters) => {
               const filtered = prevUpvoters.filter(
                  (upvoter) => upvoter.authId !== authenticatedUser.uid
               )
               if (filtered.length < prevUpvoters.length) {
                  // @ts-ignore
                  setNumberOfUpvotes(numberOfUpvotes - 1)
               }
               return filtered
            })
         } else {
            setUpvoters((prevUpvoters) => {
               const found = prevUpvoters.find(
                  (upvoter) => upvoter.authId === authenticatedUser.uid
               )
               if (found) {
                  return prevUpvoters
               } else {
                  // @ts-ignore
                  setNumberOfUpvotes(numberOfUpvotes + 1)
                  return [...prevUpvoters, userData]
               }
            })
         }
         setUserRating(newRating)
      } catch (e) {
         dispatch(actions.sendGeneralError(e))
      }
      setVoting(false)
   }

   const handleUpvote = async () => {
      return handleRate("upvote")
   }
   const handleDownvote = async () => {
      return handleRate("downvote")
   }

   const handleDelete = async () => {
      await wishlistRepo.deleteWish(wish.id)
      setDeleted(true)
   }

   const onUpdateWish = (newInterests: Interest[], newDescription: string) => {
      wish.interestIds = newInterests.map((interest) => interest.id)
      wish.interests = [...newInterests]
      wish.description = newDescription
      setDescription(newDescription)
   }

   const getRatingValue = () => {
      // @ts-ignore
      const total = wish.numberOfUpvotes + wish.numberOfDownvotes
      return (
         // @ts-ignore
         ((total === 0 ? 1 : (wish.numberOfUpvotes / total) * 5) || 1).toFixed(
            2
         )
      )
   }

   const goToLogin = () => {
      void push({
         pathname: "/login",
         query: {
            absolutePath: asPath,
         },
      })
   }

   const ratingValue = getRatingValue()

   const authorDisplayName = gettingAuthor
      ? "..."
      : `${authorData?.firstName || ""} ${authorData?.lastName || ""}`

   if (deleted) return null

   // @ts-ignore
   return (
      <Box component={"article"} sx={styles.root}>
         <WishCardMenuButton
            wish={wish}
            sx={styles.moreIconButton}
            handleDelete={handleDelete}
            onUpdateWish={onUpdateWish}
         />
         <Paper
            component={Stack}
            spacing={2}
            justifyContent={"start"}
            alignItems={{ xs: "center", sm: "start" }}
            direction={{ xs: "column", sm: "row" }}
            sx={styles.paper}
         >
            <UserAvatar size={"large"} data={authorData} />
            <Stack sx={styles.rightContent} spacing={2}>
               <Box component={"header"}>
                  {/*<Typography*/}
                  {/*   component={"span"}*/}
                  {/*   sx={styles.name}*/}
                  {/*   variant={"h6"}*/}
                  {/*>*/}
                  {/*   {authorDisplayName || "User"}*/}
                  {/*</Typography>*/}
                  {/*<br />*/}
                  <Typography
                     sx={styles.text}
                     color={"text.secondary"}
                     variant={"subtitle1"}
                     gutterBottom
                     component={"time"}
                  >
                     {DateUtil.getRelativeDate(date)}
                  </Typography>
                  <Typography
                     dangerouslySetInnerHTML={{
                        __html: description,
                     }}
                     sx={[styles.text, styles.description]}
                     variant={"h6"}
                     gutterBottom
                  />
                  <Typography
                     color={"text.secondary"}
                     variant="subtitle2"
                     component="div"
                  >
                     {wishInterestNames.map((intName, index) => (
                        <Fragment key={intName + index}>
                           {!!index && bull}
                           <Box
                              component={"span"}
                              dangerouslySetInnerHTML={{
                                 __html: intName,
                              }}
                           />
                        </Fragment>
                     ))}
                  </Typography>
               </Box>
               <Box sx={styles.actionsWrapper}>
                  <Stack alignItems={"center"} direction={"row"} spacing={1}>
                     <Button
                        startIcon={
                           voting ? (
                              <CircularProgress size={15} color={"inherit"} />
                           ) : (
                              <UpvoteIcon color={"secondary"} />
                           )
                        }
                        disabled={voting}
                        size={"small"}
                        onClick={handleUpvote}
                        variant={"text"}
                        color={
                           userRating?.type === "upvote" ? "secondary" : "grey"
                        }
                     >
                        upvote
                     </Button>
                     <AvatarGroup
                        spacing={"small"}
                        componentsProps={{
                           additionalAvatar: { sx: styles.totalLikes },
                        }}
                        max={4}
                        // @ts-ignore
                        total={numberOfUpvotes}
                     >
                        {upvoters.map((upvoter, index) => (
                           <UserAvatar
                              key={upvoter?.id || index}
                              size={"small"}
                              data={upvoter}
                           />
                        ))}
                     </AvatarGroup>
                  </Stack>
                  <Button
                     startIcon={
                        voting ? (
                           <CircularProgress size={15} color={"inherit"} />
                        ) : (
                           <DownvoteIcon color={"secondary"} />
                        )
                     }
                     disabled={voting}
                     variant={"text"}
                     size={"small"}
                     color={
                        userRating?.type === "downvote" ? "secondary" : "grey"
                     }
                     onClick={handleDownvote}
                  >
                     downvote
                  </Button>
                  {/*<Button*/}
                  {/*   size={"large"}*/}
                  {/*   color={"grey"}*/}
                  {/*   itemProp={"discussionUrl"}
                  {/*   href={`${getBaseUrl()}/wish/${wish.id}`}
                  {/*   startIcon={<CommentIcon />}*/}
                  {/*>*/}
                  {/*   {wish.numberOfComments} comments*/}
                  {/*</Button>*/}
               </Box>
            </Stack>
         </Paper>
         <WishSEOSchemaScriptTag
            wishAuthor={authorDisplayName || "User"}
            wishCreationDate={
               // @ts-ignore
               isNaN(wish.createdAt) ? null : new Date(wish.createdAt)
            }
            wishUpdateDate={
               // @ts-ignore
               isNaN(wish.updatedAt) ? null : new Date(wish.updatedAt)
            }
            wishDescription={wish.description}
            wishRating={`${parseInt(ratingValue)}`}
            // @ts-ignore
            wishRatingCount={wish.numberOfUpvotes + wish.numberOfDownvotes}
         />
      </Box>
   )
}

export default WishCard
