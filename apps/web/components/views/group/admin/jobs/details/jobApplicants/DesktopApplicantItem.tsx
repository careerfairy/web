import { Avatar, Box, Grid, Tooltip, Typography } from "@mui/material"
import { getResizedUrl } from "../../../../../../helperFunctions/HelperFunctions"
import React, { FC, useCallback, useEffect, useState } from "react"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import { sxStyles } from "../../../../../../../types/commonTypes"

const styles = sxStyles({
   companyAvatar: {
      width: 48,
      height: 48,
   },
   userDataSection: {
      overflow: "hidden",
   },
   userName: {
      fontSize: "16px",
      fontWeight: "600",
   },
   fieldOfStudy: {
      fontSize: "14px",
      color: "grey",
   },
   userUniversityDataSection: {
      alignSelf: "center",
   },
   userData: {
      fontSize: "16px",
   },
})

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

type Props = {
   applicant: UserDataEntry
}
const DesktopApplicantItem: FC<Props> = ({ applicant }) => {
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
      <>
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
                     applicantsTooltip.userFullName.visible ? userFullName : ""
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
      </>
   )
}

export default DesktopApplicantItem
