import { FC, MouseEvent, useCallback, useMemo, useState } from "react"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

import { sxStyles } from "types/commonTypes"

import {
   Box,
   BoxProps,
   Chip,
   IconButton,
   IconButtonProps,
   Popover,
   Stack,
   Typography,
   alpha,
} from "@mui/material"

import LikeIcon from "components/views/common/icons/LikeIcon"
import ShareIcon from "components/views/common/icons/ShareIcon"
import FilterIcon from "components/views/common/icons/FilterIcon"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"
import SparksShareDialog from "../sparks/components/SparksShareDialog"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import useIsMobile from "components/custom-hook/useIsMobile"
import { useAuth } from "HOCs/AuthProvider"
import SparksFilterDialog from "../sparks/components/spark-card/SparkFilterDialog"
import { useSelector } from "react-redux"
import {
   currentSparkIdSelector,
   selectedSparkCategoriesSelector,
} from "store/selectors/sparksFeedSelectors"
import { SparkEventActions } from "@careerfairy/shared-lib/sparks/analytics"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import Link from "../common/Link"
import {
   SocialPlatformObject,
   SocialPlatformType,
} from "components/custom-hook/useSocials"
import useUserSparkLike from "components/custom-hook/spark/useUserSparkLike"
import useMenuState from "components/custom-hook/useMenuState"
import LoginButton from "../common/LoginButton"
import LikeActiveIcon from "../common/icons/LikeActiveIcon"
import { Work } from "@mui/icons-material"

const actionWidth = 52

const styles = sxStyles({
   hidden: {
      visibility: "hidden",
   },
   root: {
      alignItems: "center",
      width: 52,
   },
   actionRoot: {
      color: "#5C5C5C",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: actionWidth,
      position: "relative",
      transition: (theme) => theme.transitions.create(["color", "background"]),
      "& .MuiIconButton-root": {
         transition: (theme) => theme.transitions.create("background"),
      },
   },
   actionLiked: {
      color: "primary.600",
      "& .MuiIconButton-root": {
         background: (theme) => `${alpha(theme.palette.primary[600], 0.21)}`,
      },
   },
   actionLikedFullScreen: {
      "& .MuiIconButton-root": {
         background: "none",
      },
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
      color: "inherit",
      fontSize: "1.142rem",
      lineHeight: "117.5%",
      letterSpacing: "-0.437px",
      textAlign: "center",
   },
   fullScreenActionLabel: {
      color: "white",
      mt: 0.5,
   },
   loginBtn: {
      color: (theme) => `${theme.palette.primary.main} !important`,
   },
   icon: {
      height: "24px",
      width: "24px",
   },
})

type Props = {
   spark: Spark | SparkPresenter
   hide?: boolean
}

const FeedCardActions: FC<Props> = ({ spark, hide }) => {
   return (
      <Stack spacing={3} sx={[styles.root, hide && styles.hidden]}>
         <LikeAction sparkId={spark.id} />
         {spark.group.careerPageUrl ? (
            <CareerPageAction
               sparkId={spark.id}
               href={spark.group.careerPageUrl}
            />
         ) : null}
         <ShareAction sparkId={spark.id} />
         <FilterAction sparkId={spark.id} />
      </Stack>
   )
}

type ActionProps = {
   icon: React.ReactNode
   onClick?: IconButtonProps<"a">["onClick"]
   href?: string
   hrefTarget?: string
   label: string
   sparkId: string
   chipValue?: number
   sx?: BoxProps["sx"]
   disabled?: boolean
}
const Action: FC<ActionProps> = ({
   icon,
   onClick,
   label,
   sparkId,
   chipValue,
   href,
   hrefTarget,
   sx,
   disabled,
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
         component={isFullScreen ? undefined : "label"}
         sx={[
            styles.actionRoot,
            isFullScreen && styles.fullScreenActionRoot,
            ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
         ]}
      >
         <IconButton
            id={`action-button-${label}-${sparkId}`}
            sx={[styles.actionBtn, isFullScreen && styles.fullScreenActionBtn]}
            color="inherit"
            onClick={(e) => {
               e.stopPropagation()
               onClick(e)
            }}
            disabled={disabled}
            size={isFullScreen ? "small" : "medium"}
            component={href ? Link : "button"}
            href={href}
            target={hrefTarget}
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
            />
         ) : null}
         {isFullScreen ? null : actionLabel}
      </Box>
   )
}

