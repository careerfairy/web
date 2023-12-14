import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import React, { FC } from "react"
import { Box, Grid, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { getResizedUrl } from "../../../../../../helperFunctions/HelperFunctions"
import { universityCountryMap } from "@careerfairy/shared-lib/universities"
import ColorizedAvatar from "../../../../../common/ColorizedAvatar"

const styles = sxStyles({
   wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      m: 1,
      p: 2,
      background: "#FAFAFE",
      borderRadius: "8px",
   },
   companyAvatar: {
      width: 48,
      height: 48,
   },
   userName: {
      fontSize: "16px",
      fontWeight: "600",
      my: 1,
   },
   info: {
      width: "95%",
      background: "#F6F6FA",
      borderRadius: "4px",
   },
   userData: {
      fontSize: "14px",
      p: 1,
      "&:not(:last-child)": {
         borderBottom: "1px solid #EEE",
      },
   },
})

type Props = {
   applicant: UserDataEntry
}
const MobileApplicantItem: FC<Props> = ({ applicant }) => {
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

   return (
      <Grid item xs={12}>
         <Box sx={styles.wrapper}>
            <ColorizedAvatar
               sx={styles.companyAvatar}
               firstName={applicant.firstName}
               lastName={applicant.lastName}
               imageUrl={getResizedUrl(applicant.avatar, "xs")}
            />

            <Typography variant={"body1"} sx={styles.userName}>
               {userFullName}
            </Typography>

            <Box sx={styles.info}>
               <Typography variant={"body1"} sx={styles.userData}>
                  {fieldOfStudy}
               </Typography>

               <Typography variant={"body1"} sx={styles.userData}>
                  {userUniversityCountry}
               </Typography>

               <Typography variant={"body1"} sx={styles.userData}>
                  {universityName}
               </Typography>

               <Typography variant={"body1"} sx={styles.userData}>
                  {levelOfStudy}
               </Typography>
            </Box>
         </Box>
      </Grid>
   )
}

export default MobileApplicantItem
