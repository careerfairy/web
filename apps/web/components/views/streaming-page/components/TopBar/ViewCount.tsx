import { sxStyles } from "types/commonTypes"
import { ResponsiveStreamButton } from "../Buttons"

import { useAppDispatch } from "components/custom-hook/store"
import { Eye } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import { useRTMChannel } from "../../context/rtm"
import { useChannelMembers } from "../../context/rtm/hooks/useChannelMembers"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const ViewCount = () => {
   const rtmChannel = useRTMChannel()
   const { members } = useChannelMembers(rtmChannel)

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.VIEWERS))
   }

   return (
      <ResponsiveStreamButton
         sx={styles.root}
         onClick={handleClick}
         variant="outlined"
         startIcon={<Eye />}
      >
         {members?.length}
      </ResponsiveStreamButton>
   )
}
