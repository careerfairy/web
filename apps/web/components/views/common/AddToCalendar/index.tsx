import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   createCalendarEvent,
   makeUrls,
} from "@careerfairy/shared-lib/utils/utils"
import {
   Avatar,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
} from "@mui/material"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { memo, useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import {
   appleIcon,
   googleIcon,
   outlookBlueIcon,
   outlookYellowIcon,
   yahooIcon,
} from "../../../../constants/svgs"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { errorLogAndNotify } from "../../../../util/CommonUtil"

const styles = sxStyles({
   avatar: {
      borderRadius: 0,
      width: (theme) => theme.spacing(3),
      height: (theme) => theme.spacing(3),
      "& img": {
         objectFit: "contain",
      },
   },
})

const LinkMenuItem = ({ children, filename = false, href, ...rest }) => (
   <MenuItem
      download={filename}
      href={href}
      dense
      target="_blank"
      rel="noopener noreferrer"
      component="a"
      {...rest}
   >
      {children}
   </MenuItem>
)

const Dropdown = ({ filename, handleClose, anchorEl, urls, onItemClick }) => {
   return (
      <Menu
         id="add to calendar menu"
         anchorEl={anchorEl}
         open={Boolean(anchorEl)}
         onClose={handleClose}
      >
         <LinkMenuItem
            onClick={onItemClick}
            download={filename}
            href={urls.ics}
         >
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={appleIcon} />
            </ListItemIcon>
            <ListItemText primary="Apple Calendar" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.google} onClick={onItemClick}>
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={googleIcon} />
            </ListItemIcon>
            <ListItemText primary="Google" />
         </LinkMenuItem>
         <LinkMenuItem
            href={urls.ics}
            download={filename}
            onClick={onItemClick}
         >
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={outlookYellowIcon} />
            </ListItemIcon>
            <ListItemText primary="Outlook" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.outlook} onClick={onItemClick}>
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={outlookBlueIcon} />
            </ListItemIcon>
            <ListItemText primary="Outlook Web App" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.yahoo} onClick={onItemClick}>
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={yahooIcon} />
            </ListItemIcon>
            <ListItemText primary="Yahoo" />
         </LinkMenuItem>
      </Menu>
   )
}

type Props = {
   children: (handler: (event: any) => void) => void
   event: LivestreamEvent
   filename: string
   /**
    *
    * Action to take when clicking on a menu item of the calendar dropdown.
    */
   onCalendarClick?: () => void
}

export const AddToCalendar = memo(function AddToCalendar({
   children,
   event,
   filename = "download",
   onCalendarClick,
}: Props) {
   const [anchorEl, setAnchorEl] = useState(null)

   const urls = useMemo(() => {
      const overrideBaseUrl = getBaseUrl()
      try {
         return makeUrls(
            createCalendarEvent(
               event,
               {
                  medium: "add-to-calendar-register-confirmation",
               },
               {
                  overrideBaseUrl,
               }
            ),
            errorLogAndNotify
         )
      } catch (error) {
         return {
            google: "#",
            outlook: "#",
            yahoo: "#",
            ics: "#",
         }
      }
   }, [event])

   const handleClick = useCallback((event) => {
      dataLayerEvent("event_add_to_calendar")
      setAnchorEl(event.currentTarget)
   }, [])

   const handleClose = useCallback(() => {
      setAnchorEl(null)
   }, [])

   const handleItemClick = useCallback(() => {
      handleClose()
      onCalendarClick && onCalendarClick()
   }, [onCalendarClick, handleClose])

   return (
      <>
         {children(handleClick)}
         <Dropdown
            filename={filename}
            anchorEl={anchorEl}
            handleClose={handleClose}
            urls={urls}
            onItemClick={handleItemClick}
         />
      </>
   )
})
