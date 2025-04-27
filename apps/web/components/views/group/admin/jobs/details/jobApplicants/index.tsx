import { CustomJobApplicant } from "@careerfairy/shared-lib/customJobs/customJobs"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import { Box, Button, Grid, Stack, Tooltip, Typography } from "@mui/material"
import { useAuth } from "HOCs/AuthProvider"
import React, { FC, useCallback, useMemo, useState } from "react"
import { useLocalStorage } from "react-use"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useCustomJobStats from "../../../../../../custom-hook/custom-job/useCustomJobStats"
import usePaginatedJobApplicants from "../../../../../../custom-hook/custom-job/usePaginatedJobApplicants"
import { StyledPagination } from "../../../common/CardCustom"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import JobApplicantsList from "./JobApplicantsList"

const styles = sxStyles({
   statsSection: {
      display: "flex",
      flexDirection: "column",
      px: "12px",
      py: 1,
      borderRadius: 2,
      background: "white",
      border: "1px solid #F0EDFD",
      height: "100%",
   },
   statsLabel: {
      fontSize: { xs: "12px", md: "14px" },
   },
   statsValue: {
      fontSize: "20px",
      fontWeight: "bold",
      lineHeight: "30px",
   },
   pagination: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
   },
})

type Props = {
   jobId: string
}

const JobApplicants: FC<Props> = ({ jobId }) => {
   const jobStats = useCustomJobStats(jobId)

   const { userData } = useAuth()
   const [hasSeenTooltip, setHasSeenTooltip] = useLocalStorage(
      `job-applicants-tooltip-${userData?.authId}`,
      false
   )
   const [openTooltip, setOpenTooltip] = useState(!hasSeenTooltip)
   console.log("🚀 ~ openTooltip:", openTooltip)

   const acknowledgeTooltip = (e: React.MouseEvent) => {
      e.stopPropagation()

      setHasSeenTooltip(true)
      setOpenTooltip(false)
   }

   const totalViews = jobStats.views || jobStats.applicants + jobStats.clicks
   const paginatedResults = usePaginatedJobApplicants(jobId)

   const applicants = useMemo(() => {
      return (
         paginatedResults.data
            ?.filter(filterCFUsersApplications)
            .map(convertJobApplicantToUserData) || []
      )
   }, [paginatedResults])

   const onPageChange = useCallback(
      (_: React.ChangeEvent<unknown>, page: number) => {
         if (page > paginatedResults.page) {
            paginatedResults.next()
         } else {
            paginatedResults.prev()
         }
      },
      [paginatedResults]
   )

   // useEffect(() => {
   //    const shouldShowTooltip = !hasSeenTooltip
   //    setHasSeenTooltip(!shouldShowTooltip)
   //    setOpenTooltip(shouldShowTooltip)
   // }, [hasSeenTooltip, setHasSeenTooltip])

   return (
      <>
         <Grid container spacing={1}>
            <Grid item xs={4}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"neutral.700"}
                     sx={styles.statsLabel}
                  >
                     Job posting views
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {totalViews}
                  </Typography>
               </Box>
            </Grid>
            <Grid item xs={4}>
               <Box sx={styles.statsSection}>
                  <Typography
                     variant={"subtitle1"}
                     color={"neutral.700"}
                     sx={styles.statsLabel}
                  >
                     Initiated applications
                  </Typography>
                  <Typography variant={"body1"} sx={styles.statsValue}>
                     {jobStats.clicks}
                  </Typography>
               </Box>
            </Grid>
            <Grid item xs={4}>
               <Box sx={styles.statsSection}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                     <Typography
                        variant={"subtitle1"}
                        color={"neutral.700"}
                        sx={styles.statsLabel}
                     >
                        Confirmed applicants
                     </Typography>
                     {hasSeenTooltip ? (
                        <Tooltip
                           title={
                              <RolledTooltipContent
                                 hasSeenTooltip={hasSeenTooltip}
                                 acknowledgeTooltip={acknowledgeTooltip}
                              />
                           }
                           sx={{ color: (theme) => theme.brand.black[700] }}
                        >
                           <InfoIcon />
                        </Tooltip>
                     ) : null}
                  </Stack>
                  <Box width={"fit-content"}>
                     <Tooltip
                        open={openTooltip}
                        title={
                           <RolledTooltipContent
                              hasSeenTooltip={hasSeenTooltip}
                              acknowledgeTooltip={acknowledgeTooltip}
                           />
                        }
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        placement="bottom"
                        slotProps={{
                           popper: {
                              disablePortal: true,
                              keepMounted: true,
                           },
                        }}
                        sx={{
                           color: (theme) => theme.brand.black[700],
                           width: "fit-content",
                           alignSelf: "center",
                        }}
                     >
                        <Typography variant={"body1"} sx={styles.statsValue}>
                           {jobStats.applicants}
                        </Typography>
                     </Tooltip>
                  </Box>
               </Box>
            </Grid>
         </Grid>

         <JobApplicantsList applicants={applicants} />

         {applicants.length ? (
            <StyledPagination
               count={
                  paginatedResults.nextDisabled
                     ? paginatedResults.page
                     : paginatedResults.page + 1
               }
               page={paginatedResults.page}
               color="secondary"
               disabled={paginatedResults.loading}
               onChange={onPageChange}
               siblingCount={0}
               boundaryCount={0}
               size="small"
            />
         ) : null}
      </>
   )
}

type RolledTooltipContentProps = {
   hasSeenTooltip: boolean
   acknowledgeTooltip: (e: React.MouseEvent) => void
}

const RolledTooltipContent = ({
   hasSeenTooltip,
   acknowledgeTooltip,
}: RolledTooltipContentProps) => (
   <Stack spacing={"10px"} p={1} alignItems={"flex-end"}>
      <Typography variant="xsmall" color="neutral.700" fontWeight={400}>
         You&apos;re seeing confirmed applicants only. Some candidates may have
         applied after clicking the job link but haven&apos;t marked it as
         confirmed yet.
      </Typography>
      {!hasSeenTooltip && (
         <Button
            variant="outlined"
            sx={{
               width: "fit-content",
               padding: "8px 16px",
               fontSize: "12px",
               border: (theme) => `1px solid ${theme.brand.purple[600]}`,
               backgroundColor: (theme) => theme.brand.white[300],
            }}
            color="secondary"
            onClick={acknowledgeTooltip}
         >
            <Typography variant="small" color="purple.700" fontWeight={400}>
               Got it!
            </Typography>
         </Button>
      )}
   </Stack>
)

const convertJobApplicantToUserData = (
   doc: Partial<CustomJobApplicant>
): UserDataEntry => ({
   email: doc.user.userEmail,
   firstName: doc.user.firstName || "",
   lastName: doc.user.lastName || "",
   universityName: doc.user.university?.name || "",
   universityCountryCode: doc.user.universityCountryCode || "",
   fieldOfStudy: doc.user.fieldOfStudy?.name || "",
   levelOfStudy: doc.user.levelOfStudy?.name || "",
   linkedInUrl: doc.user.linkedinUrl || "",
   resumeUrl: doc.user.userResume || "",
   universityCountryName:
      universityCountryMap?.[doc.user.universityCountryCode] || "",
   avatar: doc.user.avatar,
})

// to filter out all the applications done by CareerFairy users
const filterCFUsersApplications = (doc: Partial<CustomJobApplicant>) =>
   !doc.user.userEmail.includes("@careerfairy")

export default JobApplicants
