import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import {
   createCalendarEvent,
   getLivestreamICSDownloadUrl,
   getLivestreamsICSDownloadUrl,
   makeMultipleEventsUrls,
   makeUrls,
} from "@careerfairy/shared-lib/utils/utils"
import { Avatar } from "@mui/material"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { livestreamService } from "data/firebase/LivestreamService"
import { useAuth } from "HOCs/AuthProvider"
import {
   memo,
   ReactNode,
   SyntheticEvent,
   useCallback,
   useMemo,
   useState,
} from "react"
import { sxStyles } from "types/commonTypes"
import { AnalyticsEvents } from "util/analyticsConstants"
import { MobileUtils } from "util/mobile.utils"
import {
   appleIcon,
   googleIcon,
   outlookBlueIcon,
   outlookYellowIcon,
   yahooIcon,
} from "../../../../constants/svgs"
import { dataLayerLivestreamEvent } from "../../../../util/analyticsUtils"
import {
   errorLogAndNotify,
   shouldUseEmulators,
} from "../../../../util/CommonUtil"
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
   children: (handler: (event: SyntheticEvent) => void) => ReactNode
   /**
    * Single event (legacy prop). If provided together with `events`, `events` takes precedence.
    */
   event?: LivestreamEvent
   /**
    * Optional array of events. When provided with more than one event, selecting Apple/Outlook
    * will trigger downloads for all events' ICS files.
    */
   events?: LivestreamEvent[]
   filename: string
   /**
    * Action to take when clicking on a menu item of the calendar dropdown.
    */
   onCalendarClick?: () => void
   /**
    * Optional origin source for tracking where the calendar add action originated from
    */
   originSource?: string
}

type CalendarProvider = "google" | "apple" | "outlook" | "yahoo" | "ics"

