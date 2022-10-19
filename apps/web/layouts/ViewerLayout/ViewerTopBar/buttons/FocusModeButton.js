import React from "react"
import PropTypes from "prop-types"
import { IconButton, Tooltip } from "@mui/material"
import FocusInactiveIcon from "@mui/icons-material/Fullscreen"
import FocusModeActiveIcon from "@mui/icons-material/FullscreenExit"
import * as actions from "store/actions"
import { useDispatch, useSelector } from "react-redux"
import {
   hasSeenFocusModeActivateKey,
   hasSeenFocusModeDeActivateKey,
} from "../../../../constants/localStorageKeys"
import NewFeatureHint from "../../../../components/util/NewFeatureHint"
import { focusModeEnabledSelector } from "../../../../store/selectors/streamSelectors"
import { dataLayerEvent } from "../../../../util/analyticsUtils"

const FocusModeButton = ({ primary, mobile, audienceDrawerOpen }) => {
   const focusModeEnabled = useSelector(focusModeEnabledSelector)
   const dispatch = useDispatch()
   const toggleFocusMode = () => {
      dispatch(actions.setFocusMode(undefined, mobile))
   }

   return (
      <NewFeatureHint
         onClickConfirm={toggleFocusMode}
         tooltipText={
            focusModeEnabled
               ? "Click again to disable focus mode."
               : "Click here to hide the chat and emotes to focus more on the stream."
         }
         localStorageKey={
            focusModeEnabled
               ? hasSeenFocusModeDeActivateKey
               : hasSeenFocusModeActivateKey
         }
         tooltipTitle="Hint"
         placement="left"
         hide={audienceDrawerOpen}
      >
         <Tooltip
            title={
               focusModeEnabled ? (
                  <>
                     Focus Mode <br /> Press to show emoticons and the chat bar
                  </>
               ) : (
                  <>
                     Focus Mode <br /> Press to hide emoticons and the chat bar
                  </>
               )
            }
         >
            <IconButton
               color={focusModeEnabled || primary ? "primary" : undefined}
               onClick={(e) => {
                  e.stopPropagation()
                  toggleFocusMode()
                  dataLayerEvent("livestream_viewer_toggle_focus_mode")
               }}
               size="large"
            >
               {focusModeEnabled ? (
                  <FocusModeActiveIcon />
               ) : (
                  <FocusInactiveIcon />
               )}
            </IconButton>
         </Tooltip>
      </NewFeatureHint>
   )
}

FocusModeButton.propTypes = {
   primary: PropTypes.bool,
   mobile: PropTypes.bool,
}

export default FocusModeButton
