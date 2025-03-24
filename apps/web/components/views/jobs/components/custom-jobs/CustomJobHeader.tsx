import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { useRouter } from "next/router"
import { FC } from "react"
import { Briefcase, Edit, Zap } from "react-feather"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { sxStyles } from "../../../../../types/commonTypes"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"

const styles = sxStyles({
   header: {
      display: "flex",
      backgroundColor: (theme) => theme.brand.white[400],
      borderRadius: "8px",
      padding: "12px",
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
   },
   headerCompanyLink: {
      cursor: "pointer",
   },
   jobTitle: {
      fontWeight: 700,
      wordBreak: "break-word",
      color: (t) => t.palette.neutral[800],
   },
   groupName: {
      fontWeight: 600,
      wordBreak: "break-word",
      color: (t) => t.palette.neutral[800],
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
      color: (t) => t.palette.neutral[500],
      fontSize: "12px",
   },
   detailsValue: {
      display: "inline",
      "& svg": {
         verticalAlign: "bottom",
         mr: "6px !important",
      },
   },
   skeletonDetailsValue: {
      display: "flex",
      alignItems: "center",
   },
   logoSkeleton: {
      borderRadius: 4,
   },
})

type Props = {
   job: CustomJob | PublicCustomJob
   companyName: string
   companyLogoUrl: string
   editMode?: boolean
   handleClick?: () => void
}

const CustomJobHeader = ({
   job,
   companyName,
   companyLogoUrl,
   editMode,
   handleClick,
}: Props) => {
   const isMobile = useIsMobile()
   const { push } = useRouter()

   const businessFunctionTags = (job.businessFunctionsTagIds || [])
      .map((tagId) => TagValuesLookup[tagId])
      .join(", ")

   return (
      <>
         {isMobile && editMode ? (
            <Box sx={styles.mobileEditBtnSection}>
               <Button
                  variant={"outlined"}
                  startIcon={<Edit size="18" color="#A0A0A0" />}
                  color={"grey"}
                  sx={styles.editButton}
                  fullWidth
                  onClick={handleClick}
               >
                  Edit job posting
               </Button>
            </Box>
         ) : null}

         <Box sx={styles.header}>
            <Box sx={styles.headerLeftSide}>
               <Box sx={styles.headerContent}>
                  {companyLogoUrl && companyName ? (
                     <Stack
                        direction={"row"}
                        alignItems={"center"}
                        spacing={1}
                        mb={"8px"}
                        sx={styles.headerCompanyLink}
                        onClick={() => {
                           push(
                              makeGroupCompanyPageUrl(companyName, {
                                 interactionSource:
                                    InteractionSources.Job_Header,
                              })
                           )
                        }}
                     >
                        <CircularLogo
                           src={getResizedUrl(companyLogoUrl, "lg")}
                           alt={`company ${companyName} logo`}
                           size={44}
                        />
                        <Typography
                           variant={isMobile ? "small" : "medium"}
                           sx={styles.groupName}
                        >
                           {companyName}
                        </Typography>
                     </Stack>
                  ) : null}
                  <Typography variant={"brandedH3"} sx={styles.jobTitle}>
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

                        {businessFunctionTags ? (
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.details}
                           >
                              <Zap width={14} />
                              {businessFunctionTags}
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
                              {businessFunctionTags ? (
                                 <>
                                    <Zap width={14} />
                                    {businessFunctionTags}
                                 </>
                              ) : null}
                           </Stack>
                        </Typography>
                     </Box>
                  )}
               </Box>
            </Box>

            {isMobile || !editMode ? null : (
               <Box>
                  <Button
                     variant={"outlined"}
                     startIcon={<Edit size="18" color="#A0A0A0" />}
                     color={"grey"}
                     sx={styles.editButton}
                     fullWidth
                     onClick={handleClick}
                  >
                     Edit job posting
                  </Button>
               </Box>
            )}
         </Box>
      </>
   )
}

export const JobHeaderSkeleton: FC = () => {
   return (
      <Box sx={styles.header}>
         <Box sx={styles.headerLeftSide}>
            <Skeleton
               sx={styles.logoSkeleton}
               variant={"rectangular"}
               width={63}
               height={63}
            />
            <Box sx={styles.headerContent}>
               <Typography variant={"h4"} sx={styles.jobTitle}>
                  <Skeleton width={300} />
               </Typography>

               <Box sx={styles.detailsWrapper}>
                  <Typography variant={"subtitle1"} sx={styles.details}>
                     <Stack
                        direction={"row"}
                        spacing={2}
                        sx={styles.skeletonDetailsValue}
                     >
                        <Skeleton
                           sx={styles.logoSkeleton}
                           variant={"rectangular"}
                           width={14}
                           height={14}
                        />
                        <Skeleton width={100} />
                        <Skeleton
                           sx={styles.logoSkeleton}
                           variant={"rectangular"}
                           width={14}
                           height={14}
                        />
                        <Skeleton width={100} />
                     </Stack>
                  </Typography>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default CustomJobHeader
