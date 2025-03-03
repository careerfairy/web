import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import useCustomJobsCount from "components/custom-hook/custom-job/useCustomJobsCount"
import { useUserHasParticipated } from "components/custom-hook/live-stream/useUserHasParticipated"
import { FC, ReactNode, createContext, useContext, useMemo } from "react"

type EventPreviewCardContextProps = {
   livestream: LivestreamEvent
   loading?: boolean
   animation?: false | "wave" | "pulse"
   bottomElement?: React.ReactNode
   hideChipLabels?: boolean
   isPast?: boolean
   isLive?: boolean
   startDate?: Date
   isPlaceholderEvent?: boolean
   hasJobsToApply?: boolean
   hasParticipated?: boolean
   hasRegistered?: boolean
   cardInView?: boolean
   cardInViewRef?: (node?: Element | null) => void
}

const EventPreviewCardContext = createContext<
   EventPreviewCardContextProps | undefined
>(undefined)

type EventPreviewCardProviderProps = {
   livestream: LivestreamEvent
   children: ReactNode
   loading?: boolean
   // Animate the loading animation, defaults to the "wave" prop
   animation?: false | "wave" | "pulse"
   // For optional "Manage" button
   bottomElement?: React.ReactNode
   // If true, the chip labels will be hidden
   hideChipLabels?: boolean
   isPlaceholderEvent?: boolean
   hasRegistered: boolean
   cardInView?: boolean
   cardInViewRef?: (node?: Element | null) => void
   isPast?: boolean
}

export const EventPreviewCardProvider: FC<EventPreviewCardProviderProps> = ({
   livestream,
   children,
   loading,
   animation,
   bottomElement,
   hideChipLabels,
   isPlaceholderEvent,
   hasRegistered,
   cardInView,
   cardInViewRef,
   isPast,
}) => {
   const hasParticipated = useUserHasParticipated(livestream?.id, {
      disabled: !cardInView, // Helps Reduce the number of listeners
   })

   const { count: jobsCount } = useCustomJobsCount({
      businessFunctionTagIds: [],
      livestreamId: livestream?.id,
   })

   const hasJobsToApply = useMemo<boolean>(() => {
      if (loading) return false

      if (jobsCount === 0) return false

      return Boolean(livestream?.hasJobs || livestream?.jobs?.length > 0)
   }, [livestream?.hasJobs, livestream?.jobs?.length, jobsCount, loading])

   const isLive = useMemo(
      () => livestream?.hasStarted && !isPast,
      [livestream?.hasStarted, isPast]
   )

   const startDate = useMemo<Date>(
      () => livestream?.startDate || livestream?.start?.toDate?.(),
      [livestream?.start, livestream?.startDate]
   )

   const value = useMemo<EventPreviewCardContextProps>(
      () => ({
         livestream,
         loading,
         animation,
         bottomElement,
         hideChipLabels,
         isPast,
         isLive,
         startDate,
         isPlaceholderEvent,
         hasJobsToApply,
         hasParticipated,
         cardInView,
         cardInViewRef,
         hasRegistered,
      }),
      [
         livestream,
         loading,
         animation,
         bottomElement,
         hideChipLabels,
         isPast,
         isLive,
         startDate,
         isPlaceholderEvent,
         hasJobsToApply,
         hasParticipated,
         cardInView,
         cardInViewRef,
         hasRegistered,
      ]
   )

   return (
      <EventPreviewCardContext.Provider value={value}>
         {children}
      </EventPreviewCardContext.Provider>
   )
}

export const useEventPreviewCardContext = () => {
   const context = useContext(EventPreviewCardContext)
   if (context === undefined) {
      throw new Error(
         "useEventPreviewCardContext must be used within a EventPreviewCardProvider"
      )
   }
   return context
}