export const AddToCalendar = memo(function AddToCalendar({
   children,
   event,
   events,
   filename = "download",
   onCalendarClick,
   originSource,
}: Props) {
   const [anchorEl, setAnchorEl] = useState(null)
   const { userData } = useAuth()

   const allEvents = useMemo(() => {
      if (events?.length > 0) return events
      return event ? [event] : []
   }, [event, events])

   const isMultiple = allEvents.length > 1

   const urls = useMemo(() => {
      const overrideBaseUrl = getBaseUrl()
      try {
         const calendarEvents = allEvents.map((ev) =>
            createCalendarEvent(
               ev,
               {
                  medium: "add-to-calendar-register-confirmation",
               },
               {
                  overrideBaseUrl,
               }
            )
         )
         if (isMultiple) {
            return makeMultipleEventsUrls(calendarEvents, errorLogAndNotify)
         } else {
            return makeUrls(calendarEvents[0], errorLogAndNotify)
         }
      } catch (error) {
         return {
            google: "#",
            outlook: "#",
            yahoo: "#",
            ics: "#",
         }
      }
   }, [allEvents, isMultiple])

   /**
    * Tracks calendar add to Customer.io and writes to Firestore via LivestreamService
    * Only tracks the first time a user adds an event to their calendar
    */
   const trackCalendarAdd = useCallback(
      async (livestream: LivestreamEvent, provider: CalendarProvider) => {
         if (!userData) return

         try {
            // Write to Firestore via service (handles one-time tracking check)
            const wasTracked = await livestreamService.setUserAddedToCalendar(
               livestream.id,
               userData,
               provider,
               originSource
            )

            // Only fire Customer.io event if it was successfully tracked
            if (wasTracked) {
               dataLayerLivestreamEvent(
                  AnalyticsEvents.EventAddToCalendar,
                  livestream,
                  {
                     calendarProvider: provider,
                  }
               )
            }
         } catch (error) {
            // Don't block UX if tracking fails
            errorLogAndNotify(error, {
               message: "Failed to track calendar add",
               livestreamId: livestream.id,
               provider,
            })
         }
      },
      [userData, originSource]
   )

   const handleClick = useCallback(
      (e: SyntheticEvent) => {
         if (allEvents.length === 0) return
         setAnchorEl(e.currentTarget)
      },
      [allEvents]
   )

   const handleClose = useCallback((e?: SyntheticEvent) => {
      e?.stopPropagation()
      setAnchorEl(null)
   }, [])

   const handleItemClick = useCallback(
      (provider: CalendarProvider) => (e?: SyntheticEvent) => {
         e?.stopPropagation()
         handleClose()

         // Track calendar add for each event
         allEvents.forEach((ev) => trackCalendarAdd(ev, provider))

         onCalendarClick && onCalendarClick()
      },
      [onCalendarClick, handleClose, allEvents, trackCalendarAdd]
   )

   const openMultipleTabs = useCallback((urls: string[]) => {
      urls.forEach((url, index) => {
         setTimeout(() => {
            window.open(url, "_blank", "noopener,noreferrer")
         }, index * 300) // 300ms delay between each tab to try to prevent blocking by browser
      })
   }, [])

   const handleMobileClick = useCallback(() => {
      if (allEvents.length === 0) return

      // Track calendar add for mobile (uses ICS files)
      allEvents.forEach((ev) => trackCalendarAdd(ev, "ics"))

      if (isMultiple) {
         const ids = allEvents.map((ev) => ev.id)
         window.open(getLivestreamsICSDownloadUrl(ids, shouldUseEmulators()))
      } else {
         window.open(
            getLivestreamICSDownloadUrl(allEvents[0].id, shouldUseEmulators())
         )
      }
   }, [allEvents, isMultiple, trackCalendarAdd])

   const options: MenuOption[] = useMemo(() => {
      if (isMultiple) {
         return [
            {
               label: "Apple Calendar",
               icon: <Avatar sx={styles.avatar} src={appleIcon} />,
               handleClick: handleItemClick("apple"),
               wrapperComponent: (props) => (
                  <CalendarLink
                     href={urls.ics}
                     download={filename}
                     {...props}
                  />
               ),
            },
            {
               label: "Google",
               icon: <Avatar sx={styles.avatar} src={googleIcon} />,
               handleClick: () => {
                  openMultipleTabs(urls.google as string[])
                  handleItemClick("google")()
               },
            },
            {
               label: "Outlook",
               icon: <Avatar sx={styles.avatar} src={outlookYellowIcon} />,
               handleClick: handleItemClick("outlook"),
               wrapperComponent: (props) => (
                  <CalendarLink
                     href={urls.ics}
                     download={filename}
                     {...props}
                  />
               ),
            },
            {
               label: "Outlook Web App",
               icon: <Avatar sx={styles.avatar} src={outlookBlueIcon} />,
               handleClick: () => {
                  openMultipleTabs(urls.outlook as string[])
                  handleItemClick("outlook")()
               },
            },
            {
               label: "Yahoo",
               icon: <Avatar sx={styles.avatar} src={yahooIcon} />,
               handleClick: () => {
                  openMultipleTabs(urls.yahoo as string[])
                  handleItemClick("yahoo")()
               },
            },
         ]
      }

      return [
         {
            label: "Apple Calendar",
            icon: <Avatar sx={styles.avatar} src={appleIcon} />,
            handleClick: handleItemClick("apple"),
            wrapperComponent: (props) => (
               <CalendarLink href={urls.ics} download={filename} {...props} />
            ),
         },
         {
            label: "Google",
            icon: <Avatar sx={styles.avatar} src={googleIcon} />,
            handleClick: handleItemClick("google"),
            wrapperComponent: (props) => (
               <CalendarLink href={urls.google as string} {...props} />
            ),
         },
         {
            label: "Outlook",
            icon: <Avatar sx={styles.avatar} src={outlookYellowIcon} />,
            handleClick: handleItemClick("outlook"),
            wrapperComponent: (props) => (
               <CalendarLink href={urls.ics} download={filename} {...props} />
            ),
         },
         {
            label: "Outlook Web App",
            icon: <Avatar sx={styles.avatar} src={outlookBlueIcon} />,
            handleClick: handleItemClick("outlook"),
            wrapperComponent: (props) => (
               <CalendarLink href={urls.outlook as string} {...props} />
            ),
         },
         {
            label: "Yahoo",
            icon: <Avatar sx={styles.avatar} src={yahooIcon} />,
            handleClick: handleItemClick("yahoo"),
            wrapperComponent: (props) => (
               <CalendarLink href={urls.yahoo as string} {...props} />
            ),
         },
      ]
   }, [isMultiple, urls, filename, handleItemClick, openMultipleTabs])

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
