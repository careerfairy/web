import { RootState } from "../index"

export const selectHoveredRow = (state: RootState) =>
   state.offlineEventsTable.hoveredRow

export const selectIsRowHovered = (statKey: string) => (state: RootState) =>
   state.offlineEventsTable.hoveredRow === statKey
