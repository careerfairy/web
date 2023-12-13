import { Button, Grid, ListItem, Stack } from "@mui/material"
import React, { FC } from "react"
import { useDownloadCV } from "../../../common/table/hooks"
import { Link } from "@careerfairy/streaming/components"
import { LoadingButton } from "@mui/lab"
import DownloadIcon from "@mui/icons-material/CloudDownloadOutlined"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import DesktopApplicantItem from "./DesktopApplicantItem"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import MobileApplicantItem from "./MobileApplicantItem"

const styles = sxStyles({
   listItem: {
      background: "white",
      borderRadius: "8px",
      padding: 2,
      height: { md: "80px" },
      alignItems: "center",
   },
   userDataActions: {
      display: "flex",
      justifyContent: { xs: "center", md: "end" },
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

type ApplicationItemProps = {
   applicant: UserDataEntry
}
const ApplicationItem: FC<ApplicationItemProps> = ({ applicant }) => {
   const isMobile = useIsMobile()
   const { handleDownloadCV, downloadingPDF } = useDownloadCV(applicant)

   return (
      <ListItem sx={styles.listItem}>
         <Grid container spacing={{ xs: 2, md: 5 }}>
            {isMobile ? (
               <MobileApplicantItem applicant={applicant} />
            ) : (
               <DesktopApplicantItem applicant={applicant} />
            )}

            <Grid item xs={12} md={3} sx={styles.userDataActions}>
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
                  LinkedIn
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
