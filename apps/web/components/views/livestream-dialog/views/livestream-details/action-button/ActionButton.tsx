import React, { FC } from "react"
import { Skeleton, Typography } from "@mui/material"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import Link from "../../../../common/Link"
import Box from "@mui/material/Box"
import ActionButtonProvider, {
   ActionButtonContextType,
   useActionButtonContext,
} from "./ActionButtonProvider"
import styles from "./Styles"
import SignUpToWatchButton from "./SignUpToWatchButton"
import WatchNowButton from "./WatchNowButton"
import BuyRecordingButton from "./BuyRecordingButton"
import NotEnoughCreditsButton from "./NotEnoughCreditsButton"
import RegisterButton from "./RegisterButton"

const ActionButton: FC<ActionButtonContextType> = (props) => {
   return (
      <ActionButtonProvider {...props}>
         <ButtonElement />
      </ActionButtonProvider>
   )
}

const ButtonElement: FC = () => {
   const { livestreamPresenter, userEmailFromServer, canWatchRecording } =
      useActionButtonContext()

   const { authenticatedUser, isLoggedIn, userData, isLoggedOut } = useAuth()

   const registered = livestreamPresenter.isUserRegistered(
      authenticatedUser.email || userEmailFromServer
   )

   if (livestreamPresenter.isPast()) {
      if (livestreamPresenter.denyRecordingAccess) {
         return (
            <RegisterButton
               label={
                  registered
                     ? "You attended this live stream"
                     : "Recording Not Available"
               }
               toolTip={registered ? undefined : denyRecordingText}
            />
         )
      }

      // we know from the server side data the user is signed in
      // but we're still loading the user on the client side
      if (userEmailFromServer && (!isLoggedIn || !userData)) {
         return <ActionButtonSkeleton />
      }

      if (!isLoggedIn || isLoggedOut) {
         return <SignUpToWatchButton />
      }

      if (!userData?.credits && !canWatchRecording) {
         return <NotEnoughCreditsButton />
      }

      if (canWatchRecording) {
         return <WatchNowButton />
      }

      return <BuyRecordingButton />
   }

   if (registered) {
      return <RegisterButton label="You're registered" />
   }

   if (livestreamPresenter.hasNoSpotsLeft()) {
      return <RegisterButton label="No spots left" />
   }

   if (livestreamPresenter.isLive()) {
      return <RegisterButton label="Join live stream" />
   }

   return <RegisterButton label="Register to live stream" />
}

type LinkTextProps = {
   onClick: (e: React.SyntheticEvent) => void
   isFloating: boolean
}

export const LinkText: FC<LinkTextProps> = ({
   children,
   onClick,
   isFloating,
}) => {
   const { forceDarkSubText } = useActionButtonContext()

   return (
      <Typography
         sx={[
            styles.link,
            (isFloating || forceDarkSubText) && styles.darkLinkColor,
         ]}
         align="center"
      >
         <Link noLinkStyle onClick={onClick} scroll={false} href="#">
            {children}
         </Link>
      </Typography>
   )
}

type FloatingButtonProps = {
   isFloating: boolean
   disableMarginTop?: boolean
}

export const FloatingButtonWrapper: FC<FloatingButtonProps> = ({
   isFloating,
   disableMarginTop,
   children,
}) => {
   return (
      <Box
         component="span"
         sx={[
            styles.btnWrapper,
            isFloating && styles.floatingBtnWrapper,
            disableMarginTop && styles.noMarginTop,
         ]}
      >
         {children}
      </Box>
   )
}

export const ActionButtonSkeleton = () => {
   return (
      <Skeleton
         sx={[styles.actionButtonSkeleton, styles.btnWrapper]}
         variant="rectangular"
         height={56}
      />
   )
}

const denyRecordingText =
   "Unfortunately, the host company does not allow to share the recording of their live stream."

export default ActionButton
