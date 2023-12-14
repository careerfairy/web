import { RootState } from ".."

export const isOnLastSparkSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   return state.sparksFeed.currentPlayingIndex === sparks.length - 1
}

export const isOnFirstSparkSelector = (state: RootState) => {
   return state.sparksFeed.currentPlayingIndex === 0
}

export const isOnEdgeSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   const index = state.sparksFeed.currentPlayingIndex
   return index === sparks.length - 1 || index === 0
}

export const isFetchingNextSparksSelector = (state: RootState) =>
   state.sparksFeed.fetchNextSparksStatus === "loading"

export const isFetchingSparksSelector = (state: RootState) =>
   state.sparksFeed.initialFetchStatus === "loading" ||
   state.sparksFeed.fetchNextSparksStatus === "loading"

export const initialSparksFetchedSelector = (state: RootState) =>
   state.sparksFeed.initialSparksFetched === true

export const hasNoMoreSparksSelector = (state: RootState) =>
   state.sparksFeed.hasMoreSparks === false

export const activeSparkSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   const index = state.sparksFeed.currentPlayingIndex
   return sparks[index] || null
}

export const currentSparkIndexSelector = (state: RootState) =>
   state.sparksFeed.currentPlayingIndex

export const selectedSparkCategoriesSelector = (state: RootState) =>
   state.sparksFeed.sparkCategoryIds

export const fetchNextErrorSelector = (state: RootState) =>
   state.sparksFeed.fetchNextError

export const sparksSelector = (state: RootState) => state.sparksFeed.sparks

export const currentSparkEventNotificationSelector = (state: RootState) =>
   state.sparksFeed.currentEventNotification

export const cardNotificationSelector = (state: RootState) =>
   state.sparksFeed.cardNotification

export const eventDetailsDialogVisibilitySelector = (state: RootState) =>
   state.sparksFeed.showEventDetailsDialog

export const userEmailSelector = (state: RootState) =>
   state.sparksFeed.userEmail

export const currentSparkIdSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   const index = state.sparksFeed.currentPlayingIndex
   return sparks[index]?.id || null
}

export const originalSparkIdSelector = (state: RootState) =>
   state.sparksFeed.originalSparkId

export const groupIdSelector = (state: RootState) => state.sparksFeed.groupId

export const emptyFilterSelector = (state: RootState) =>
   Boolean(
      state.sparksFeed.sparkCategoryIds.length &&
         state.sparksFeed.fetchNextSparksStatus === "idle" &&
         state.sparksFeed.sparks.length === 0
   )

export const cameFromCompanyPageLinkSelector = (state: RootState) =>
   state.sparksFeed.cameFromCompanyPageLink

export const videosMuttedSelector = (state: RootState) =>
   state.sparksFeed.videosMuted

export const isPlayingSelector = (state: RootState) => state.sparksFeed.playing

export const eventToRegisterTo = (state: RootState) =>
   state.sparksFeed.eventToRegisterTo
