import { RootState } from ".."

export const lastSparkSelector = (state: RootState) => {
   const sparks = state.sparksFeed.sparks
   return sparks[sparks.length - 1] || null
}
