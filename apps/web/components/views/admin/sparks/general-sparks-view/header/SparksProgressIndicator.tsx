import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { Upload } from "react-feather"
import CreateSparkButton from "../../components/CreateSparkButton"
import React, { FC, useCallback, useMemo } from "react"
import useGroupSparks from "../../../../../custom-hook/spark/useGroupSparks"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"
import { useRouter } from "next/router"

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

type CreatorWithSparksNumber = {
   creatorId: string
   numberOfSparks: number
   progress?: number
}

const SparksProgressIndicator = () => {
   const { push } = useRouter()
   const { groupPresenter } = useGroup()
   const { data: publicSparks } = useGroupSparks(groupPresenter.id, {
      isPublished: true,
      limit: groupPresenter.getMaxPublicSparks(),
   })

   const creatorsToValidate = useMemo(() => {
      // to get the number of public sparks per creator
      const creatorsWithSparks = publicSparks.reduce<CreatorWithSparksNumber[]>(
         (acc, spark) => {
            const existingCreatorIndex = acc.findIndex(
               ({ creatorId }) => creatorId === spark.creator.id
            )

            if (existingCreatorIndex >= 0) {
               acc[existingCreatorIndex] = {
                  ...acc[existingCreatorIndex],
                  numberOfSparks: acc[existingCreatorIndex]?.numberOfSparks + 1,
               }
            } else {
               acc.push({
                  creatorId: spark.creator.id,
                  numberOfSparks: 1,
               })
            }

            return acc
         },
         []
      )

      const sortedCreatorsWithSparks = creatorsWithSparks.sort(
         (a, b) => b.numberOfSparks - a.numberOfSparks
      )

      // In case there are less than 3 creators, add an empty object for the missing elements
      while (
         sortedCreatorsWithSparks.length <
         SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS
      ) {
         sortedCreatorsWithSparks.push({
            creatorId: "",
            numberOfSparks: 0,
         })
      }

      // To get only the minimum creators need to publish sparks from the sorted array
      // Add the progress percentage to each element of the array
      return sortedCreatorsWithSparks
         .slice(0, SPARK_CONSTANTS.MINIMUM_CREATORS_TO_PUBLISH_SPARKS)
         .map((creatorWithSparks) => {
            const progress =
               creatorWithSparks.numberOfSparks >
               SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS
                  ? 100
                  : Math.floor(
                       (creatorWithSparks.numberOfSparks /
                          SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS) *
                          100
                    )

            return {
               ...creatorWithSparks,
               progress,
            }
         })
   }, [publicSparks])

   const companyPageProgress = useMemo(() => {
      return groupPresenter.getCompanyPageInitialProgress()
   }, [groupPresenter])

   const handleCompanyPageProgressClick = useCallback(() => {
      void push(`/group/${groupPresenter.id}/admin/page`)
   }, [groupPresenter.id, push])

   return (
      <Box sx={styles.root}>
         <Stack spacing={2} sx={styles.info}>
            <Typography variant={"h4"} fontWeight={"bold"}>
               Your Sparks are not published yet!
            </Typography>
            <Typography variant={"body1"} fontSize={16}>
               Almost there! Providing your talent community with valuable
               insights into your company requires some initial content.
               Remember, hidden Sparks don't count!
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

            {creatorsToValidate.map((creatorWithSparks, index) => (
               <CreatorProgressIndicator
                  key={index}
                  creatorWithSparks={creatorWithSparks}
                  index={index + 1}
               />
            ))}
         </Stack>
      </Box>
   )
}

type CreatorProgressIndicatorProps = {
   creatorWithSparks: CreatorWithSparksNumber
   index: number
}

const CreatorProgressIndicator: FC<CreatorProgressIndicatorProps> = ({
   creatorWithSparks,
   index,
}) => {
   const currentValue = useMemo(
      () =>
         creatorWithSparks.numberOfSparks >
         SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS
            ? SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS
            : creatorWithSparks.numberOfSparks,
      [creatorWithSparks.numberOfSparks]
   )

   const isValid = useMemo(
      () =>
         creatorWithSparks.numberOfSparks >=
         SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS,
      [creatorWithSparks.numberOfSparks]
   )

   return (
      <ProgressIndicator
         id={creatorWithSparks.creatorId}
         message={`Creator ${index + 1}`}
         progress={creatorWithSparks.progress}
         isValid={isValid}
         currentValue={currentValue}
         maxValue={SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS}
      />
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
      () => Boolean(!currentValue || !maxValue),
      [currentValue, maxValue]
   )

   return (
      <Stack
         key={id}
         spacing={1}
         sx={[styles.singleProgress, Boolean(onClick) && styles.clickable]}
         onClick={Boolean(onClick) ? onClick : null}
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
