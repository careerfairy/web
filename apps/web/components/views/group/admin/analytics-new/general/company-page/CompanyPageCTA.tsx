import { Button } from "@mui/material"
import Box from "@mui/material/Box"
import CircularProgress, {
   circularProgressClasses,
   CircularProgressProps,
} from "@mui/material/CircularProgress"
import Skeleton from "@mui/material/Skeleton"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useGroup } from "../../../../../../../layouts/GroupDashboardLayout"
import { sxStyles } from "../../../../../../../types/commonTypes"
import useGroupCompanyPageProgress from "../../../../../../custom-hook/useGroupCompanyPageProgress"
import useIsMobile from "../../../../../../custom-hook/useIsMobile"
import { BulletPoints } from "../../../../../common/BulletPoints"
import Link from "../../../../../common/Link"
import CardCustom, { SubheaderLink } from "../../../common/CardCustom"

const progressCircleSize = 130

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
      height: progressCircleSize / 2,
      width: progressCircleSize,
      overflow: "hidden",
   },
   wrapperInner: {
      display: "block",
      transformOrigin: "top left",
      transform: "rotate(-90deg) translate(-100%)",
      marginTp: "-50%",
      position: "relative",
      width: progressCircleSize / 2,
      height: progressCircleSize,
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
      right: progressCircleSize * 0.5,
      left: progressCircleSize * -0.5,
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
      right: progressCircleSize / 3,
   },
   percentText: {
      transform: "rotate(90deg)",
      fontWeight: "bold",
      fontSize: `calc(${progressCircleSize}px * 0.2)`,
   },
   ctaLinkSkeleton: {
      width: "55%",
   },
   bullets: {
      m: 0,
   },
   circleSkeleton: {
      borderRadius: `${progressCircleSize}px ${progressCircleSize}px 0 0`,
   },
   linkButton: {
      mt: 2,
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

   const companyPageLink = `/group/${group.id}/admin/page`

   const message = pageReady
      ? "Company profile completeness"
      : "Create your company page to:"

   const ctaLink =
      isMobile && !pageReady ? (
         <Button
            sx={styles.linkButton}
            component={Link}
            href={companyPageLink}
            variant="contained"
            color={"secondary"}
            size={"small"}
         >
            Go to company page
         </Button>
      ) : (
         <Box fontWeight={"400"}>
            <SubheaderLink title="Go to company page" link={companyPageLink} />
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
               spacing={2}
               alignItems={"center"}
               direction={isMobile ? "column-reverse" : "row"}
            >
               <Stack mt={1} mr={isMobile ? "auto" : "auto"} flex={1}>
                  <Typography gutterBottom fontWeight={"500"} variant={"h5"}>
                     {message}
                  </Typography>
                  {pageReady ? ctaLink : null}
               </Stack>
               <HalfProgress value={props.progress.percentage} />
            </Stack>
         }
      >
         <Stack>
            {pageReady ? null : (
               <BulletPoints sx={styles.bullets} points={points} />
            )}
            {pageReady ? null : <Box ml={isMobile ? 0 : "auto"}>{ctaLink}</Box>}
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
               spacing={2}
               alignItems={"center"}
               direction={isMobile ? "column-reverse" : "row"}
            >
               <Stack width={"100%"} mt={1} flex={1}>
                  <Typography flex={1} fontWeight={"500"} variant={"h4"}>
                     <Skeleton variant={"text"} width={"100%"} />
                  </Typography>
                  {isMobile ? null : skeletonCtaLink}
               </Stack>
               <Skeleton
                  variant="rectangular"
                  sx={styles.circleSkeleton}
                  width={progressCircleSize}
                  height={progressCircleSize / 2}
               />
            </Stack>
         }
      >
         {isMobile ? (
            <Box display={"flex"} justifyContent={"flex-start"}>
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
            size={progressCircleSize}
            value={50}
         />
         <CircularProgress
            sx={[styles.circle, styles.progressCircle]}
            size={progressCircleSize}
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
               <Box
                  component={"span"}
                  fontSize={`calc(${progressCircleSize}px * 0.1)`}
               >
                  %
               </Box>
            </Typography>
         </Box>
         <Box sx={styles.whiteCover} />
      </Box>
   </Box>
)
export default CompanyPageCTA
