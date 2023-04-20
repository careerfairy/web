import React, { FC, useMemo } from "react"
import { sxStyles } from "../../../types/commonTypes"
import { Box, Button, Collapse, Grid, Paper, Typography } from "@mui/material"
import Stack from "@mui/material/Stack"
import FollowButton from "../common/company/FollowButton"
import { useCompanyPage } from "./index"
import { useRouter } from "next/router"
import Link from "../common/Link"
import Avatar from "@mui/material/Avatar"
import Image from "next/image"
import { placeholderAvatar } from "../../../constants/images"
import { useAuth } from "../../../HOCs/AuthProvider"
import useCollection from "../../custom-hook/useCollection"
import { userRepo } from "../../../data/RepositoryInstances"
import BulletPoints from "../common/BulletPoints"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: "80px",
      px: 3,
      py: 2,
      borderRadius: 3,
      border: "1px solid #EDE7FD",
   },
   avatar: {
      bgcolor: "transparent",
      width: "70%",
      mx: "auto",
      minHeight: "135px",
   },
})

const commonPoints = [
   "Receive personalised recommendations",
   "Be notified when new live streams or open positions are published",
]
const followPoints = commonPoints

const signupPoints = [...commonPoints, "Be contacted based on your profile"]

export const FollowCompany = () => {
   const { group } = useCompanyPage()
   const { isLoggedIn, authenticatedUser } = useAuth()

   const query = useMemo(
      () => userRepo.getCompaniesUserFollowsQuery(authenticatedUser.email, 1),
      [authenticatedUser.email]
   )

   const { data, isLoading } = useCollection(query, true)

   const count = data?.length || 0

   const showFollow = isLoggedIn && count < 1 && !isLoading

   return (
      <Collapse unmountOnExit in={showFollow}>
         <CTACard>
            <Stack spacing={2}>
               <Typography variant="h4" fontWeight={"600"} color="black">
                  Start following companies
               </Typography>
               <BulletPoints points={followPoints} />
               <span>
                  <FollowButton color="primary" group={group} />
               </span>
            </Stack>
         </CTACard>
      </Collapse>
   )
}

export const SignUp = () => {
   const { asPath } = useRouter()
   const { isLoggedIn } = useAuth()

   if (isLoggedIn) return null

   return (
      <CTACard>
         <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
               <Avatar sx={styles.avatar}>
                  <Image
                     layout={"fill"}
                     quality={100}
                     objectFit={"contain"}
                     alt={"placeholder avatar"}
                     src={placeholderAvatar}
                  />
               </Avatar>
            </Grid>
            <Grid item xs={12} sm={8}>
               <Stack spacing={2}>
                  <Typography variant="h4" fontWeight={"600"} color="black">
                     Sign Up Now!
                  </Typography>
                  <BulletPoints points={signupPoints} />
                  <Box>
                     <span>
                        <Link
                           href={{
                              pathname: "/signup",
                              query: {
                                 absolutePath: asPath,
                              },
                           }}
                           noLinkStyle
                        >
                           <Button variant="contained" color="secondary">
                              SIGN UP
                           </Button>
                        </Link>
                     </span>
                     <Typography mt={1} variant="body1" color="black">
                        Already have an account?{" "}
                        <Link
                           href={{
                              pathname: "/login",
                              query: {
                                 absolutePath: asPath,
                              },
                           }}
                           noLinkStyle
                        >
                           Log in
                        </Link>
                     </Typography>
                  </Box>
               </Stack>
            </Grid>
         </Grid>
      </CTACard>
   )
}

const CTACard: FC = ({ children }) => {
   return (
      <Paper variant={"outlined"} sx={styles.root}>
         {children}
      </Paper>
   )
}
