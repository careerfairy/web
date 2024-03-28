import { FormEvent, useCallback } from "react"
import { Box, Button } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import { Star } from "react-feather"
import { useDispatch } from "react-redux"
import { openGroupPlansDialog } from "store/reducers/groupPlanReducer"

const styles = sxStyles({
   checkoutButton: {
      mt: 2,
      backgroundColor: (theme) => theme.palette.secondary.main,
      color: "white",
      "&:hover": {
         backgroundColor: (theme) => theme.palette.secondary.dark,
      },
   },
})

type Props = {
   text: string
   icon: React.ReactNode
}

const UpgradeSparksPlanButton = ({ text, icon }: Props) => {
   const dispatch = useDispatch()

   const buttonText = text ? text : "Upgrade Now"

   const handleOpen = useCallback(
      (e: FormEvent) => {
         e.preventDefault()
         dispatch(openGroupPlansDialog())
      },
      [dispatch]
   )

   return (
      <Box>
         <Button
            onClick={handleOpen}
            sx={styles.checkoutButton}
            startIcon={icon || <Star strokeWidth={3} />}
         >
            {buttonText}
         </Button>
      </Box>
   )
}

export default UpgradeSparksPlanButton