const LikeAction: FC<{
   sparkId: string
}> = ({ sparkId }) => {
   const currentSparkId = useSelector(currentSparkIdSelector)
   const isFullScreen = useSparksFeedIsFullScreen()

   const isCurrentSpark = sparkId && currentSparkId === sparkId

   const { anchorEl, handleClick, handleClose, open } = useMenuState()
   const { authenticatedUser, isLoggedIn } = useAuth()

   const { toggleLike, isLoading, liked } = useUserSparkLike(
      authenticatedUser.email,
      sparkId,
      !isLoggedIn || !isCurrentSpark
   )

   const handleClicked = useCallback(
      (event: MouseEvent<HTMLElement>) => {
         if (!isLoggedIn) {
            handleClick(event)
         } else {
            toggleLike()
         }
      },
      [handleClick, isLoggedIn, toggleLike]
   )

   return (
      <>
         <Action
            sparkId={sparkId}
            icon={liked && isFullScreen ? <LikeActiveIcon /> : <LikeIcon />}
            onClick={handleClicked}
            label={liked ? "Liked" : "Like"}
            disabled={isLoading}
            sx={[
               liked && styles.actionLiked,
               isFullScreen && styles.actionLikedFullScreen,
            ]}
         />
         <Popover
            id="like-login-popover"
            open={open ? !isLoggedIn : false}
            anchorEl={anchorEl}
            onClose={handleClose}
         >
            <Stack spacing={1} sx={{ p: 2 }}>
               <Typography variant="h5">Like this Spark?</Typography>
               <Typography variant="body1">
                  Sign in to make your opinion count.
               </Typography>
               <Box pb={0.5} />
               <LoginButton
                  sx={styles.loginBtn}
                  variant="outlined"
                  fullWidth={false}
                  size="small"
               />
            </Stack>
         </Popover>
      </>
   )
}

const CareerPageAction: FC<{
   sparkId: string
   href: string
}> = ({ sparkId, href }) => {
   const { trackEvent } = useSparksFeedTracker()

   const handleCareerPageClick = useCallback(() => {
      trackEvent(SparkEventActions.Click_CareerPageCTA)
   }, [trackEvent])

   return (
      <Action
         href={href}
         hrefTarget="_blank"
         sparkId={sparkId}
         icon={<Work sx={styles.icon} />}
         onClick={handleCareerPageClick}
         label="Jobs"
      />
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

   const [clickedComponents, setClickedComponents] = useState(
      new Set<SocialPlatformType>()
   )

   const { trackEvent } = useSparksFeedTracker()

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

   const handleTrackShare = useCallback(
      (type: SocialPlatformType) => {
         if (!clickedComponents.has(type)) {
            setClickedComponents((prevState) => new Set([...prevState, type]))

            switch (type) {
               case SocialPlatformObject.Copy:
                  trackEvent(SparkEventActions.Share_Clipboard)
                  break
               case SocialPlatformObject.Facebook:
                  trackEvent(SparkEventActions.Share_Facebook)
                  break
               case SocialPlatformObject.Linkedin:
                  trackEvent(SparkEventActions.Share_LinkedIn)
                  break
               case SocialPlatformObject.Whatsapp:
                  trackEvent(SparkEventActions.Share_WhatsApp)
                  break
               case SocialPlatformObject.X:
                  trackEvent(SparkEventActions.Share_X)
                  break
               default:
                  trackEvent(SparkEventActions.Share_Other)
                  break
            }
         }
      },
      [clickedComponents, trackEvent]
   )

   const handleShare = useCallback(async () => {
      if (isMobile && navigator?.share) {
         await navigator
            .share(shareData)
            .then(() => trackEvent(SparkEventActions.Share_Mobile))
      } else {
         handleOpenShareDialog()
      }
   }, [handleOpenShareDialog, isMobile, shareData, trackEvent])

   const handleClose = useCallback(() => {
      handleCloseShareDialog()
      setClickedComponents(new Set())
   }, [handleCloseShareDialog])

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
            handleClose={handleClose}
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
