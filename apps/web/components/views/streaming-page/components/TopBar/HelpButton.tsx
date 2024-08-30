import { useAppDispatch } from "components/custom-hook/store"
import { useStreamIsMobile } from "components/custom-hook/streaming"
import { HelpCircle } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { sxStyles } from "types/commonTypes"
import { BrandedTooltip } from "../BrandedTooltip"
import { ResponsiveStreamButton } from "../Buttons"
import { CircularButton } from "./CircularButton"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const HelpButton = () => {
   const isMobile = useStreamIsMobile()

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.HELP))
   }

   if (isMobile) {
      return (
         <>
            <BrandedTooltip title="Help" placement="bottom">
               <CircularButton onClick={handleClick} color="primary">
                  <HelpCircle />
               </CircularButton>
            </BrandedTooltip>
         </>
      )
   }
   return (
      <>
         <ResponsiveStreamButton
            sx={styles.root}
            variant="outlined"
            onClick={handleClick}
            startIcon={<HelpCircle />}
         >
            Help
         </ResponsiveStreamButton>
      </>
   )
}
