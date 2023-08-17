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
   state.sparksFeed.status === "loading"

export const hasNoMoreSparksSelector = (state: RootState) =>
   state.sparksFeed.hasMoreSparks === false
