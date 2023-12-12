import {
   Avatar,
   Box,
   Button,
   Grid,
   ListItem,
   Stack,
   Tooltip,
   Typography,
} from "@mui/material"
import React, { FC, useCallback, useEffect, useState } from "react"
import { UserData } from "@careerfairy/shared-lib/users"
import { useDownloadCV } from "../../../common/table/hooks"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { getResizedUrl } from "../../../../../../helperFunctions/HelperFunctions"
import { Link } from "@careerfairy/streaming/components"
import { LoadingButton } from "@mui/lab"
import DownloadIcon from "@mui/icons-material/CloudDownloadOutlined"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   listItem: {
      background: "white",
      borderRadius: "8px",
      padding: 2,
      height: "80px",
      alignItems: "center",
   },
   companyAvatar: {
      width: 48,
      height: 48,
   },
   userDataSection: {
      whiteSpace: "nowrap",
      overflow: "hidden",
   },
   userName: {
      fontSize: "16px",
      fontWeight: "600",
   },
   cursorPointer: {
      cursor: "pointer",
   },
   fieldOfStudy: {
      fontSize: "14px",
      color: "grey",
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   userUniversityDataSection: {
      alignSelf: "center",
   },
   userData: {
      fontSize: "16px",
      display: "block",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
   },
   userDataActions: {
      display: "flex",
      justifyContent: "end",
      alignSelf: "center",
   },
   linkedInBtn: {
      textTransform: "none",
      height: "32px",
      width: "90px",
      color: "grey",
   },
   downloadCvBtn: {
      textTransform: "none",
      height: "32px",
      width: "75px",
      ml: 2,
   },
})

type Props = {
   applicants: UserData[]
}

const JobApplicantsList: FC<Props> = ({ applicants }) => {
   return (
      <Stack spacing={2} my={3}>
         {applicants.map((user) => (
            <ApplicationItem key={user.id} applicant={user} />
         ))}
      </Stack>
   )
}

type ApplicantsTooltip = {
   userFullName: {
      visible: boolean
      id: string
   }
   userUniversityCountry: {
      visible: boolean
      id: string
   }
   userUniversityName: {
      visible: boolean
      id: string
   }
   userFieldOfStudy: {
      visible: boolean
      id: string
   }
}

