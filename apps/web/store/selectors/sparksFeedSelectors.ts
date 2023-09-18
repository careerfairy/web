import { RootState } from ".."

export const isOnLastSparkSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   return state.sparksFeed.currentPlayingIndex === sparks.length - 1
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
