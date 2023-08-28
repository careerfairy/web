import { FC } from "react"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { sxStyles } from "types/commonTypes"

import { Box, IconButton, Stack, Typography } from "@mui/material"

import LikesIcon from "components/views/common/icons/LikesIcon"
import ShareIcon from "components/views/common/icons/ShareIcon"
import GlobeIcon from "components/views/common/icons/GlobeIcon"
import FilterIcon from "components/views/common/icons/FilterIcon"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"

const actionWidth = 52

const styles = sxStyles({
   root: {
      alignItems: "center",
   },
   actionRoot: {
      color: "#5C5C5C",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: actionWidth,
   },
   fullScreenActionRoot: {
      color: "white",
   },
   actionBtn: {
      width: actionWidth,
      height: actionWidth,
      background: "#DEDEDE",
      "& svg": {
         color: "inherit",
      },
      mb: 1.25,
   },
   fullScreenActionBtn: {
      background: "none",
      alignItems: "center",
      flexDirection: "column",
      mb: 0,
   },
   actionLabel: {
      color: "#5C5C5C",
      fontSize: "1.142rem",
      lineHeight: "117.5%",
      letterSpacing: "-0.437px",
      textAlign: "center",
   },
   fullScreenActionLabel: {
      color: "white",
      mt: 0.5,
   },
})

type Props = {
   spark: Spark | SparkPresenter
}

const FeedCardActions: FC<Props> = ({ spark }) => {
   return (
      <Stack spacing={3} sx={styles.root}>
         <Action
            sparkId={spark.id}
            icon={<LikesIcon />}
            onClick={() => {}}
            label="Like"
         />
         <Action
            sparkId={spark.id}
            icon={<ShareIcon />}
            onClick={() => {}}
            label="Share"
         />
         <Action
            sparkId={spark.id}
            icon={<GlobeIcon />}
            onClick={() => {}}
            label="Cereer Page"
         />
         <Action
            sparkId={spark.id}
            icon={<FilterIcon />}
            onClick={() => {}}
            label="Filter"
         />
      </Stack>
   )
}

type ActionProps = {
   icon: React.ReactNode
   onClick: () => void
   label: string
   sparkId: string
}
const Action: FC<ActionProps> = ({ icon, onClick, label, sparkId }) => {
   const isFullScreen = useSparksFeedIsFullScreen()

   const actionLabel = (
      <Typography
         sx={[styles.actionLabel, isFullScreen && styles.fullScreenActionLabel]}
      >
         {label}
      </Typography>
   )

   return (
      <Box
         htmlFor={`action-button-${label}-${sparkId}`}
         component="label"
         sx={[styles.actionRoot, isFullScreen && styles.fullScreenActionRoot]}
      >
         <IconButton
            id={`action-button-${label}-${sparkId}`}
            sx={[styles.actionBtn, isFullScreen && styles.fullScreenActionBtn]}
            color="inherit"
            onClick={onClick}
            size={isFullScreen ? "small" : "medium"}
         >
            {icon}

            {isFullScreen ? actionLabel : null}
         </IconButton>
         {isFullScreen ? null : actionLabel}
      </Box>
   )
}

export default FeedCardActions
