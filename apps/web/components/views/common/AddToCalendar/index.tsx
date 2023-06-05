import React, { memo, useCallback, useMemo, useState } from "react"
import {
   Avatar,
   ListItemIcon,
   ListItemText,
   Menu,
   MenuItem,
} from "@mui/material"
import { makeUrls } from "../../../../util/makeUrls"
import {
   appleIcon,
   googleIcon,
   outlookBlueIcon,
   outlookYellowIcon,
   yahooIcon,
} from "../../../../constants/svgs"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { buildExternalDialogLink } from "../../livestream-dialog"

const styles = {
   avatar: {
      borderRadius: 0,
      width: (theme) => theme.spacing(3),
      height: (theme) => theme.spacing(3),
      "& img": {
         objectFit: "contain",
      },
   },
}

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

const Dropdown = ({ filename, handleClose, anchorEl, urls }) => {
   return (
      <Menu
         id="add to calendar menu"
         anchorEl={anchorEl}
         open={Boolean(anchorEl)}
         onClose={handleClose}
      >
         <LinkMenuItem
            onClick={handleClose}
            download={filename}
            href={urls.ics}
         >
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={appleIcon} />
            </ListItemIcon>
            <ListItemText primary="Apple Calendar" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.google} onClick={handleClose}>
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={googleIcon} />
            </ListItemIcon>
            <ListItemText primary="Google" />
         </LinkMenuItem>
         <LinkMenuItem
            href={urls.ics}
            download={filename}
            onClick={handleClose}
         >
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={outlookYellowIcon} />
            </ListItemIcon>
            <ListItemText primary="Outlook" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.outlook} onClick={handleClose}>
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={outlookBlueIcon} />
            </ListItemIcon>
            <ListItemText primary="Outlook Web App" />
         </LinkMenuItem>
         <LinkMenuItem href={urls.yahoo} onClick={handleClose}>
            <ListItemIcon>
               <Avatar sx={styles.avatar} src={yahooIcon} />
            </ListItemIcon>
            <ListItemText primary="Yahoo" />
         </LinkMenuItem>
      </Menu>
   )
}

type EventProps = {
   name: string
   details: string
   location: string
   startsAt: string
   endsAt: string
}

type Props = {
   children: (handler: (event: any) => void) => void
   event: LivestreamEvent
   filename: string
}

export const createCalendarEvent = (
   livestream: LivestreamEvent
): EventProps => {
   if (!livestream) return null

   const time = livestream.start?.toDate?.() || null
   const linkToStream = buildExternalDialogLink({
      type: "livestreamDetails",
      livestreamId: livestream.id,
      targetPage: "/portal",
   })

   return {
      name: livestream.title,
      details: `Here is your Link: ${linkToStream}`,
      location: "Hosted virtually on CareerFairy (link in the description)",
      startsAt: new Date(time).toISOString(),
      endsAt: new Date(
         new Date(time).getTime() + (livestream.duration || 45) * 60 * 1000
      ).toISOString(),
   }
}

export const AddToCalendar = memo(function AddToCalendar({
   children,
   event,
   filename = "download",
}: Props) {
   const [anchorEl, setAnchorEl] = useState(null)

   const urls = useMemo(() => makeUrls(createCalendarEvent(event)), [event])

   const handleClick = useCallback((event) => {
      dataLayerEvent("event_add_to_calendar")
      setAnchorEl(event.currentTarget)
   }, [])

   const handleClose = useCallback(() => {
      setAnchorEl(null)
   }, [])

   return (
      <>
         {children(handleClick)}
         <Dropdown
            filename={filename}
            anchorEl={anchorEl}
            handleClose={handleClose}
            urls={urls}
         />
      </>
   )
})
