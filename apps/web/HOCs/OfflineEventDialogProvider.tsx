import { OfflineEvent } from "@careerfairy/shared-lib/offline-events/offline-events"
import { useOfflineEvent } from "components/custom-hook/offline-event/useOfflineEvent"
import { OfflineEventDialog } from "components/views/portal/offline-events/OfflineEventDialog"
import { useRouter } from "next/router"
import { PropsWithChildren, useCallback } from "react"
import {
   deserializeTimestamps,
   SerializeTimestamps,
} from "util/firebaseTimestamps"

type SerializedOfflineEvent = SerializeTimestamps<OfflineEvent>

type OfflineEventDialogPageProps = {
   serializedOfflineEvent?: SerializedOfflineEvent | null
}

type Props = PropsWithChildren<{
   pageProps?: OfflineEventDialogPageProps
}>

const OfflineEventDialogProvider = ({ children, pageProps }: Props) => {
   const router = useRouter()

   const { data: offlineEvent } = useOfflineEvent(
      pageProps?.serializedOfflineEvent?.id,
      pageProps?.serializedOfflineEvent
         ? deserializeTimestamps(pageProps.serializedOfflineEvent)
         : null
   )

   const handleClose = useCallback(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { offlineEvent, ...rest } = router.query
      void router.push(
         {
            pathname: router.pathname,
            query: rest,
         },
         undefined,
         { shallow: true, scroll: false }
      )
   }, [router])

   return (
      <>
         {children}
         <OfflineEventDialog
            open={Boolean(offlineEvent)}
            eventFromServer={offlineEvent}
            onClose={handleClose}
         />
      </>
   )
}

export default OfflineEventDialogProvider