type ApplicationItemProps = {
   applicant: UserData
}
const ApplicationItem: FC<ApplicationItemProps> = ({ applicant }) => {
   const { handleDownloadCV, downloadingPDF } = useDownloadCV(applicant)
   const [applicantsTooltip, setApplicantsTooltip] =
      useState<ApplicantsTooltip>({
         userFullName: {
            visible: false,
            id: `userName-${applicant.id}`,
         },
         userUniversityCountry: {
            visible: false,
            id: `userUniversityCountry-${applicant.id}`,
         },
         userUniversityName: {
            visible: false,
            id: `userUniversityName-${applicant.id}`,
         },
         userFieldOfStudy: {
            visible: false,
            id: `userFieldOfStudy-${applicant.id}`,
         },
      })

   useEffect(() => {
      handleApplicantsDataTooltip()
      window.addEventListener("resize", handleApplicantsDataTooltip)

      return () =>
         window.removeEventListener("resize", handleApplicantsDataTooltip)
   }, [])

   const userFullName = applicant.firstName
      ? `${applicant.firstName} ${applicant.lastName}`
      : "Unknown"
   const userUniversityCountry =
      universityCountryMap?.[applicant.universityCountryCode]
   const userUniversityName = applicant.university?.name
   const userFieldOfStudy = applicant.fieldOfStudy?.name
   const userLevelOfStudy = applicant.levelOfStudy?.name || "Unknown"

   const handleApplicantsDataTooltip = useCallback(() => {
      const userFullNameElement = document.getElementById(
         applicantsTooltip.userFullName.id
      )
      const userFieldOfStudyElement = document.getElementById(
         applicantsTooltip.userFieldOfStudy.id
      )
      const userUniversityCountryElement = document.getElementById(
         applicantsTooltip.userUniversityCountry.id
      )
      const userUniversityNameElement = document.getElementById(
         applicantsTooltip.userUniversityName.id
      )

      const newApplicantsTooltip: ApplicantsTooltip = {
         userFullName: {
            id: applicantsTooltip.userFullName.id,
            visible:
               userFullNameElement.scrollWidth >
               userFullNameElement.clientWidth,
         },
         userFieldOfStudy: {
            id: applicantsTooltip.userFieldOfStudy.id,
            visible:
               userFieldOfStudyElement.scrollWidth >
               userFieldOfStudyElement.clientWidth,
         },
         userUniversityCountry: {
            id: applicantsTooltip.userUniversityCountry.id,
            visible:
               userUniversityCountryElement.scrollWidth >
               userFieldOfStudyElement.clientWidth,
         },
         userUniversityName: {
            id: applicantsTooltip.userUniversityName.id,
            visible:
               userUniversityNameElement.scrollWidth >
               userUniversityNameElement.clientWidth,
         },
      }

      setApplicantsTooltip(newApplicantsTooltip)
   }, [
      applicantsTooltip.userFieldOfStudy.id,
      applicantsTooltip.userFullName.id,
      applicantsTooltip.userUniversityCountry.id,
      applicantsTooltip.userUniversityName.id,
   ])

   return (
      <ListItem sx={styles.listItem}>
         <Grid container spacing={5}>
            <Grid item md={3} display={"flex"}>
               <Avatar
                  sx={styles.companyAvatar}
                  alt={`User ${userFullName} avatar`}
                  src={getResizedUrl(applicant.avatar, "xs")}
               />

               <Box ml={2} sx={styles.userDataSection}>
                  <Tooltip
                     arrow
                     title={
                        applicantsTooltip.userFullName.visible
                           ? userFullName
                           : ""
                     }
                  >
                     <Typography
                        id={applicantsTooltip.userFullName.id}
                        variant={"body1"}
                        noWrap
                        sx={[
                           styles.userName,
                           applicantsTooltip.userFullName.visible
                              ? styles.cursorPointer
                              : null,
                        ]}
                     >
                        {userFullName}
                     </Typography>
                  </Tooltip>

                  <Tooltip
                     arrow
                     title={
                        applicantsTooltip.userFieldOfStudy.visible
                           ? userFieldOfStudy
                           : ""
                     }
                  >
                     <Typography
                        id={applicantsTooltip.userFieldOfStudy.id}
                        variant={"body1"}
                        noWrap
                        sx={[
                           styles.fieldOfStudy,
                           applicantsTooltip.userFieldOfStudy.visible
                              ? styles.cursorPointer
                              : null,
                        ]}
                     >
                        {userFieldOfStudy}
                     </Typography>
                  </Tooltip>
               </Box>
            </Grid>

            <Grid item md={2} sx={styles.userUniversityDataSection}>
               <Tooltip
                  arrow
                  title={
                     applicantsTooltip.userUniversityCountry.visible
                        ? userUniversityCountry
                        : ""
                  }
               >
                  <Typography
                     id={applicantsTooltip.userUniversityCountry.id}
                     variant={"body1"}
                     noWrap
                     sx={[
                        styles.userData,
                        applicantsTooltip.userUniversityCountry.visible
                           ? styles.cursorPointer
                           : null,
                     ]}
                  >
                     {userUniversityCountry}
                  </Typography>
               </Tooltip>
            </Grid>

            <Grid item md={2} sx={styles.userUniversityDataSection}>
               <Tooltip
                  arrow
                  title={
                     applicantsTooltip.userUniversityName.visible
                        ? userUniversityName
                        : ""
                  }
               >
                  <Typography
                     id={applicantsTooltip.userUniversityName.id}
                     variant={"body1"}
                     noWrap
                     sx={[
                        styles.userData,
                        applicantsTooltip.userUniversityName.visible
                           ? styles.cursorPointer
                           : null,
                     ]}
                  >
                     {userUniversityName}
                  </Typography>
               </Tooltip>
            </Grid>

            <Grid item md={2} sx={styles.userUniversityDataSection}>
               <Typography variant={"body1"} sx={styles.userData}>
                  {userLevelOfStudy}
               </Typography>
            </Grid>

            <Grid item md={3} sx={styles.userDataActions}>
               <Button
                  component={Link}
                  target={"_blank"}
                  href={applicant.linkedinUrl || ""}
                  variant={
                     Boolean(applicant.linkedinUrl) ? "outlined" : "contained"
                  }
                  size="small"
                  color={"grey"}
                  disabled={!Boolean(applicant.linkedinUrl)}
                  sx={styles.linkedInBtn}
               >
                  Linked
               </Button>

               <LoadingButton
                  disabled={!Boolean(applicant.userResume)}
                  loading={downloadingPDF}
                  onClick={handleDownloadCV}
                  sx={styles.downloadCvBtn}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
               >
                  CV
               </LoadingButton>
            </Grid>
         </Grid>
      </ListItem>
   )
}

export default JobApplicantsList
