import { Box, Grid, Tooltip, Typography } from "@mui/material"
import { getResizedUrl } from "../../../../../../helperFunctions/HelperFunctions"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import { sxStyles } from "../../../../../../../types/commonTypes"
import ColorizedAvatar from "../../../../../common/ColorizedAvatar"

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
   isUserFullNameVisible: boolean
   isUserUniversityCountryVisible: boolean
   isUserUniversityNameVisible: boolean
   isUserFieldOfStudyVisible: boolean
}

type Props = {
   applicant: UserDataEntry
}
const DesktopApplicantItem: FC<Props> = ({ applicant }) => {
   const userFullNameRef = useRef(null)
   const userFieldOfStudyRef = useRef(null)
   const userUniversityCountryRef = useRef(null)
   const userUniversityNameRef = useRef(null)

   const [applicantsTooltip, setApplicantsTooltip] =
      useState<ApplicantsTooltip>({
         isUserFullNameVisible: false,
         isUserUniversityCountryVisible: false,
         isUserUniversityNameVisible: false,
         isUserFieldOfStudyVisible: false,
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
      // Check if the content of each element overflows its container
      const newApplicantsTooltip: ApplicantsTooltip = {
         isUserFullNameVisible: isOverflowing(userFullNameRef.current),
         isUserFieldOfStudyVisible: isOverflowing(userFieldOfStudyRef.current),
         isUserUniversityCountryVisible: isOverflowing(
            userUniversityCountryRef.current
         ),
         isUserUniversityNameVisible: isOverflowing(
            userUniversityNameRef.current
         ),
      }

      // Update the state with the new visibility information
      setApplicantsTooltip(newApplicantsTooltip)
   }, [])

   return (
      <>
         <Grid item md={3} display={"flex"}>
            <ColorizedAvatar
               sx={styles.companyAvatar}
               firstName={applicant.firstName}
               lastName={applicant.lastName}
               imageUrl={getResizedUrl(applicant.avatar, "xs")}
            />

            <Box ml={2} sx={styles.userDataSection}>
               <Tooltip
                  arrow
                  title={
                     applicantsTooltip.isUserFullNameVisible ? userFullName : ""
                  }
               >
                  <Typography
                     ref={userFullNameRef}
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
                     applicantsTooltip.isUserFieldOfStudyVisible
                        ? fieldOfStudy
                        : ""
                  }
               >
                  <Typography
                     ref={userFieldOfStudyRef}
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
                  applicantsTooltip.isUserUniversityCountryVisible
                     ? userUniversityCountry
                     : ""
               }
            >
               <Typography
                  ref={userUniversityCountryRef}
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
                  applicantsTooltip.isUserUniversityNameVisible
                     ? universityName
                     : ""
               }
            >
               <Typography
                  ref={userUniversityNameRef}
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

// Check if content overflows its container
const isOverflowing = (element: HTMLElement) =>
   element.scrollWidth > element.clientWidth

export default DesktopApplicantItem
