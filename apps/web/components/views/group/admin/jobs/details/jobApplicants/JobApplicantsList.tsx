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
import { useDownloadCV } from "../../../common/table/hooks"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { getResizedUrl } from "../../../../../../helperFunctions/HelperFunctions"
import { Link } from "@careerfairy/streaming/components"
import { LoadingButton } from "@mui/lab"
import DownloadIcon from "@mui/icons-material/CloudDownloadOutlined"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"

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
   applicants: UserDataEntry[]
}

const JobApplicantsList: FC<Props> = ({ applicants }) => {
   return (
      <Stack spacing={2} my={3}>
         {applicants.map((user) => (
            <ApplicationItem key={user.email} applicant={user} />
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
   applicant: UserDataEntry
}
const ApplicationItem: FC<ApplicationItemProps> = ({ applicant }) => {
   const { handleDownloadCV, downloadingPDF } = useDownloadCV(applicant)
   const [applicantsTooltip, setApplicantsTooltip] =
      useState<ApplicantsTooltip>({
         userFullName: {
            visible: false,
            id: `userName-${applicant.email}`,
         },
         userUniversityCountry: {
            visible: false,
            id: `userUniversityCountry-${applicant.email}`,
         },
         userUniversityName: {
            visible: false,
            id: `userUniversityName-${applicant.email}`,
         },
         userFieldOfStudy: {
            visible: false,
            id: `userFieldOfStudy-${applicant.email}`,
         },
      })

   useEffect(() => {
      handleApplicantsDataTooltip()
      window.addEventListener("resize", handleApplicantsDataTooltip)

      return () =>
         window.removeEventListener("resize", handleApplicantsDataTooltip)
   }, [])

   const {
      firstName,
      lastName,
      universityCountryCode,
      universityName,
      fieldOfStudy,
      levelOfStudy,
   } = applicant

   const userFullName = `${firstName} ${lastName}`
   const userUniversityCountry = universityCountryMap?.[universityCountryCode]

   /**
    * Handles the visibility of tooltips for applicant data.
    * If the content of applicant details overflows its display container,
    * triggers the tooltip to display the full string.
    * The function checks and updates the tooltip visibility based on the width
    * of the content compared to its container, ensuring accurate tooltip display.
    */
   const handleApplicantsDataTooltip = useCallback(() => {
      // Get references to DOM elements using their IDs
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

      // Check if the content of each element overflows its container
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
               userUniversityCountryElement.clientWidth,
         },
         userUniversityName: {
            id: applicantsTooltip.userUniversityName.id,
            visible:
               userUniversityNameElement.scrollWidth >
               userUniversityNameElement.clientWidth,
         },
      }

      // Update the state with the new visibility information
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
                        sx={styles.userName}
                     >
                        {userFullName}
                     </Typography>
                  </Tooltip>

                  <Tooltip
                     arrow
                     title={
                        applicantsTooltip.userFieldOfStudy.visible
                           ? fieldOfStudy
                           : ""
                     }
                  >
                     <Typography
                        id={applicantsTooltip.userFieldOfStudy.id}
                        variant={"body1"}
                        noWrap
                        sx={styles.userData}
                     >
                        {fieldOfStudy}
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
                     sx={styles.userData}
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
                        ? universityName
                        : ""
                  }
               >
                  <Typography
                     id={applicantsTooltip.userUniversityName.id}
                     variant={"body1"}
                     noWrap
                     sx={styles.userData}
                  >
                     {universityName}
                  </Typography>
               </Tooltip>
            </Grid>

            <Grid item md={2} sx={styles.userUniversityDataSection}>
               <Typography variant={"body1"} sx={styles.userData}>
                  {levelOfStudy}
               </Typography>
            </Grid>

            <Grid item md={3} sx={styles.userDataActions}>
               <Button
                  component={Link}
                  target={"_blank"}
                  href={applicant.linkedInUrl || ""}
                  variant={
                     Boolean(applicant.linkedInUrl) ? "outlined" : "contained"
                  }
                  size="small"
                  color={"grey"}
                  disabled={!Boolean(applicant.linkedInUrl)}
                  sx={styles.linkedInBtn}
               >
                  Linked
               </Button>

               <LoadingButton
                  disabled={!Boolean(applicant.resumeUrl)}
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
