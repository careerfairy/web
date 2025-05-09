import DownloadIcon from "@mui/icons-material/CloudDownloadOutlined"
import { LoadingButton } from "@mui/lab"
import { Button, Grid, ListItem, Stack } from "@mui/material"
import Link from "components/views/common/Link"
import { FC } from "react"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import { UserDataEntry } from "../../../common/table/UserLivestreamDataTable"
import { useDownloadCV } from "../../../common/table/hooks"
import DesktopApplicantItem from "./DesktopApplicantItem"
import MobileApplicantItem from "./MobileApplicantItem"

const styles = sxStyles({
   listItem: {
      background: (theme) => theme.brand.white[200],
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
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
      background: "#FAFAFE",
      ml: 2,
   },
})

type Props = {
   applicants: UserDataEntry[]
}

const JobApplicantsList: FC<Props> = ({ applicants }) => {
   return (
      <Stack spacing={2}>
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
                  variant={applicant.linkedInUrl ? "outlined" : "contained"}
                  size="small"
                  color={"grey"}
                  disabled={!applicant.linkedInUrl}
                  sx={styles.linkedInBtn}
               >
                  LinkedIn
               </Button>

               <LoadingButton
                  disabled={!applicant.resumeUrl}
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
