import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   createCalendarEvent,
   getLivestreamICSDownloadUrl,
   makeUrls,
} from "@careerfairy/shared-lib/utils/utils"
import { Avatar } from "@mui/material"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { memo, useCallback, useMemo, useState } from "react"
import { sxStyles } from "types/commonTypes"
import { MobileUtils } from "util/mobile.utils"
import {
   appleIcon,
   googleIcon,
   outlookBlueIcon,
   outlookYellowIcon,
   yahooIcon,
} from "../../../../constants/svgs"
import {
   errorLogAndNotify,
   shouldUseEmulators,
} from "../../../../util/CommonUtil"
import { dataLayerEvent } from "../../../../util/analyticsUtils"
import BrandedResponsiveMenu, {
   MenuOption,
} from "../inputs/BrandedResponsiveMenu"

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

const CalendarLink = memo(function CalendarLink({
   children,
   href,
   download,
   ...props
}: {
   children?: React.ReactNode
   href: string
   download?: string
}) {
   return (
      <a
         href={href}
         download={download}
         target="_blank"
         rel="noopener noreferrer"
         {...props}
      >
         {children}
      </a>
   )
})

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

   const handleMobileClick = useCallback(() => {
      window.open(getLivestreamICSDownloadUrl(event.id, shouldUseEmulators()))
   }, [event.id])

   const options: MenuOption[] = useMemo(
      () => [
         {
            label: "Apple Calendar",
            icon: <Avatar sx={styles.avatar} src={appleIcon} />,
            handleClick: handleItemClick,
            wrapperComponent: (props) => (
               <CalendarLink href={urls.ics} download={filename} {...props} />
            ),
         },
         {
            label: "Google",
            icon: <Avatar sx={styles.avatar} src={googleIcon} />,
            handleClick: handleItemClick,
            wrapperComponent: (props) => (
               <CalendarLink href={urls.google} {...props} />
            ),
         },
         {
            label: "Outlook",
            icon: <Avatar sx={styles.avatar} src={outlookYellowIcon} />,
            handleClick: handleItemClick,
            wrapperComponent: (props) => (
               <CalendarLink href={urls.ics} download={filename} {...props} />
            ),
         },
         {
            label: "Outlook Web App",
            icon: <Avatar sx={styles.avatar} src={outlookBlueIcon} />,
            handleClick: handleItemClick,
            wrapperComponent: (props) => (
               <CalendarLink href={urls.outlook} {...props} />
            ),
         },
         {
            label: "Yahoo",
            icon: <Avatar sx={styles.avatar} src={yahooIcon} />,
            handleClick: handleItemClick,
            wrapperComponent: (props) => (
               <CalendarLink href={urls.yahoo} {...props} />
            ),
         },
      ],
      [urls, filename, handleItemClick]
   )

   if (MobileUtils.webViewPresence()) {
      return <>{children(handleMobileClick)}</>
   }

   return (
      <>
         {children(handleClick)}
         <BrandedResponsiveMenu
            options={options}
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            handleClose={handleClose}
         />
      </>
   )
})
