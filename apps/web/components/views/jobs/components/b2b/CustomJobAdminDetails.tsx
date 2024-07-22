import { CustomJob } from "@careerfairy/shared-lib/customJobs/customJobs"
import { Avatar, Box, Button, Stack } from "@mui/material"
import Typography from "@mui/material/Typography"
import { Briefcase, Edit, Zap } from "react-feather"
import { sxStyles } from "../../../../../types/commonTypes"
import DateUtil from "../../../../../util/DateUtil"
import useIsMobile from "../../../../custom-hook/useIsMobile"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import SanitizedHTML from "../../../../util/SanitizedHTML"

const styles = sxStyles({
   wrapper: {
      p: 2,
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
      fontWeight: 600,
   },
   subTitle: {
      fontSize: "18px",
      fontWeight: 600,
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
   },
   description: {
      fontSize: "16px",
      fontWeight: 400,
      color: (theme) => theme.palette.text.secondary,
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
   detailsWrapper: {
      display: { xs: "flex", md: "inline" },
      flexDirection: "column",
   },
   details: {
      color: "#8B8B8B",
      fontSize: "12px",
   },
   detailsValue: {
      display: "inline",

      "& svg": {
         verticalAlign: "bottom",
         mr: "6px !important",
      },
   },
})

type Props = {
   job: Partial<CustomJob>
   handleEdit?: () => void
   previewMode?: boolean
   companyName: string
   companyLogoUrl: string
}
const CustomJobAdminDetails = ({
   job,
   handleEdit,
   companyName,
   companyLogoUrl,
   previewMode,
}: Props) => {
   const isMobile = useIsMobile()
   const jobDeadline = job.deadline
      ? DateUtil.formatDateToString(job.deadline.toDate())
      : ""

   return (
      <Box sx={styles.wrapper}>
         {isMobile && !previewMode ? (
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

                  {isMobile ? (
                     <Box sx={[styles.detailsWrapper, styles.detailsValue]}>
                        {job.jobType ? (
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.details}
                           >
                              <Briefcase width={14} />
                              {job.jobType}
                           </Typography>
                        ) : null}

                        {job.businessFunctionsTagIds ? (
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.details}
                           >
                              <Zap width={14} />
                              {job.businessFunctionsTagIds.join(", ")}
                           </Typography>
                        ) : null}
                     </Box>
                  ) : (
                     <Box sx={styles.detailsWrapper}>
                        <Typography variant={"subtitle1"} sx={styles.details}>
                           <Stack
                              direction={"row"}
                              spacing={2}
                              sx={styles.detailsValue}
                           >
                              {job.jobType ? (
                                 <>
                                    <Briefcase width={14} />
                                    {job.jobType}
                                 </>
                              ) : null}
                              {job.businessFunctionsTagIds ? (
                                 <>
                                    <Zap width={14} />
                                    {job.businessFunctionsTagIds.join(", ")}
                                 </>
                              ) : null}
                           </Stack>
                        </Typography>
                     </Box>
                  )}
               </Box>
            </Box>

            {isMobile || previewMode ? null : (
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
            <Stack spacing={2}>
               <Box>
                  <Typography variant={"subtitle1"} sx={styles.subTitle}>
                     Job description
                  </Typography>
                  <SanitizedHTML
                     sx={styles.description}
                     htmlString={job.description}
                  />
               </Box>

               {job.salary ? (
                  <Box>
                     <Typography variant={"subtitle1"} sx={styles.subTitle}>
                        Salary
                     </Typography>
                     <Typography variant={"body1"} sx={styles.jobValues}>
                        {job.salary}
                     </Typography>
                  </Box>
               ) : null}

               {jobDeadline ? (
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
