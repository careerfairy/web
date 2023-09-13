import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import { useGroup } from "../../../../../../layouts/GroupDashboardLayout"
import { Upload } from "react-feather"
import CreateSparkButton from "../../components/CreateSparkButton"
import React, { FC, useMemo } from "react"
import useGroupSparks from "../../../../../custom-hook/spark/useGroupSparks"
import { SPARK_CONSTANTS } from "@careerfairy/shared-lib/sparks/constants"

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
      alignItems: "center",
      justifyContent: { xs: "space-evenly", md: "flex-end" },
      mt: { xs: 4, md: "unset" },
   },
   singleProgress: {
      alignItems: "center",
   },
   creator: {
      color: (theme) => theme.palette.grey.A700,
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
})

type CreatorWithSparksNumber = {
   creatorId: string
   numberOfSparks: number
   progress?: number
}

const SparksProgressIndicator = () => {
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
         <Stack spacing={8} direction={"row"} sx={styles.progress}>
            {creatorsToValidate.map((creatorWithSparks, index) => (
               <ProgressIndicator
                  key={index}
                  creatorWithSparks={creatorWithSparks}
                  index={index + 1}
               />
            ))}
         </Stack>
      </Box>
   )
}

export default SparksProgressIndicator

type ProgressIndicator = {
   creatorWithSparks: CreatorWithSparksNumber
   index: number
}
const ProgressIndicator: FC<ProgressIndicator> = ({
   creatorWithSparks,
   index,
}) => {
   const numberOfSparks = useMemo(
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
      <Stack
         spacing={1}
         sx={styles.singleProgress}
         key={creatorWithSparks.creatorId}
      >
         <Box sx={styles.circularProgress}>
            <CircularProgress
               variant="determinate"
               value={creatorWithSparks.progress}
               size={60}
               thickness={4}
               sx={styles.circle}
               color={isValid ? "primary" : "secondary"}
            />
            <Box sx={styles.percentageValue}>
               <Typography variant="body1" color="text.primary">
                  {creatorWithSparks.progress}%
               </Typography>
            </Box>
         </Box>
         <Typography variant={"h4"} fontWeight={"bold"}>
            {numberOfSparks}/
            {SPARK_CONSTANTS.MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS}
         </Typography>
         <Typography variant={"h6"} sx={styles.creator}>
            Creator {index}
         </Typography>
      </Stack>
   )
}
