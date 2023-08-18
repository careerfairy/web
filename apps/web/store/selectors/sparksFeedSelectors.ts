import { RootState } from ".."

export const lastSparkSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   return sparks[sparks.length - 1] || null
}

export const isOnLastSparkSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   return state.sparksFeed.currentPlayingIndex === sparks.length - 1
}

export const isFetchingNextSparksSelector = (state: RootState) =>
   state.sparksFeed.fetchNextSparksStatus === "loading"

export const isFetchingInitialSparksSelector = (state: RootState) =>
   state.sparksFeed.initialFetchStatus === "loading"

export const initialSparksFetchedSelector = (state: RootState) =>
   state.sparksFeed.initialSparksFetched === true

export const hasNoMoreSparksSelector = (state: RootState) =>
   state.sparksFeed.hasMoreSparks === false

export const totalNumberOfSparksSelector = (state: RootState) =>
   state.sparksFeed.sparks.length

export const activeSparkSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   const index = state.sparksFeed.currentPlayingIndex
   return sparks[index] || null
}

export const currentSparkIndexSelector = (state: RootState) =>
   state.sparksFeed.currentPlayingIndex

export const numberOfSparksToFetchSelector = (state: RootState) =>
   state.sparksFeed.currentPlayingIndex

export const fetchNextErrorSelector = (state: RootState) =>
   state.sparksFeed.fetchNextError
