import { FC, useCallback, useMemo, useState } from "react"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { sxStyles } from "types/commonTypes"

import { Box, Chip, IconButton, Stack, Typography } from "@mui/material"

import LikesIcon from "components/views/common/icons/LikesIcon"
import ShareIcon from "components/views/common/icons/ShareIcon"
import GlobeIcon from "components/views/common/icons/GlobeIcon"
import FilterIcon from "components/views/common/icons/FilterIcon"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"
import SparksShareDialog from "../sparks/components/SparksShareDialog"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useAuth } from "HOCs/AuthProvider"
import SparksFilterDialog from "../sparks/components/spark-card/SparkFilterDialog"
import { useSelector } from "react-redux"
import { selectedSparkCategoriesSelector } from "store/selectors/sparksFeedSelectors"
import useSparkEventTracker from "components/custom-hook/spark/useSparkEventTracker"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/analytics"

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
      position: "relative",
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
   buttonChip: {
      position: "absolute",
      right: { xs: -5, md: -8 },
      top: { xs: -8, md: -2 },
      fontSize: { xs: "10px", md: "14px" },
   },
   buttonChip1: {
      "& .MuiChip-label": { px: "10px" },
   },
   labelContainer: {
      height: "20px",
      width: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
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
         <ShareAction sparkId={spark.id} />
         <Action
            sparkId={spark.id}
            icon={<GlobeIcon />}
            onClick={() => {}}
            label="Career Page"
         />
         <FilterAction sparkId={spark.id} />
      </Stack>
   )
}

type ActionProps = {
   icon: React.ReactNode
   onClick: () => void
   label: string
   sparkId: string
   chipValue?: number
}
const Action: FC<ActionProps> = ({
   icon,
   onClick,
   label,
   sparkId,
   chipValue,
}) => {
   const isFullScreen = useSparksFeedIsFullScreen()

   const actionLabel = (
      <Typography
         sx={[styles.actionLabel, isFullScreen && styles.fullScreenActionLabel]}
      >
         {label}
      </Typography>
   )

   const showChip = useMemo(
      () => (chipValue ? chipValue > 0 : false),
      [chipValue]
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
         {showChip ? (
            <Chip
               sx={[styles.buttonChip, chipValue == 1 && styles.buttonChip1]}
               color={"primary"}
               label={chipValue}
               size={"small"}
            ></Chip>
         ) : null}
         {isFullScreen ? null : actionLabel}
      </Box>
   )
}

type ShareActionProps = {
   sparkId: string
}
const ShareAction: FC<ShareActionProps> = ({ sparkId }) => {
   const [isShareDialogOpen, handleOpenShareDialog, handleCloseShareDialog] =
      useDialogStateHandler()
   const isMobile = useIsMobile()
   const { userData } = useAuth()

   const { trackEvent } = useSparkEventTracker()

   const shareUrl = useMemo(() => {
      return `${getHost()}/sparks/${sparkId}?referral=${
         userData?.referralCode
      }&invite=${sparkId}&utm_medium=Sparks_referrals&utm_campaign=Sparks`
   }, [sparkId, userData?.referralCode])

   const shareData = useMemo(() => {
      return {
         title: "CareerFairy",
         text: "Check out this Spark on CareerFairy!",
         url: shareUrl,
      }
   }, [shareUrl])

   const handleTrackShare = useCallback(() => {
      trackEvent(SparkEventActions.Share, sparkId)
   }, [sparkId, trackEvent])

   const handleShare = useCallback(async () => {
      if (isMobile && navigator?.share) {
         await navigator.share(shareData).then(() => handleTrackShare())
      } else {
         handleOpenShareDialog()
      }
   }, [handleOpenShareDialog, handleTrackShare, isMobile, shareData])

   return (
      <>
         <Action
            sparkId={sparkId}
            icon={<ShareIcon />}
            onClick={handleShare}
            label="Share"
         />
         <SparksShareDialog
            isOpen={isShareDialogOpen}
            handleClose={handleCloseShareDialog}
            shareUrl={shareUrl}
            onShareOptionClick={handleTrackShare}
         />
      </>
   )
}

type FilterActionProps = {
   sparkId: string
}
const FilterAction: FC<FilterActionProps> = ({ sparkId }) => {
   const [isFilterDialogOpen, handleOpenFilterDialog, handleCloseFilterDialog] =
      useDialogStateHandler()
   const selectedSparkCategories = useSelector(selectedSparkCategoriesSelector)

   return (
      <>
         <Action
            sparkId={sparkId}
            icon={<FilterIcon />}
            onClick={handleOpenFilterDialog}
            label="Filter"
            chipValue={selectedSparkCategories.length}
         />
         <SparksFilterDialog
            isOpen={isFilterDialogOpen}
            handleClose={handleCloseFilterDialog}
            selectedCategoryIds={selectedSparkCategories}
         />
      </>
   )
}

export default FeedCardActions
