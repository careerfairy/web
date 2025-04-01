import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Box, Button, Collapse, Paper, Typography } from "@mui/material"
import Avatar from "@mui/material/Avatar"
import Stack from "@mui/material/Stack"
import useIsMobile from "components/custom-hook/useIsMobile"
import Image from "next/legacy/image"
import { useRouter } from "next/router"
import React, { FC, useMemo } from "react"
import { useAuth } from "../../../HOCs/AuthProvider"
import { placeholderAvatar } from "../../../constants/images"
import { userRepo } from "../../../data/RepositoryInstances"
import { sxStyles } from "../../../types/commonTypes"
import useCollection from "../../custom-hook/useCollection"
import BulletPoints from "../common/BulletPoints"
import Link from "../common/Link"
import FollowButton from "../common/company/FollowButton"
import { useCompanyPage } from "./index"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: "80px",
      px: 4,
      py: 3,
      borderRadius: 3,
      border: "1px solid rgba(103, 73, 234, 0.30)",
   },
   avatar: {
      bgcolor: "transparent",
      width: "100px",
      height: "100px",
      mx: "auto",
   },
})

const commonPoints = [
   "Receive personalised recommendations",
   "Be invited to their new live streams and open positions",
   "Get notified when a company publishes a new Spark",
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
                  <FollowButton
                     color="primary"
                     group={group}
                     interactionSource={InteractionSources.Company_Page}
                  />
               </span>
            </Stack>
         </CTACard>
      </Collapse>
   )
}

export const SignUp = () => {
   const { asPath } = useRouter()
   const isMobile = useIsMobile()
   const { isLoggedIn } = useAuth()

   if (isLoggedIn) return null

   return (
      <CTACard>
         <Stack direction={isMobile ? "column" : "row"} spacing={2}>
            <Avatar sx={styles.avatar}>
               <Image
                  layout={"fill"}
                  quality={100}
                  objectFit={"contain"}
                  alt={"placeholder avatar"}
                  src={placeholderAvatar}
               />
            </Avatar>
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
         </Stack>
      </CTACard>
   )
}

const CTACard: FC<{
   children: React.ReactNode
}> = ({ children }) => {
   return (
      <Paper variant={"outlined"} sx={styles.root}>
         {children}
      </Paper>
   )
}
