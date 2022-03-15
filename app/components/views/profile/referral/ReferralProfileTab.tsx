import {
   Box,
   Button,
   Container,
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
import React from "react"
import { styles } from "../profileStyles"
import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import { makeReferralUrl } from "../../../../util/makeUrls"
import { useSnackbar } from "notistack"
import {
   copyStringToClipboard,
   getTimeFromNow,
} from "../../../helperFunctions/HelperFunctions"
import * as Sentry from "@sentry/nextjs"
import { getHumanStringDescriptionForAction } from "../../../../../shared/rewards"
import useCollection from "../../../custom-hook/useCollection"
import { Reward } from "../../../../types/reward"

const ReferralProfileTab = ({ userData }) => {
   const { enqueueSnackbar } = useSnackbar()

   if (!userData.referralCode) {
      // This shouldn't happen, but if it does, we record it to later analyse
      Sentry.captureException(new Error("ReferralCode missing"), {
         extra: {
            uid: userData.authId as string,
         },
      })
      return "Your referral information is being generated, if this message persists talk to us."
   }

   const referralLink = makeReferralUrl(userData.referralCode)

   const copyReferralLinkToClipboard = () => {
      copyStringToClipboard(referralLink)
      enqueueSnackbar("Link has been copied to your clipboard", {
         variant: "success",
         preventDuplicate: true,
      })
   }

   return (
      <Container component="main" maxWidth="md">
         <Box boxShadow={1} p={4} sx={styles.box}>
            <Typography sx={{ color: "text.secondary" }} variant="h5">
               Refer your friends!
            </Typography>

            <p>
               Share your personal referral link with friends who want to sign
               up to the platform. Very soon, you will earn a special status and
               will get access to exclusive features if you refer at least 3
               friends!
            </p>

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
                  <RewardsTable userDataId={userData.id} />
               </Grid>
            </Grid>
         </Box>
      </Container>
   )
}

const localStyles = {
   cell: {
      padding: "16px 0",
   },
}

const RewardsTable = ({ userDataId }) => {
   let { isLoading, data } = useCollection<Reward>(
      (firestore) =>
         firestore.collection("userData").doc(userDataId).collection("rewards"),
      true
   )

   if (isLoading) {
      return (
         <Box>
            <Skeleton />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
         </Box>
      )
   }

   data = data.sort((a, b) => {
      return b.createdAt.toMillis() - a.createdAt.toMillis()
   })

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
                        {reward.userData.firstName} {reward.userData.lastName}
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

export default ReferralProfileTab
