import { FC } from "react"
import BaseDialogView, {
   LeftContent,
   RightContent,
   SubHeaderText,
   TitleText,
} from "../BaseDialogView"
import { useCreditsDialogContext } from "../CreditsDialog"
import { company_building } from "../../../../constants/images"
import Stack from "@mui/material/Stack"
import Chip from "@mui/material/Chip"
import { Box, Typography } from "@mui/material"
import CompleteIcon from "@mui/icons-material/CheckCircleRounded"
import GoToIcon from "@mui/icons-material/NavigateNextRounded"
import CareerCoinIcon from "../../common/CareerCoinIcon"
import { sxStyles } from "../../../../types/commonTypes"
import { useAuth } from "../../../../HOCs/AuthProvider"

const styles = sxStyles({
   congratsChip: {
      color: "text.secondary",
   },
   row: {
      display: "flex",
      alignItems: "center",
   },
})

const GetMoreCreditsView: FC = () => {
   const { handleClose } = useCreditsDialogContext()

   return (
      <BaseDialogView
         handleClose={handleClose}
         leftContent={
            <LeftContent
               backgroundImg={company_building}
               title={
                  <TitleText color="white">
                     Get more{" "}
                     <TitleText color="primary.main">CareerCoins!</TitleText>
                  </TitleText>
               }
               subHeader={
                  <SubHeaderText color="white">
                     Running low on coins? no worries! You can easily win more
                     by interacting with our platform.
                  </SubHeaderText>
               }
            />
         }
         rightContent={
            <RightContent backgroundColor="#FAFAFA">
               <CreditsView />
            </RightContent>
         }
      />
   )
}

const CreditsView = () => {
   const { userStats, userData } = useAuth()

   const {
      handleGoToCVView,
      handleGoToReferFriendView,
      handleGoToNextLivestreams,
   } = useCreditsDialogContext()

   return (
      <Stack flex={1} spacing={3}>
         <CreditItem
            label="Upload your CV"
            onClick={handleGoToCVView}
            completed={Boolean(userData?.userResume)}
            numCredits={1}
         />
         <CreditItem
            label="Attend first live stream"
            onClick={handleGoToNextLivestreams}
            completed={userStats?.totalLivestreamAttendances > 0}
            numCredits={1}
         />
         <CreditItem
            label="Refer to 3 friends"
            onClick={handleGoToReferFriendView}
            completed={userStats?.referralsCount > 2}
            numCredits={3}
         />
      </Stack>
   )
}

type CreditItemProps = {
   label: string
   onClick: () => void
   completed: boolean
   numCredits: number
}

const CreditItem: FC<CreditItemProps> = ({
   numCredits,
   completed,
   label,
   onClick,
}) => {
   return (
      <Stack
         width="100%"
         justifyContent="space-between"
         alignItems="center"
         direction="row"
      >
         <Typography color={completed ? "text.secondary" : "text.primary"}>
            {label}
         </Typography>
         {completed ? (
            <Chip
               label={
                  <Stack spacing={1} direction="row" alignItems="center">
                     <Typography variant="body2" color="text.secondary">
                        Congrats
                     </Typography>
                     <CompleteIcon color="success" />
                  </Stack>
               }
               sx={styles.congratsChip}
            />
         ) : (
            <Chip
               label={
                  <Stack spacing={1.5} direction="row" alignItems="center">
                     <Box alignItems="center" display="flex">
                        <CareerCoinIcon />
                        <Typography variant="body2">+ {numCredits}</Typography>
                     </Box>
                     <GoToIcon />
                  </Stack>
               }
               color="primary"
               onClick={onClick}
            />
         )}
      </Stack>
   )
}

export default GetMoreCreditsView
