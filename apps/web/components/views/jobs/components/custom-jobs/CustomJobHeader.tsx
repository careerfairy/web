import { TagValuesLookup } from "@careerfairy/shared-lib/constants/tags"
import {
   CustomJob,
   PublicCustomJob,
} from "@careerfairy/shared-lib/customJobs/customJobs"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material"
import { useCustomJobLocation } from "components/custom-hook/custom-job/useCustomJobLocation"
import useIsMobile from "components/custom-hook/useIsMobile"
import CircularLogo from "components/views/common/logos/CircularLogo"
import { BrandedTooltip } from "components/views/streaming-page/components/BrandedTooltip"
import Link from "next/link"
import { FC, useRef, useState } from "react"
import { Briefcase, Edit, MapPin, Zap } from "react-feather"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { sxStyles } from "../../../../../types/commonTypes"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { CustomJobHeaderActions } from "./CustomJobHeaderActions"

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
      width: "100%",
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
      wordBreak: "break-word",
      color: (t) => t.palette.neutral[600],
      fontWeight: 400,
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
      fontSize: "14px",
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
   tooltipTextWrapper: {
      p: "8px",
      maxWidth: "302px",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
   },
   tooltipText: {
      color: (t) => t.palette.neutral[700],
      fontWeight: 400,
   },
})

type Props = {
   job: CustomJob | PublicCustomJob
   companyName: string
   companyLogoUrl: string
   editMode?: boolean
   handleClick?: () => void
   maxLocationsToShow?: number
   isAdmin?: boolean
}

const CustomJobHeader = ({
   job,
   companyName,
   companyLogoUrl,
   editMode,
   handleClick,
   maxLocationsToShow,
   isAdmin,
}: Props) => {
   const isMobile = useIsMobile()

   const [tooltipOpen, setTooltipOpen] = useState(false)
   const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)

   const {
      locationText: jobLocation,
      othersCount,
      otherLocations,
      workplaceText,
   } = useCustomJobLocation(
      job as CustomJob,
      maxLocationsToShow && {
         maxLocationsToShow: maxLocationsToShow,
      }
   )

   const businessFunctionTags = (job.businessFunctionsTagIds || [])
      .map((tagId) => TagValuesLookup[tagId])
      .join(", ")

   const tooltipText = otherLocations
      ?.map((location) => location.name)
      ?.join(", ")

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
                        justifyContent={"space-between"}
                        width={"100%"}
                     >
                        <Stack
                           direction={"row"}
                           alignItems={"center"}
                           spacing={1}
                           mb={"8px"}
                           sx={styles.headerCompanyLink}
                           component={Link}
                           href={makeGroupCompanyPageUrl(companyName, {
                              interactionSource: InteractionSources.Job_Header,
                           })}
                        >
                           <CircularLogo
                              src={getResizedUrl(companyLogoUrl, "lg")}
                              alt={`company ${companyName} logo`}
                              size={40}
                           />
                           <Typography variant={"small"} sx={styles.groupName}>
                              {companyName}
                           </Typography>
                        </Stack>
                        <CustomJobHeaderActions
                           customJob={job as CustomJob}
                           isAdmin={isAdmin}
                        />
                     </Stack>
                  ) : null}
                  <Typography variant={"brandedH5"} sx={styles.jobTitle}>
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
                        {jobLocation ? (
                           <Typography
                              variant={"subtitle1"}
                              sx={styles.details}
                           >
                              <MapPin width={14} />
                              {jobLocation}
                              {othersCount ? (
                                 <BrandedTooltip
                                    title={
                                       <LocationTooltip
                                          tooltipText={tooltipText}
                                       />
                                    }
                                    open={tooltipOpen}
                                    onClose={undefined}
                                    placement="top"
                                    wrapperStyles={{
                                       display: "inline",
                                    }}
                                 >
                                    <Typography
                                       variant={"xsmall"}
                                       sx={{
                                          cursor: "pointer",
                                       }}
                                       onClick={() => {
                                          setTooltipOpen(true)
                                          if (tooltipTimeoutRef.current)
                                             clearTimeout(
                                                tooltipTimeoutRef.current
                                             )
                                          tooltipTimeoutRef.current =
                                             setTimeout(() => {
                                                setTooltipOpen(false)
                                             }, 4000)
                                       }}
                                    >
                                       {`, +${othersCount}`}
                                    </Typography>
                                 </BrandedTooltip>
                              ) : (
                                 ""
                              )}
                              {workplaceText ? (
                                 <Typography
                                    variant={"subtitle1"}
                                    sx={{
                                       ...styles.details,
                                       display: "inline",
                                       ml: "0px !important",
                                    }}
                                 >
                                    {workplaceText}
                                 </Typography>
                              ) : (
                                 ""
                              )}
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
                              {jobLocation ? (
                                 <Typography
                                    variant={"subtitle1"}
                                    display={"inline"}
                                 >
                                    <MapPin width={14} />
                                    {jobLocation}
                                    {othersCount ? (
                                       <BrandedTooltip
                                          title={
                                             <LocationTooltip
                                                tooltipText={tooltipText}
                                             />
                                          }
                                          placement="top"
                                          wrapperStyles={{
                                             display: "inline",
                                          }}
                                       >
                                          <Typography
                                             variant={"subtitle1"}
                                          >{`, +${othersCount}`}</Typography>
                                       </BrandedTooltip>
                                    ) : null}
                                    {workplaceText ? (
                                       <Typography
                                          variant={"subtitle1"}
                                          sx={{
                                             ...styles.details,
                                             display: "inline",
                                             ml: "0px !important",
                                          }}
                                       >
                                          {workplaceText}
                                       </Typography>
                                    ) : null}
                                 </Typography>
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

const LocationTooltip = ({ tooltipText }: { tooltipText: string }) => {
   return (
      <Box sx={styles.tooltipTextWrapper}>
         <Typography sx={styles.tooltipText} variant={"xsmall"}>
            {tooltipText}
         </Typography>
      </Box>
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
