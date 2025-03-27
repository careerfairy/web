import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import {
   Button,
   Collapse,
   Paper,
   SxProps,
   Theme,
   Typography,
} from "@mui/material"
import Stack from "@mui/material/Stack"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { FC, useMemo } from "react"
import { useAuth } from "../../../HOCs/AuthProvider"
import { userRepo } from "../../../data/RepositoryInstances"
import { combineStyles, sxStyles } from "../../../types/commonTypes"
import useCollection from "../../custom-hook/useCollection"
import { CompanyPageBulletPoints } from "../common/BulletPoints"
import FollowButton from "../common/company/FollowButton"
import { useCompanyPage } from "./index"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minHeight: "80px",
      p: 2,
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      background: (theme) => theme.brand.white[200],
   },
   avatar: {
      bgcolor: "transparent",
      width: "100px",
      height: "100px",
      mx: "auto",
   },
   signup: {
      border: "1px solid rgba(42, 186, 165, 0.38)",
      background: `url('/sign-up-banner.svg'), radial-gradient(278.11% 143.5% at 1.9% -0.11%, rgba(42, 186, 165, 0.14) 0%, rgba(42, 186, 165, 0.00) 100%), radial-gradient(422% 167.87% at 102.92% 99.89%, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.00) 53%), #0E1817`,
      backgroundSize: "120px, cover, cover",
      backgroundPosition: "right -20px top -150px, center, center",
      backgroundRepeat: "no-repeat, no-repeat, no-repeat",
   },
   follow: {
      background: `url('/follow-banner.svg')`,
      backgroundSize: "120px, cover, cover",
      backgroundPosition: "right -20px top -150px, center, center",
      backgroundRepeat: "no-repeat, no-repeat, no-repeat",
   },
})

const commonPoints = [
   "Receive personalised recommendations",
   "Be notified when new live streams or open positions are published",
]
const followPoints = commonPoints

const signupPoints = [
   "Be the first to know about job openings",
   "Get tailored stream recommendations",
]

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
         <CTACard sx={styles.follow}>
            <Stack spacing={"20px"}>
               <Typography
                  variant="brandedH5"
                  fontWeight={"500"}
                  color="neutral.800"
               >
                  Start following{" "}
                  <Typography
                     variant="brandedH5"
                     color="neutral.800"
                     fontWeight={700}
                  >
                     companies
                  </Typography>
               </Typography>
               <Stack spacing={"24px"}>
                  <CompanyPageBulletPoints points={followPoints} />
                  <span>
                     <FollowButton
                        color="primary"
                        group={group}
                        interactionSource={InteractionSources.Company_Page}
                        showStartIcon={false}
                     />
                  </span>
               </Stack>
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
      <CTACard sx={styles.signup}>
         <Stack spacing={"20px"}>
            <Typography variant="brandedH5" fontWeight={"500"} color="#fff">
               Get in First.{" "}
               <Typography variant="brandedH5" color="#fff" fontWeight={700}>
                  Stay Ahead.
               </Typography>
            </Typography>
            <Stack spacing={"24px"}>
               <CompanyPageBulletPoints
                  points={signupPoints}
                  typographySx={{ color: (theme) => theme.brand.white[100] }}
               />
               <Link
                  href={{
                     pathname: "/signup",
                     query: {
                        absolutePath: asPath,
                     },
                  }}
               >
                  <Button
                     sx={{ width: "fit-content" }}
                     variant="contained"
                     color="primary"
                  >
                     Sign up now!
                  </Button>
               </Link>
            </Stack>
         </Stack>
      </CTACard>
   )
}

const CTACard: FC<{
   children: React.ReactNode
   sx?: SxProps<Theme>
}> = ({ children, sx }) => {
   return (
      <Paper variant={"outlined"} sx={combineStyles(styles.root, sx)}>
         {children}
      </Paper>
   )
}
