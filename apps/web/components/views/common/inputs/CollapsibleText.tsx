import { Box, Button, Collapse } from "@mui/material"
import SanitizedHTML from "../../../util/SanitizedHTML"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import { SxProps } from "@mui/system"
import { Theme } from "@mui/material/styles"
import { isHeightOverflowing } from "util/LayoutUtil"

const styles = sxStyles({
   text: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "27px",
   },
   collapseBtn: {
      p: 0,
      mt: 2,
      textTransform: "none",
      fontSize: "16px",
   },
})

type Props = {
   text: string
   textStyle?: SxProps<Theme>
   collapsedSize?: number | string
}

const CollapsibleText = ({ text, textStyle, collapsedSize }: Props) => {
   const [isTextCollapsed, setIsTextCollapsed] = useState(true)
   const [isTextOverflowing, setIsTextOverflowing] = useState(false)
   const textRef = useRef(null)

   useEffect(() => {
      setIsTextOverflowing(isHeightOverflowing(textRef?.current))
   }, [textRef])

   const handleClick = useCallback(() => {
      setIsTextCollapsed((prev) => !prev)
   }, [])

   return (
      <Box>
         <Collapse
            in={!isTextCollapsed}
            ref={textRef}
            collapsedSize={collapsedSize || 75}
         >
            <SanitizedHTML
               sx={textStyle ? textStyle : styles.text}
               htmlString={text}
            />
         </Collapse>
         {isTextOverflowing ? (
            <Box display="flex" justifyContent="start">
               {isTextCollapsed ? (
                  <Button
                     variant="text"
                     color="secondary"
                     sx={styles.collapseBtn}
                     endIcon={<ExpandMoreIcon />}
                     onClick={handleClick}
                  >
                     View more
                  </Button>
               ) : null}

               {!isTextCollapsed && (
                  <Button
                     variant="text"
                     color="secondary"
                     sx={styles.collapseBtn}
                     endIcon={<ExpandLessIcon />}
                     onClick={handleClick}
                  >
                     View less
                  </Button>
               )}
            </Box>
         ) : null}
      </Box>
   )
}

export default CollapsibleText
