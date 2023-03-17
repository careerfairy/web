import React from "react"
import CardCustom, { SubheaderLink } from "../../../common/CardCustom"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import CircularProgress, {
   circularProgressClasses,
   CircularProgressProps,
} from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { sxStyles } from "../../../../../../../types/commonTypes"
import Stack from "@mui/material/Stack"
import BulletPoints from "../../../../../common/BulletPoints"
import useGroupCompanyPageProgress from "../../../../../../custom-hook/useGroupCompanyPageProgress"
import Skeleton from "@mui/material/Skeleton"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"

const size = 130

const styles = sxStyles({
   cardRoot: {
      display: "flex",
      flexDirection: "column",
      "& .MuiCardHeader-root": {
         pb: "0px !important",
      },
   },
   cardRootNoContent: {
      "& .MuiCardContent-root": {
         pb: "0px !important",
      },
   },
   progressRoot: {
      height: size / 2,
      width: size,
      overflow: "hidden",
   },
   wrapperInner: {
      display: "block",
      transformOrigin: "top left",
      transform: "rotate(-90deg) translate(-100%)",
      marginTp: "-50%",
      position: "relative",
      width: size / 2,
      height: size,
   },
   backgroundCircle: {
      color: (theme) => theme.palette.tertiary.main,
   },
   progressCircle: {
      [`& .${circularProgressClasses.circle}`]: {
         strokeLinecap: "round",
      },
   },
   circle: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
   },
   whiteCover: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: size * 0.5,
      left: size * -0.5,
      backgroundColor: "background.paper",
   },
   percentDisplayWrapper: {
      top: 0,
      left: 0,
      bottom: 0,
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      right: size / 3,
   },
   percentText: {
      transform: "rotate(90deg)",
      fontWeight: "bold",
      fontSize: `calc(${size}px * 0.2)`,
   },
   ctaLinkSkeleton: {
      width: "55%",
   },
   bullets: {
      m: 0,
   },
})

const points = [
   "Increase visibility of your live streams",
   "Share personal stories of your employees",
   "Attract 2x times more talent",
]

type Props = {
   progress: ReturnType<typeof useGroupCompanyPageProgress>
}
const CompanyPageCTA = (props: Props) => {
   const { group } = useGroup()

   const isMobile = useIsMobile()

   const isLoading = props.progress === null

   const pageReady = Boolean(props.progress?.isReady)

   const message = pageReady
      ? "Company profile completeness"
      : "Create your company page to:"

   const ctaLink = (
      <Box fontWeight={"400"}>
         <SubheaderLink
            title="Go to company page"
            link={`/group/${group.id}/admin/page`}
         />
      </Box>
   )

   if (isLoading) {
      return <LoadingCompanyPageCTA />
   }

   return (
      <CardCustom
         sx={styles.cardRoot}
         disableTypography
         title={
            <Stack
               justifyContent={"space-between"}
               spacing={1}
               direction={"row"}
            >
               <Stack mt={1} flex={1}>
                  <Typography fontWeight={"500"} variant={"h5"}>
                     {message}
                  </Typography>
                  {pageReady && !isMobile ? ctaLink : null}
               </Stack>
               <HalfProgress value={props.progress.percentage} />
            </Stack>
         }
      >
         <Stack>
            {pageReady ? null : (
               <BulletPoints sx={styles.bullets} points={points} />
            )}
            {isMobile ? <Box ml="auto">{ctaLink}</Box> : null}
         </Stack>
      </CardCustom>
   )
}

const LoadingCompanyPageCTA = () => {
   const isMobile = useIsMobile()

   const skeletonCtaLink = (
      <Typography variant={isMobile ? "h3" : "h4"} sx={styles.ctaLinkSkeleton}>
         <Skeleton variant={"text"} />
      </Typography>
   )

   return (
      <CardCustom
         sx={styles.cardRoot}
         title={
            <Stack
               justifyContent={"space-between"}
               spacing={1}
               direction={"row"}
            >
               <Stack mt={1} flex={1}>
                  <Typography flex={1} fontWeight={"500"} variant={"h5"}>
                     <Skeleton variant={"text"} width={"calc(100% - 20px)"} />
                  </Typography>
                  {isMobile ? null : skeletonCtaLink}
               </Stack>
               <Skeleton
                  variant="rectangular"
                  sx={{
                     borderRadius: `${size}px ${size}px 0 0`,
                  }}
                  width={size}
                  height={size / 2}
               />
            </Stack>
         }
      >
         {isMobile ? (
            <Box display={"flex"} justifyContent={"flex-end"}>
               {skeletonCtaLink}
            </Box>
         ) : null}
      </CardCustom>
   )
}

const HalfProgress = (props: CircularProgressProps & { value: number }) => (
   <Box sx={styles.progressRoot}>
      <Box sx={styles.wrapperInner}>
         <CircularProgress
            variant="determinate"
            sx={[styles.backgroundCircle, styles.circle]}
            size={size}
            value={50}
         />
         <CircularProgress
            sx={[styles.circle, styles.progressCircle]}
            size={size}
            variant="determinate"
            {...props}
            value={props.value / 2}
         />
         <Box sx={styles.percentDisplayWrapper}>
            <Typography
               variant="caption"
               component="div"
               sx={styles.percentText}
            >
               {Math.round(props.value)}
               <Box component={"span"} fontSize={`calc(${size}px * 0.1)`}>
                  %
               </Box>
            </Typography>
         </Box>
         <Box sx={styles.whiteCover} />
      </Box>
   </Box>
)
export default CompanyPageCTA
