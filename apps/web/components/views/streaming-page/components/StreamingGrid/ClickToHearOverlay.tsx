import { Backdrop, Button, alpha } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import { Play } from "react-feather"
import { setAutoplayState } from "store/reducers/streamingAppReducer"
import { useAutoplayState } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: (theme) => ({
      borderRadius: "12px",
      color: theme.palette.common.white,
      zIndex: theme.zIndex.appBar + 1,
      position: "absolute",

      "& button": {
         backgroundColor: alpha(theme.palette.common.black, 0.4),
         color: "white",
         "&:hover": {
            backgroundColor: alpha(theme.palette.common.black, 0.8),
            opacity: 1,
            color: "white",
         },
      },
   }),
})

export const ClickToHearOverlay = () => {
   const state = useAutoplayState()
   const dispatch = useAppDispatch()

   const open = state === "failed"

   const handleClick = () => {
      dispatch(setAutoplayState("should-play-again"))
   }

   return (
      <Backdrop sx={styles.root} onClick={handleClick} open={open}>
         <Button size="large" startIcon={<Play />}>
            Click for audio
         </Button>
      </Backdrop>
   )
}
