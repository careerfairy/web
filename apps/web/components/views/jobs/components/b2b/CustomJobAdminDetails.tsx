import { CustomJob } from "@careerfairy/shared-lib/groups/customJobs"
import React, { FC } from "react"
import { Avatar, Box, Button, Stack } from "@mui/material"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import Typography from "@mui/material/Typography"
import { sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import { Briefcase, Edit } from "react-feather"
import SanitizedHTML from "../../../../util/SanitizedHTML"
import useIsMobile from "../../../../custom-hook/useIsMobile"

const styles = sxStyles({
   wrapper: {
      p: 3,
   },
   header: {
      display: "flex",
   },
   headerLeftSide: {
      display: "flex",
      width: "100%",
      alignItems: "center",
   },
   headerContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
      ml: 3,
   },
   jobName: {
      fontWeight: "bold",
   },
   jobType: {
      color: "#8B8B8B",
      fontSize: "14px",
      ml: 0.5,
   },
   subTitle: {
      fontSize: "20px",
      fontWeight: "bold",
   },
   jobValues: {
      fontSize: "16px",
   },
   userMessage: {
      fontSize: "16px",
      fontWeight: "bold",
   },
   content: {
      mt: 4,
   },
   companyAvatar: {
      width: 63,
      height: 63,
      background: (theme) => theme.palette.common.white,
      boxShadow: (theme) => theme.shadows[2],
   },
   description: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "27px",
   },
   editButton: {
      textTransform: "none",
      color: "#A0A0A0",
      width: "max-content",
   },
   mobileEditBtnSection: {
      mb: 3,
      display: "flex",
      justifyContent: "center",
   },
})

type Props = {
   job: CustomJob
   handleEdit: () => void
   companyName: string
   companyLogoUrl: string
}
const CustomJobAdminDetails: FC<Props> = ({
   job,
   handleEdit,
   companyName,
   companyLogoUrl,
}) => {
   const isMobile = useIsMobile()
   const jobDeadline = job.deadline
      ? DateUtil.formatDateToString(job.deadline.toDate())
      : ""

   return (
      <Box sx={styles.wrapper}>
         {isMobile ? (
            <Box sx={styles.mobileEditBtnSection}>
               <Button
                  variant={"outlined"}
                  startIcon={<Edit size="18" color="#A0A0A0" />}
                  color={"grey"}
                  sx={styles.editButton}
                  fullWidth
                  onClick={handleEdit}
               >
                  Edit job posting
               </Button>
            </Box>
         ) : null}

         <Box sx={styles.header}>
            <Box sx={styles.headerLeftSide}>
               <Avatar
                  sx={styles.companyAvatar}
                  alt={`company ${companyName} avatar`}
                  src={getResizedUrl(companyLogoUrl, "xs")}
               />

               <Box sx={styles.headerContent}>
                  <Typography variant={"h4"} sx={styles.jobName}>
                     {job.title}
                  </Typography>
                  {Boolean(job.jobType) ? (
                     <Box sx={{ display: "flex" }}>
                        <Briefcase width={11} color={"#7A7A8E"} />
                        <Typography variant={"subtitle1"} sx={styles.jobType}>
                           {job.jobType}
                        </Typography>
                     </Box>
                  ) : null}
               </Box>
            </Box>
            {isMobile ? null : (
               <Box>
                  <Button
                     variant={"outlined"}
                     startIcon={<Edit size="18" color="#A0A0A0" />}
                     color={"grey"}
                     sx={styles.editButton}
                     fullWidth
                     onClick={handleEdit}
                  >
                     Edit job posting
                  </Button>
               </Box>
            )}
         </Box>

         <Box sx={styles.content}>
            <Stack spacing={2} sx={{ height: "100%" }}>
               <Box>
                  <Typography variant={"subtitle1"} sx={styles.subTitle}>
                     Job description
                  </Typography>
                  <SanitizedHTML
                     sx={styles.description}
                     htmlString={job.description}
                  />
               </Box>

               {Boolean(job.salary) ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Salary
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {job.salary}
                     </Typography>
                  </Box>
               ) : null}

               {Boolean(jobDeadline) ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Application deadline
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {jobDeadline}
                     </Typography>
                  </Box>
               ) : null}
            </Stack>
         </Box>
      </Box>
   )
}

export default CustomJobAdminDetails
