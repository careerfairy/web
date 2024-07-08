import { sxStyles } from "types/commonTypes"
import { ResponsiveStreamButton } from "../Buttons"

import { useAppDispatch } from "components/custom-hook/store"
import { useMemo } from "react"
import { Eye } from "react-feather"
import { ActiveViews, setActiveView } from "store/reducers/streamingAppReducer"
import {
   useCurrentViewCount,
   useFailedToConnectToRTM,
} from "store/selectors/streamingAppSelectors"
import { useRTMChannel } from "../../context/rtm"
import { useChannelMembers } from "../../context/rtm/hooks/useChannelMembers"

const styles = sxStyles({
   root: {
      border: (theme) => `1px solid ${theme.brand.black[400]}`,
   },
})

export const ViewCount = () => {
   const viewCount = useCurrentViewCount()
   const failedToConnectToRTM = useFailedToConnectToRTM()

   const rtmChannel = useRTMChannel()
   /* This hook needs to be here so the members validations run now, not only when opening the panel  */
   const { members } = useChannelMembers(rtmChannel)

   const dispatch = useAppDispatch()

   const handleClick = () => {
      dispatch(setActiveView(ActiveViews.VIEWERS))
   }

   const count = useMemo(
      () => (failedToConnectToRTM ? viewCount : members?.length || 0),
      [failedToConnectToRTM, viewCount, members?.length]
   )

   return (
      <ResponsiveStreamButton
         sx={styles.root}
         onClick={handleClick}
         variant="outlined"
         startIcon={<Eye />}
      >
         {count}
      </ResponsiveStreamButton>
   )
}
