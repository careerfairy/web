import { RootState } from "../index"

export const selectHoveredRow = (state: RootState) =>
   state.eventsTable.hoveredRow

export const selectIsRowHovered = (statKey: string) => (state: RootState) =>
   state.eventsTable.hoveredRow === statKey
