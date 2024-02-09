import { MenuItem, MenuProps, Typography } from "@mui/material"
import {
   PDFIcon,
   ShareScreenIcon,
   VideoIcon,
} from "components/views/common/icons"
import BrandedMenu from "components/views/common/inputs/BrandedMenu"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      "& .MuiPaper-root": {
         overflow: "revert",
         "& ul": {
            overflow: "hidden",
            borderRadius: "inherit",
            "& svg": {
               color: (theme) => theme.palette.primary.main + " !important",
               width: 22,
               height: 22,
            },
         },
         boxShadow: "none",
         filter: "none",
         "&::after": {
            // arrow
            content: "''",
            width: 0,
            height: 0,
            borderLeft: "0.5em solid transparent",
            borderRight: "0.5em solid transparent",
            borderTop: "0.5em solid white",
            position: "absolute",
            bottom: "-0.5em",
            left: "calc(50% - 0.5em)",
            zIndex: 0,
         },
      },
   },
})

const AnchorOrigin: MenuProps["anchorOrigin"] = {
   vertical: "top",
   horizontal: "center",
}

const TransformOrigin: MenuProps["transformOrigin"] = {
   vertical: 140,
   horizontal: "center",
}

export const ShareMenu = forwardRef<HTMLDivElement, MenuProps>((props, ref) => {
   return (
      <>
         <BrandedMenu
            {...props}
            anchorOrigin={AnchorOrigin}
            sx={styles.root}
            transformOrigin={TransformOrigin}
            ref={ref}
         >
            <MenuItem>
               <PDFIcon />
               <Typography variant="medium">Share PDF presentation</Typography>
            </MenuItem>
            <MenuItem>
               <VideoIcon />
               <Typography variant="medium">Share video</Typography>
            </MenuItem>
            <MenuItem>
               <ShareScreenIcon />
               <Typography variant="medium">Share screen</Typography>
            </MenuItem>
         </BrandedMenu>
      </>
   )
})

ShareMenu.displayName = "ShareMenu"
