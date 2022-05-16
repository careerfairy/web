import React, { Fragment, useEffect, useState } from "react"
import { Rating, Wish } from "@careerfairy/shared-lib/dist/wishes"
import Paper from "@mui/material/Paper"
import { StylesProps } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import {
   AvatarGroup,
   Button,
   CircularProgress,
   Typography,
} from "@mui/material"
import userRepo from "../../../data/firebase/UserRepository"
import { Interest } from "@careerfairy/shared-lib/dist/interests"
import Stack from "@mui/material/Stack"
import { wishListBorderRadius } from "../../../constants/pages"
import UserAvatar from "../common/UserAvatar"
import { UserData } from "@careerfairy/shared-lib/dist/users"
import UpvoteIcon from "@mui/icons-material/ArrowUpward"
import DownvoteIcon from "@mui/icons-material/ArrowDownward"
import wishRepo from "../../../data/firebase/WishRepository"
import { useAuth } from "../../../HOCs/AuthProvider"
import { useDispatch } from "react-redux"
import * as actions from "../../../store/actions"
import DateUtil from "../../../util/DateUtil"
import { useRouter } from "next/router"
import { Hit } from "../../../types/algolia"
import WishCardMenuButton from "./WishCardMenuButton"
import WishSEO from "../common/WishSEO"

interface WishCardProps {
   wish: Hit<Wish>
   interests: Interest[]
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
   title: {
      wordBreak: "break-word",
      whiteSpace: "pre-line",
      "& em": {
         fontWeight: 600,
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

interface WishInterest extends Interest {
   highlighted?: boolean
}

const WishCard = ({ wish, interests }: WishCardProps) => {
   // get wish author from authorUid
   const [authorData, setAuthorData] = useState<UserData>(null)
   const [deleted, setDeleted] = useState(false)
   const [description, setDescription] = useState(
      wish._highlightResult.description.value
   )
   const [userRating, setUserRating] = useState<Rating>(null)
   const [wishInterests, setWishInterests] = useState<WishInterest[]>([])
   const [gettingAuthor, setGettingAuthor] = useState(false)
   const [upvoters, setUpvoters] = useState<UserData[]>(
      Array(wish.uidsOfRecentUpvoters.length || 0).fill(null)
   )
   const { query, push, asPath } = useRouter()
   // @ts-ignore
   const [date] = useState<Date>(new Date(wish.createdAt))
   const [numberOfUpvotes, setNumberOfUpvotes] = useState(wish.numberOfUpvotes)
   const { authenticatedUser, userData, isLoggedIn } = useAuth()
   const dispatch = useDispatch()
   const [voting, setVoting] = useState(false)

   useEffect(() => {
      setDescription(wish._highlightResult.description.value)
   }, [wish._highlightResult.description.value])

   useEffect(() => {
      ;(async function getUpvotersData() {
         if (wish.uidsOfRecentUpvoters.length) {
            const upvotersData = await userRepo.getUsersDataByUids(
               wish.uidsOfRecentUpvoters
            )
            setUpvoters(upvotersData)
         }
      })()
   }, [wish.uidsOfRecentUpvoters])
   useEffect(() => {
      setWishInterests(
         interests
            .filter((interest) => wish.interestIds.includes(interest.id))
            .map((interest) => ({
               ...interest,
               highlighted: Boolean(query.interests?.includes?.(interest.id)),
            }))
            .sort((a) => (a.highlighted ? -1 : 1))
      )
   }, [query.interests])

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
            const userRating = await wishRepo.getUserRating(
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
         const newRating = await wishRepo.toggleRateWish(
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
      await wishRepo.deleteWish(wish.id)
      setDeleted(true)
   }

   const onUpdateWish = (newInterests: Interest[], newDescription: string) => {
      setWishInterests(newInterests)
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
                  <Typography
                     component={"span"}
                     sx={styles.name}
                     variant={"h6"}
                  >
                     {authorDisplayName || "User"}
                  </Typography>
                  <br />
                  <Typography
                     sx={styles.title}
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
                     sx={styles.title}
                     variant={"subtitle1"}
                     gutterBottom
                  />
                  <Typography
                     color={"text.secondary"}
                     variant="subtitle2"
                     component="div"
                  >
                     {wishInterests.map((int, index) => (
                        <Fragment key={int.id}>
                           {!!index && bull}
                           {int.highlighted ? <b>{int.name}</b> : int.name}
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
         <WishSEO
            wishAuthor={authorDisplayName || "User"}
            // @ts-ignore
            wishCreationDate={new Date(wish.createdAt)}
            // @ts-ignore
            wishUpdateDate={wish.updatedAt ? new Date(wish.updatedAt) : null}
            wishDescription={wish.description}
            wishRating={`${parseInt(ratingValue)}`}
            // @ts-ignore
            wishRatingCount={wish.numberOfUpvotes + wish.numberOfDownvotes}
         />
      </Box>
   )
}

export default WishCard
