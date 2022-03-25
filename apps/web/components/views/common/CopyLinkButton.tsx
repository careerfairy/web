import PropTypes from "prop-types"
import React, { useEffect, useState } from "react"
import { Button, FormControl, Tooltip } from "@mui/material"
import FileCopyIcon from "@mui/icons-material/FileCopy"
import { useCopyToClipboard } from "react-use"

const CopyLinkButton = ({ linkUrl }) => {
   const [copiedFromButton, setCopiedFromButton] = useState(false)
   const [_, copyToClipboard] = useCopyToClipboard()

   const copyFromButton = () => {
      copyToClipboard(linkUrl)
      setCopiedFromButton(true)
   }

   useEffect(() => {
      if (copiedFromButton) {
         setTimeout(() => {
            setCopiedFromButton(false)
         }, 2000)
      }
   }, [copiedFromButton])

   return (
      <FormControl variant="outlined">
         <Tooltip
            title="Copied!"
            placement="top"
            open={copiedFromButton}
            enterDelay={500}
            PopperProps={{
               disablePortal: true,
            }}
            leaveDelay={200}
            disableFocusListener
            disableHoverListener
            disableTouchListener
         >
            <Button
               color="primary"
               variant="outlined"
               startIcon={<FileCopyIcon />}
               onClick={copyFromButton}
            >
               Copy Link
            </Button>
         </Tooltip>
      </FormControl>
   )
}

CopyLinkButton.propTypes = {
   linkUrl: PropTypes.string.isRequired,
}

export default CopyLinkButton
