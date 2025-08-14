import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { FC, useCallback, useMemo } from "react"
import { Upload } from "react-feather"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { sxStyles } from "../../../../../../types/commonTypes"
import useGroupCreators from "../../../../../custom-hook/creator/useGroupCreators"
import useGroupSparks from "../../../../../custom-hook/spark/useGroupSparks"
import CreateSparkButton from "../../components/CreateSparkButton"

const styles = sxStyles({
   root: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      bgcolor: "#F8F5FF",
      p: 3,
      borderRadius: 4,
      border: "1px solid #E0D9FF",
   },
   info: {
      maxWidth: { xs: "unset", md: "50%" },
   },
   progress: {
      width: "100%",
      alignSelf: "center",
      justifyContent: { xs: "space-evenly", md: "flex-end" },
      mt: { xs: 4, md: "unset" },
   },
   singleProgress: {
      alignItems: "center",
      maxWidth: "120px",
   },
   message: {
      color: (theme) => theme.palette.grey.A700,
      textAlign: "center",
   },
   onlyMessage: {
      height: "100%",
      display: "flex",
      alignItems: "center",
   },
   circle: {
      borderRadius: "60%",
      boxShadow: "inset 0 0 0 6px #C9C0DE",
   },
   circularProgress: {
      position: "relative",
      display: "inline-flex",
   },
   percentageValue: {
      top: 3,
      left: 3,
      bottom: 0,
      right: 0,
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   createBtn: {
      width: { xs: "100%", md: "fit-content" },
   },
   clickable: {
      cursor: "pointer",
   },
})

const SparksProgressIndicator = () => {
   const { push } = useRouter()
   const { groupPresenter } = useGroup()
   const { data: publicSparks } = useGroupSparks(groupPresenter.id, {
      isPublished: true,
      limit: groupPresenter.getMaxPublicSparks(),
   })

   const { data: creators } = useGroupCreators(groupPresenter.id)

   // Ensure at least that there is a creator associated with the published sparks (in case the creator is deleted)
   const numberOfPublishedSparksWithCreators = publicSparks.filter((spark) =>
      creators.some((creator) => creator.id === spark.creator.id)
   ).length

   const minTotalPublishedSparksToMakeGroupSparksPublic =
      groupPresenter.getMinimumTotalPublishedSparksToMakeGroupSparksPublic()

   const companyPageProgress = useMemo(() => {
      return groupPresenter.getCompanyPageInitialProgress()
   }, [groupPresenter])

   const handleCompanyPageProgressClick = useCallback(() => {
      void push(`/group/${groupPresenter.id}/admin/page`)
   }, [groupPresenter.id, push])

   const calculateProgressPercentage = () => {
      // If no minimum required, return 0%
      if (minTotalPublishedSparksToMakeGroupSparksPublic === 0) {
         return 0
      }

      // Calculate how many sparks we have (capped at the minimum required)
      const actualPublishedSparks = Math.min(
         numberOfPublishedSparksWithCreators,
         minTotalPublishedSparksToMakeGroupSparksPublic
      )

      // Calculate percentage and round to nearest whole number
      const percentage =
         (actualPublishedSparks /
            minTotalPublishedSparksToMakeGroupSparksPublic) *
         100
      return Math.round(percentage)
   }

   return (
      <Box sx={styles.root}>
         <Stack spacing={2} sx={styles.info}>
            <Typography variant={"h4"} fontWeight={"bold"}>
               Your Sparks are not published yet!
            </Typography>
            <Typography variant={"body1"} fontSize={16}>
               Almost there! Providing your talent community with valuable
               insights into your company requires some initial content.
               Remember, hidden Sparks don&apos;t count!
            </Typography>
            <CreateSparkButton
               startIcon={<Upload size={18} />}
               sx={styles.createBtn}
            >
               Upload a new Spark
            </CreateSparkButton>
         </Stack>
         <Stack
            spacing={{ xs: 3, md: 8 }}
            direction={"row"}
            sx={styles.progress}
         >
            <ProgressIndicator
               id={groupPresenter.id}
               message={"Publish company page"}
               progress={companyPageProgress}
               isValid={groupPresenter.publicProfile}
               onClick={handleCompanyPageProgressClick}
            />
            <ProgressIndicator
               id={groupPresenter.id}
               message={"Sparks published"}
               progress={calculateProgressPercentage()}
               isValid={
                  numberOfPublishedSparksWithCreators >=
                  minTotalPublishedSparksToMakeGroupSparksPublic
               }
               currentValue={Math.min(
                  // Cap the max value to the minimum required
                  numberOfPublishedSparksWithCreators,
                  minTotalPublishedSparksToMakeGroupSparksPublic
               )}
               maxValue={minTotalPublishedSparksToMakeGroupSparksPublic}
            />
         </Stack>
      </Box>
   )
}

type ProgressIndicatorProps = {
   id: string
   message: string
   progress: number
   isValid: boolean
   currentValue?: number
   maxValue?: number
   onClick?: () => void
}
const ProgressIndicator: FC<ProgressIndicatorProps> = ({
   id,
   message,
   progress,
   isValid,
   currentValue,
   maxValue,
   onClick,
}) => {
   const showOnlyMessage = useMemo(
      () => Boolean(!currentValue && !maxValue),
      [currentValue, maxValue]
   )

   return (
      <Stack
         key={id}
         spacing={1}
         sx={[styles.singleProgress, Boolean(onClick) && styles.clickable]}
         onClick={onClick}
      >
         <Box sx={styles.circularProgress}>
            <CircularProgress
               variant="determinate"
               value={progress}
               size={60}
               thickness={4}
               sx={styles.circle}
               color={isValid ? "primary" : "secondary"}
            />
            <Box sx={styles.percentageValue}>
               <Typography variant="body1" color="text.primary">
                  {progress}%
               </Typography>
            </Box>
         </Box>
         {showOnlyMessage ? null : (
            <Typography variant={"h4"} fontWeight={"bold"}>
               {currentValue}/{maxValue}
            </Typography>
         )}

         <Typography
            variant={"body1"}
            sx={[styles.message, showOnlyMessage && styles.onlyMessage]}
         >
            {message}
         </Typography>
      </Stack>
   )
}

export default SparksProgressIndicator
