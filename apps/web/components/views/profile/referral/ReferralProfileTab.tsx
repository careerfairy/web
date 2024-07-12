import { NetworkerBadge } from "@careerfairy/shared-lib/badges/NetworkBadges"
import { getHumanStringDescriptionForAction } from "@careerfairy/shared-lib/rewards"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import {
   Box,
   Button,
   Grid,
   Skeleton,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   TextField,
   Typography,
} from "@mui/material"
import * as Sentry from "@sentry/nextjs"
import { useSnackbar } from "notistack"
import { useAuth } from "../../../../HOCs/AuthProvider"
import ContentCard from "../../../../layouts/UserLayout/ContentCard"
import ContentCardTitle from "../../../../layouts/UserLayout/ContentCardTitle"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { makeReferralUrl } from "../../../../util/makeUrls"
import { SuspenseWithBoundary } from "../../../ErrorBoundary"
import useUserRewards from "../../../custom-hook/useUserRewards"
import {
   copyStringToClipboard,
   getTimeFromNow,
} from "../../../helperFunctions/HelperFunctions"
import BadgeSimpleButton from "../BadgeSimpleButton"
import { styles } from "../profileStyles"
import BadgeProgress from "./BadgeProgress"

const ReferralProfileTab = () => {
   const { userData, userPresenter } = useAuth()
   const { enqueueSnackbar } = useSnackbar()

   if (!userData?.referralCode) {
      // This shouldn't happen, but if it does, we record it to later analyse
      Sentry.captureException(new Error("ReferralCode missing"), {
         extra: {
            uid: userData?.authId as string,
         },
      })
      return (
         <>
            {
               "Your referral information is being generated, if this message persists talk to us."
            }
         </>
      )
   }

   const referralLink = makeReferralUrl(userData?.referralCode)

   const copyReferralLinkToClipboard = () => {
      copyStringToClipboard(referralLink)
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "success",
         preventDuplicate: true,
      })
      dataLayerEvent("referral_copy_link")
   }

   return (
      <ContentCard>
         <Grid container spacing={2}>
            <Grid item xs={8}>
               <ContentCardTitle>Refer your friends!</ContentCardTitle>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: "right" }}>
               <BadgeSimpleButton
                  badge={NetworkerBadge}
                  isActive={Boolean(userPresenter?.badges?.networkerBadge())}
               />
            </Grid>

            <Grid item xs={9}>
               <Box mb={4}>
                  <Typography sx={styles.subtitle}>
                     Share your personal referral link with friends who want to
                     sign up to the platform. You will stand out from the crowd
                     with very cool badges!
                  </Typography>
               </Box>
            </Grid>
         </Grid>

         <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sx={{ display: "flex", flexWrap: "wrap" }}>
               <TextField
                  sx={{ flex: 1, marginRight: "10px" }}
                  variant="outlined"
                  disabled
                  value={referralLink}
                  id="referralCode"
                  label="Referral Link"
                  name="referralCode"
               />
               <Button
                  variant="contained"
                  sx={{ boxShadow: "none" }}
                  startIcon={<ContentPasteIcon />}
                  onClick={copyReferralLinkToClipboard}
               >
                  Copy
               </Button>
            </Grid>

            <Grid item xs={12}>
               <BadgeProgress />
            </Grid>

            <Grid item xs={12}>
               <SuspenseWithBoundary fallback={<LoadingRewardsTable />}>
                  <RewardsTable userDataId={userData.id} />
               </SuspenseWithBoundary>
            </Grid>
         </Grid>
      </ContentCard>
   )
}

const localStyles = {
   cell: {
      padding: "16px 0",
   },
}

const RewardsTable = ({ userDataId }) => {
   const { data } = useUserRewards(userDataId)

   return (
      <TableContainer>
         <Table aria-label="simple table" padding="none" sx={{ minWidth: 650 }}>
            <TableHead>
               <TableRow>
                  <TableCell sx={localStyles.cell}>Description</TableCell>
                  <TableCell sx={localStyles.cell}>User</TableCell>
                  <TableCell sx={localStyles.cell}>Updated</TableCell>
                  {/*<TableCell sx={localStyles.cell} align="right">
                     Reward
                  </TableCell>*/}
               </TableRow>
            </TableHead>
            <TableBody>
               {data.length === 0 && (
                  <TableRow
                     key={0}
                     sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                     <TableCell
                        component="th"
                        scope="row"
                        sx={localStyles.cell}
                        colSpan={4}
                        align="center"
                     >
                        No referrals recorded yet!
                     </TableCell>
                  </TableRow>
               )}
               {data.map((reward) => (
                  <TableRow
                     key={reward.id}
                     sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                     <TableCell
                        component="th"
                        scope="row"
                        sx={localStyles.cell}
                     >
                        {getHumanStringDescriptionForAction(reward.action)}
                     </TableCell>
                     <TableCell sx={localStyles.cell}>
                        {reward.userData?.firstName} {reward.userData?.lastName}
                     </TableCell>
                     <TableCell sx={localStyles.cell}>
                        {getTimeFromNow(reward.createdAt)}
                     </TableCell>
                     {/*<TableCell sx={localStyles.cell} align="right">
                        +{reward.points} pts
                     </TableCell>*/}
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </TableContainer>
   )
}

const LoadingRewardsTable = () => {
   return (
      <Box>
         <Skeleton />
         <Skeleton animation="wave" />
         <Skeleton animation="wave" />
      </Box>
   )
}

export default ReferralProfileTab
