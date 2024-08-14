import { Skeleton, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { useLivestreamUsersCount } from "components/custom-hook/live-stream/useLivestreamUsersCount"
import { useUserIsRegistered } from "components/custom-hook/live-stream/useUserIsRegistered"
import React, { FC } from "react"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import Link from "../../../../common/Link"
import ActionButtonProvider, {
   ActionButtonContextType,
   useActionButtonContext,
} from "./ActionButtonProvider"
import RegisterButton from "./RegisterButton"
import SignUpToWatchButton from "./SignUpToWatchButton"
import styles from "./Styles"
import WatchNowButton from "./WatchNowButton"

const ActionButton: FC<ActionButtonContextType> = (props) => {
   return (
      <ActionButtonProvider {...props}>
         <ButtonElement />
      </ActionButtonProvider>
   )
}

const ButtonElement: FC = () => {
   const { livestreamPresenter, userEmailFromServer } = useActionButtonContext()

   const { isLoggedIn, userData, isLoggedOut } = useAuth()

   const registered = useUserIsRegistered(livestreamPresenter.id)
   const { count } = useLivestreamUsersCount(
      livestreamPresenter.id,
      "registered"
   )

   const registeredUsersCount = count || 0

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

      return <WatchNowButton />
   }

   if (registered) {
      return <RegisterButton label="You're registered" />
   }

   if (livestreamPresenter.hasNoSpotsLeft(registeredUsersCount)) {
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
   children: React.ReactNode
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

type ActionButtonWrapperProps = {
   isFloating: boolean
   disableMarginTop?: boolean
   isFixedToBottom?: boolean
   children: React.ReactNode
}

export const ActionButtonWrapper: FC<ActionButtonWrapperProps> = ({
   isFloating,
   disableMarginTop,
   isFixedToBottom,
   children,
}) => {
   return (
      <Box
         component="span"
         sx={[
            !isFixedToBottom && styles.btnWrapper,
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
