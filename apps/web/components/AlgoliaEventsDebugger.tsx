import { Alert, Box, Button, Chip, Typography } from "@mui/material"
import { algoliaEventsService } from "data/algolia/AlgoliaEventsService"
import { useAlgoliaEvents } from "hooks/useAlgoliaEvents"
import React, { useEffect, useState } from "react"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   debugger: {
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 300,
      backgroundColor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      p: 2,
      boxShadow: 3,
      zIndex: 9999,
   },
   eventLog: {
      maxHeight: 200,
      overflow: "auto",
      mt: 1,
      p: 1,
      backgroundColor: "grey.50",
      borderRadius: 1,
   },
})

interface EventLog {
   timestamp: Date
   type: string
   data: any
}

/**
 * Development-only component for debugging Algolia events
 * Shows events being sent in real-time and provides test functions
 */
const AlgoliaEventsDebugger: React.FC = () => {
   const [events, setEvents] = useState<EventLog[]>([])
   const [isVisible, setIsVisible] = useState(false)
   const { userToken } = useAlgoliaEvents()

   useEffect(() => {
      if (process.env.NODE_ENV !== "development") return

      // Intercept console logs to capture our event logs
      const originalLog = console.log
      console.log = (...args) => {
         if (args[0]?.includes?.("Algolia") || args[0]?.includes?.("🔍")) {
            setEvents((prev) => [
               ...prev.slice(-9), // Keep only last 10 events
               {
                  timestamp: new Date(),
                  type: "log",
                  data: args,
               },
            ])
         }
         originalLog(...args)
      }

      return () => {
         console.log = originalLog
      }
   }, [])

   const sendTestEvent = async () => {
      try {
         await algoliaEventsService.trackSearchResultClick({
            index: "livestreams",
            queryID: `test_${Date.now()}`,
            objectID: `test_object_${Date.now()}`,
            position: 0,
            userToken,
            eventName: "Test Event from Debugger",
         })

         setEvents((prev) => [
            ...prev,
            {
               timestamp: new Date(),
               type: "test",
               data: { message: "Test event sent successfully!" },
            },
         ])
      } catch (error) {
         setEvents((prev) => [
            ...prev,
            {
               timestamp: new Date(),
               type: "error",
               data: { error: error.message },
            },
         ])
      }
   }

   const clearEvents = () => {
      setEvents([])
   }

   if (process.env.NODE_ENV !== "development") {
      return null
   }

   if (!isVisible) {
      return (
         <Box
            sx={{
               position: "fixed",
               bottom: 20,
               right: 20,
               zIndex: 9999,
            }}
         >
            <Button
               variant="outlined"
               size="small"
               onClick={() => setIsVisible(true)}
               sx={{ backgroundColor: "background.paper" }}
            >
               🔍 Algolia Debug
            </Button>
         </Box>
      )
   }

   return (
      <Box sx={styles.debugger}>
         <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="small" fontWeight={600}>
               Algolia Events Debug
            </Typography>
            <Button size="small" onClick={() => setIsVisible(false)}>
               ✕
            </Button>
         </Box>

         <Box mt={1}>
            <Typography variant="xsmall" color="text.secondary">
               User Token: <Chip label={userToken} size="small" />
            </Typography>
         </Box>

         <Box mt={1} display="flex" gap={1}>
            <Button size="small" variant="outlined" onClick={sendTestEvent}>
               Send Test Event
            </Button>
            <Button size="small" onClick={clearEvents}>
               Clear
            </Button>
         </Box>

         {events.length > 0 && (
            <Box sx={styles.eventLog}>
               {events.map((event, index) => (
                  <Box key={index} mb={1}>
                     <Typography variant="xsmall" color="text.secondary">
                        {event.timestamp.toLocaleTimeString()}
                     </Typography>
                     <Box>
                        {event.type === "error" ? (
                           <Alert severity="error">{event.data.error}</Alert>
                        ) : event.type === "test" ? (
                           <Alert severity="success">
                              {event.data.message}
                           </Alert>
                        ) : (
                           <Typography variant="xsmall">
                              {JSON.stringify(event.data).substring(0, 100)}...
                           </Typography>
                        )}
                     </Box>
                  </Box>
               ))}
            </Box>
         )}

         <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="xsmall">
               Check Algolia Dashboard → Events to see if events are received
            </Typography>
         </Alert>
      </Box>
   )
}

export default AlgoliaEventsDebugger
