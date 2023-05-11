import React, { FC, useState } from "react"
import {
   Button,
   Skeleton,
   Tooltip,
   tooltipClasses,
   Typography,
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import { useAuth } from "../../../../../HOCs/AuthProvider"
import { LivestreamPresenter } from "@careerfairy/shared-lib/livestreams/LivestreamPresenter"
import { useRouter } from "next/router"
import Link from "../../../common/Link"
import useSnackbarNotifications from "../../../../custom-hook/useSnackbarNotifications"
import { rewardService } from "../../../../../data/firebase/RewardService"
import LoadingButton from "@mui/lab/LoadingButton"
import CareerCoinIcon from "../../../common/CareerCoinIcon"
import { getBuyCostForAction } from "@careerfairy/shared-lib/rewards"
import { sxStyles } from "../../../../../types/commonTypes"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Box from "@mui/material/Box"
import { useCreditsDialog } from "../../../../../layouts/CreditsDialogLayout"

const styles = sxStyles({
   btn: {
      maxWidth: 572,
      boxShadow: "none",
      "&:disabled": {
         backgroundColor: "#E8E8E8",
         color: "#999999",
      },
      textTransform: "none",
   },
   blackText: {
      color: "text.primary",
   },
   whiteText: {
      color: "info.main",
   },
   subButtonText: {
      textAlign: "center",
      marginTop: 2,
      display: "flex",
      justifyContent: "center",
   },
   link: {
      textDecoration: "underline",
      color: "info.main",
   },
   toolTip: {
      [`& .${tooltipClasses.tooltip}`]: {
         backgroundColor: "white",
         color: "rgba(0, 0, 0, 0.87)",
         fontSize: "0.92rem",
         px: 1,
         py: 1.5,
         borderRadius: 2,
         boxShadow: (theme) => theme.boxShadows.dark_8_25_10,
      },
      [`& .${tooltipClasses.arrow}`]: {
         color: "white",
      },
   },
   notEnoughCreditsButton: {
      // bgcolor: "#1D3D4F",
      // color: "#D5F6F1",
   },
})

type Props = {
   onRegisterClick: (fromFooterButton?: boolean) => void
   livestreamPresenter: LivestreamPresenter
   userEmailFromServer?: string
}

const RegisterComponent: FC<Props> = ({
   onRegisterClick,
   livestreamPresenter,
   userEmailFromServer,
}) => {
   const { authenticatedUser, isLoggedIn, userData } = useAuth()

   const registered = livestreamPresenter.isUserRegistered(
      authenticatedUser.email
   )
   const registerButton = (label: string, toolTip?: string) => (
      <RegisterButton
         onClick={onRegisterClick}
         disabled={livestreamPresenter.isRegistrationDisabled(
            authenticatedUser.email
         )}
         registered={registered}
         label={label}
         toolTip={toolTip}
      />
   )

   if (livestreamPresenter.isPast()) {
      if (livestreamPresenter.denyRecordingAccess) {
         return registerButton(
            registered ? "You attended this event" : "Recording Not Available",
            registered ? undefined : denyRecordingText
         )
      }

      // we know from the server side data the user is signed in
      // but we're still loading the user on the client side
      if (userEmailFromServer && (!isLoggedIn || !userData)) {
         return (
            <Skeleton
               sx={[styles.btn]}
               variant="text"
               animation="wave"
               height={60}
            />
         )
      }

      if (!isLoggedIn) {
         return <SignUpToWatchButton />
      }

      if (!userData?.credits) {
         return <NotEnoughCreditsButton />
      }

      return <BuyRecordingButton livestreamId={livestreamPresenter.id} />
   }

   if (registered) {
      return registerButton("You're booked")
   }

   if (livestreamPresenter.hasNoSpotsLeft()) {
      return registerButton("No spots left")
   }

   if (authenticatedUser) {
      return registerButton("Attend Event")
   }

   return registerButton("Join to attend")
}

type RegisterButtonProps = {
   disabled: boolean
   onClick: () => void
   registered: boolean
   label: string
   toolTip?: string
}
const RegisterButton: FC<RegisterButtonProps> = ({
   disabled,
   onClick,
   registered,
   label,
   toolTip,
}) => {
   // Must use controlled open state for Tooltip to work with disabled button
   const [open, setOpen] = useState(false)
   const buttonDisabled = disabled || registered

   const handleClose = () => {
      setOpen(false)
   }

   const handleOpen = () => {
      toolTip && setOpen(true)
   }

   return (
      <Box
         onMouseEnter={() => buttonDisabled && handleOpen()}
         onMouseLeave={() => buttonDisabled && handleClose()}
         component="span"
         width="100%"
         maxWidth={572}
      >
         <Button
            id="register-button"
            color={registered ? "secondary" : "primary"}
            variant={"contained"}
            sx={[styles.blackText, styles.btn]}
            fullWidth
            startIcon={registered ? <CheckIcon /> : null}
            endIcon={
               toolTip ? (
                  <Tooltip
                     PopperProps={{
                        // @ts-ignore
                        sx: styles.toolTip,
                     }}
                     arrow
                     open={open}
                     leaveDelay={1500}
                     onClose={handleClose}
                     onOpen={handleOpen}
                     title={toolTip || ""}
                     placement="top"
                  >
                     <InfoOutlinedIcon />
                  </Tooltip>
               ) : null
            }
            disabled={buttonDisabled}
            onClick={onClick}
            disableElevation
            data-testid="livestream-registration-button"
            size="large"
         >
            {label}
         </Button>
      </Box>
   )
}

const SignUpToWatchButton = () => {
   const { asPath } = useRouter()

   return (
      <>
         <Button
            id="register-button"
            color="primary"
            sx={styles.btn}
            variant={"contained"}
            fullWidth
            href={`/signup?absolutePath=${asPath}`}
            component={Link}
            disableElevation
            data-testid="livestream-registration-button"
            size="large"
         >
            Sign Up to Watch
         </Button>
         <Typography sx={{ textAlign: "center", marginTop: 2 }}>
            Already have an account?{" "}
            <Link color="text.primary" href={`/login?absolutePath=${asPath}`}>
               Log In
            </Link>
         </Typography>
      </>
   )
}

const BuyRecordingButton = ({ livestreamId }: { livestreamId: string }) => {
   const { userData } = useAuth()
   const [isLoading, setIsLoading] = useState(false)
   const { errorNotification } = useSnackbarNotifications()

   const handleClick = () => {
      setIsLoading(true)
      rewardService
         .buyRecordingAccess(livestreamId)
         .catch(errorNotification)
         .finally(() => setIsLoading(false))
   }

   return (
      <>
         <LoadingButton
            id="register-button"
            color="primary"
            sx={[styles.whiteText, styles.btn]}
            variant={"contained"}
            fullWidth
            onClick={handleClick}
            disableElevation
            loading={isLoading}
            data-testid="livestream-registration-button"
            size="large"
            endIcon={isLoading ? undefined : <CareerCoinIcon />}
         >
            Unlock with &nbsp;{" "}
            {getBuyCostForAction("LIVESTREAM_RECORDING_BOUGHT")}
         </LoadingButton>
         <Typography sx={styles.subButtonText}>
            You have {userData.credits} <CareerCoinIcon /> Left
         </Typography>
      </>
   )
}

const NotEnoughCreditsButton = () => {
   const { handleOpenCreditsDialog } = useCreditsDialog()
   const handleClick = (e: React.SyntheticEvent) => {
      e.preventDefault()

      handleOpenCreditsDialog()
   }

   return (
      <>
         <Button
            id="register-button"
            variant={"contained"}
            fullWidth
            color="navyBlue"
            sx={styles.btn}
            onClick={handleClick}
            disableElevation
            data-testid="livestream-registration-button"
            size="large"
         >
            Not enough CareerCoins to unlock
         </Button>
         <Typography mt={2} align="center">
            <Link sx={styles.link} onClick={handleClick} href="#">
               Get more CareerCoins to access this recording
            </Link>
         </Typography>
      </>
   )
}

const denyRecordingText =
   "Unfortunately, the host company does not allow to share the recording of their live stream."

export default RegisterComponent
