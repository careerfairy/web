import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import {
   Box,
   BoxProps,
   Chip,
   IconButton,
   IconButtonProps,
   Popover,
   Stack,
   Tooltip,
   Typography,
   alpha,
} from "@mui/material"
import { FC, MouseEvent, useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"

import { SparkEventActions } from "@careerfairy/shared-lib/sparks/telemetry"
import { getHost } from "@careerfairy/shared-lib/utils/urls"
import { Reply } from "@mui/icons-material"
import { useAuth } from "HOCs/AuthProvider"
import useUserSparkLike from "components/custom-hook/spark/useUserSparkLike"
import useDialogStateHandler from "components/custom-hook/useDialogStateHandler"
import useIsMobile from "components/custom-hook/useIsMobile"
import useMenuState from "components/custom-hook/useMenuState"
import {
   SocialPlatformObject,
   SocialPlatformType,
} from "components/custom-hook/useSocials"
import LikeIcon from "components/views/common/icons/LikeIcon"
import { useSparksFeedTracker } from "context/spark/SparksFeedTrackerProvider"
import { sparkService } from "data/firebase/SparksService"
import { Filter as FilterIcon } from "react-feather"
import { useSelector } from "react-redux"
import {
   currentSparkIdSelector,
   selectedSparkCategoriesSelector,
} from "store/selectors/sparksFeedSelectors"
import Link from "../common/Link"
import LoginButton from "../common/LoginButton"
import LikeActiveIcon from "../common/icons/LikeActiveIcon"
import CircularLogo from "../common/logos/CircularLogo"
import SparksShareDialog from "../sparks/components/SparksShareDialog"
import SparksFilterDialog from "../sparks/components/spark-card/SparkFilterDialog"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"

const actionWidth = 48
const fullScreenActionWidth = 40
export const FEED_CARD_ACTIONS_CLASS_NAME = "FeedCardActions-root"

const styles = sxStyles({
   hidden: {
      visibility: "hidden",
   },
   root: {
      alignItems: "center",
      ml: 1,
      mr: 0.5,
   },
   actionRoot: {
      color: "#5C5C5C",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
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
      "& svg": {
         width: "24px",
         height: "24px",
      },
   },
   defaultLiked: {
      "& svg": {
         width: "24px",
         height: "24px",
      },
   },
   actionLikedFullScreen: {
      "& .MuiIconButton-root": {
         background: "none",
      },
      "& svg": {
         width: "24px",
         height: "24px",
      },
   },
   fullScreenActionRoot: {
      color: "white",
   },
   actionBtn: {
      background: "#DEDEDE",
      "& svg": {
         color: "inherit",
      },
   },
   actionBtnSize: {
      width: actionWidth,
      height: actionWidth,
   },
   actionBtnSizeFullScreen: {
      width: fullScreenActionWidth,
      height: fullScreenActionWidth,
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
      fontSize: "14px",
      lineHeight: "117.5%",
      letterSpacing: "-0.437px",
      textAlign: "center",
      mt: 1.25,
   },
   fullScreenActionLabel: {
      color: "white",
      mt: 1,
   },
   loginBtn: {
      color: (theme) => `${theme.palette.primary.main} !important`,
   },
   icon: {
      width: "24px",
      height: "24px",
   },
   shareIcon: {
      width: "24px",
      height: "24px",
      transform: "rotateY(180deg)",
   },
   actionFilter: {
      "& svg": {
         fill: "currentcolor",
         transform: "rotateY(180deg)",
         width: "24px",
         height: "24px",
      },
   },
   actionTooltip: {
      fontSize: "12px",
      color: (theme) => theme.palette.neutral[700],
      p: 1,
      fontWeight: 400,
   },
})

type ActionType = "company" | "like" | "share" | "filter"

type Props = {
   spark: Spark | SparkPresenter
   hide?: boolean
   linkToCompanyPage: string
   hideActions?: ActionType[]
   shareUtmMedium: ShareActionProps["utmMedium"]
}

const DEFAULT_HIDE_ACTIONS: ActionType[] = []

const FeedCardActions: FC<Props> = ({
   spark,
   hide,
   linkToCompanyPage,
   hideActions = DEFAULT_HIDE_ACTIONS,
   shareUtmMedium,
}) => {
   return (
      <Stack
         spacing={3}
         sx={[styles.root, hide && styles.hidden]}
         className={FEED_CARD_ACTIONS_CLASS_NAME}
      >
         {!hideActions.includes("company") && (
            <CompanyPageAction
               sparkId={spark.id}
               href={linkToCompanyPage}
               companyLogoUrl={spark.group.logoUrl}
            />
         )}
         {!hideActions.includes("like") && <LikeAction sparkId={spark.id} />}
         {!hideActions.includes("share") && (
            <ShareAction sparkId={spark.id} utmMedium={shareUtmMedium} />
         )}
         {!hideActions.includes("filter") && (
            <FilterAction sparkId={spark.id} />
         )}
      </Stack>
   )
}

type ActionProps = {
   icon: React.ReactNode
   onClick?: IconButtonProps<"a">["onClick"]
   href?: string
   hrefTarget?: string
   label?: string
   sparkId: string
   chipValue?: number
   sx?: BoxProps["sx"]
   disabled?: boolean
   actionId: string
   tooltip?: string
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
   actionId,
   tooltip,
}) => {
   const isFullScreen = useSparksFeedIsFullScreen()
   const actionLabel = label ? (
      <Typography
         sx={[styles.actionLabel, isFullScreen && styles.fullScreenActionLabel]}
      >
         {label}
      </Typography>
   ) : null

   const showChip = useMemo(
      () => (chipValue ? chipValue > 0 : false),
      [chipValue]
   )

   const IconButtonComponent = (
      <IconButton
         id={`action-button-${actionId}-${sparkId}`}
         sx={[
            styles.actionBtn,
            isFullScreen && styles.fullScreenActionBtn,
            isFullScreen ? null : styles.actionBtnSize,
         ]}
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
   )

   return (
      <Box
         htmlFor={`action-button-${actionId}-${sparkId}`}
         component={isFullScreen ? undefined : "label"}
         sx={[
            styles.actionRoot,
            isFullScreen && styles.fullScreenActionRoot,
            ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
         ]}
         width={isFullScreen ? fullScreenActionWidth : actionWidth}
      >
         {tooltip ? (
            <Tooltip
               title={
                  <Typography sx={styles.actionTooltip}>{tooltip}</Typography>
               }
               placement="top"
            >
               {IconButtonComponent}
            </Tooltip>
         ) : (
            IconButtonComponent
         )}

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
            actionId={liked ? "Liked" : "Like"}
            sparkId={sparkId}
            icon={liked && isFullScreen ? <LikeActiveIcon /> : <LikeIcon />}
            onClick={handleClicked}
            label={liked ? "Liked" : "Like"}
            disabled={isLoading}
            sx={[
               liked && styles.actionLiked,
               styles.defaultLiked,
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

const CompanyPageAction: FC<{
   sparkId: string
   href: string
   companyLogoUrl: string
}> = ({ sparkId, href, companyLogoUrl }) => {
   const { trackEvent } = useSparksFeedTracker()
   const isFullScreen = useSparksFeedIsFullScreen()
   const handleCompanyPageClick = useCallback(() => {
      trackEvent(SparkEventActions.Click_CompanyPageCTA)
   }, [trackEvent])

   return (
      <Action
         actionId="companyPageAction"
         href={href}
         hrefTarget="_blank"
         sparkId={sparkId}
         icon={
            <CircularLogo
               src={companyLogoUrl}
               alt={"companyName"}
               size={isFullScreen ? 40 : 48}
               sx={{ border: isFullScreen ? "1.5px solid white" : "none" }}
            />
         }
         onClick={handleCompanyPageClick}
         tooltip="Visit company page"
      />
   )
}

type ShareActionProps = {
   sparkId: string
   utmMedium: "sparks-referrals" | "sparks-referrals-levels"
}

const ShareAction: FC<ShareActionProps> = ({ sparkId, utmMedium }) => {
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
      }&invite=${sparkId}&utm_medium=${utmMedium}&utm_campaign=sparks`
   }, [sparkId, userData?.referralCode, utmMedium])

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

            // if an authenticated user shared a spark we want to track it
            if (userData?.id) {
               sparkService.handleShareSpark(userData.id, sparkId)
            }
         }
      },
      [clickedComponents, sparkId, trackEvent, userData?.id]
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
            actionId="Share"
            sparkId={sparkId}
            icon={<Reply sx={styles.shareIcon} />}
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
            actionId="Filter"
            sparkId={sparkId}
            icon={<FilterIcon width={"24px"} height={"24px"} />}
            onClick={handleOpenFilterDialog}
            label="Filter"
            chipValue={selectedSparkCategories.length}
            sx={styles.actionFilter}
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
