import React, { FC, useState } from "react"
import { useActionButtonContext } from "./ActionButtonProvider"
import { useAuth } from "../../../../../../HOCs/AuthProvider"
import useSnackbarNotifications from "../../../../../custom-hook/useSnackbarNotifications"
import { rewardService } from "../../../../../../data/firebase/RewardService"
import LoadingButton from "@mui/lab/LoadingButton"
import styles from "./Styles"
import CareerCoinIcon from "../../../../common/CareerCoinIcon"
import { getBuyCostForAction } from "@careerfairy/shared-lib/rewards"
import { Typography } from "@mui/material"
import { FloatingButtonWrapper } from "./ActionButton"

const BuyRecordingButton: FC = () => {
   const { isFloating, livestreamPresenter } = useActionButtonContext()

   const { userData } = useAuth()
   const [isLoading, setIsLoading] = useState(false)
   const { errorNotification } = useSnackbarNotifications()

   const handleClick = () => {
      setIsLoading(true)
      rewardService
         .buyRecordingAccess(livestreamPresenter.id)
         .catch(errorNotification)
         .finally(() => setIsLoading(false))
   }

   return (
      <FloatingButtonWrapper isFloating={isFloating}>
         <LoadingButton
            id="register-button"
            color="primary"
            sx={[styles.whiteText, styles.btn]}
            variant={"contained"}
            fullWidth
            onClick={handleClick}
            disableElevation
            loading={isLoading}
            data-testid="livestream-unlock-recording-button"
            size="large"
            endIcon={isLoading ? undefined : <CareerCoinIcon />}
         >
            Unlock recording with &nbsp;{" "}
            {getBuyCostForAction("LIVESTREAM_RECORDING_BOUGHT")}
         </LoadingButton>
         <Typography sx={[styles.subButtonText, isFloating && styles.darkText]}>
            You currently have {userData.credits} <CareerCoinIcon /> left
         </Typography>
      </FloatingButtonWrapper>
   )
}

export default BuyRecordingButton
