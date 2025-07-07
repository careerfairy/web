# Live Streams Display Experience Improvements

## Overview
This PR improves the user experience on the CareerFairy platform when there aren't many upcoming live streams by removing placeholder cards and adding a new "Recent live streams" section.

## Changes Implemented

### 1. Remove Placeholder Cards

**When there are less than 4 upcoming live streams:**

#### Portal Page (`/portal`)
- **File:** `apps/web/components/views/portal/events-preview/ComingUpNextEvents.tsx`
- **Change:** Modified the `formatLivestreamsEvents` call to pass `0` as minimum when `localEvents?.length < 4`
- **Effect:** No more placeholder cards in the upcoming live streams carousel

#### Next Live Streams Page (`/next-livestreams`)
- **File:** `apps/web/components/views/common/NextLivestreams/StreamsSection/index.js`
- **Change:** Added logic to calculate `actualMinimum` based on upcoming livestreams count
- **Effect:** No more placeholder cards when there are less than 4 upcoming streams

### 2. Recent Live Streams Section

**When there are less than 6 upcoming live streams on `/next-livestreams`:**

#### New Custom Hook
- **File:** `apps/web/components/custom-hook/live-stream/useRecentPastLivestreams.ts`
- **Purpose:** Fetches the 9 most recent past livestreams
- **Query:** Orders by `start` date descending, filters out test/hidden streams

#### NextLiveStreamsWithFilter Component
- **File:** `apps/web/components/views/common/NextLivestreams/NextLiveStreamsWithFilter.tsx`
- **Added Features:**
  - Import and use `useRecentPastLivestreams` hook
  - Conditional rendering logic for the new section
  - 1px divider with `neutral[100]` color
  - "Recent live streams" title with 16px spacing
  - Grid display using existing `GroupStreams` component
  - "More to watch" button with Material UI ChevronRight icon

#### Styling & Layout
- **Divider:** 1px border with `theme.palette.neutral[100]` color
- **Button:** Stroke `neutral[200]`, text `neutral[600]`, no fill, responsive width
- **Spacing:** Consistent margins matching existing grid layout
- **Icon:** Material UI ChevronRightIcon (replacing react-feather for compatibility)

### 3. Conditional Display Logic

The Recent live streams section only shows when:
- User is on the upcoming events tab (`initialTabValue === "upcomingEvents"`)
- Less than 6 upcoming live streams
- No search filters applied
- No search input text
- Recent past livestreams are available

## Technical Details

### Dependencies
- Uses existing `GroupStreams` component for consistent card display
- Leverages `RecordingCard` components from the past live streams page
- Utilizes Material UI components for styling consistency
- Implements SWR for efficient data fetching

### Performance Considerations
- Hook only fetches when needed (9 items limit)
- Conditional rendering prevents unnecessary DOM elements
- Reuses existing components to maintain bundle size

### Responsive Design
- Button adapts to page width
- Spacing adjusts for mobile/desktop breakpoints
- Maintains existing responsive behavior of stream cards

## Files Modified

1. `apps/web/components/views/portal/events-preview/ComingUpNextEvents.tsx`
2. `apps/web/components/views/common/NextLivestreams/StreamsSection/index.js`
3. `apps/web/components/views/common/NextLivestreams/NextLiveStreamsWithFilter.tsx`
4. `apps/web/components/custom-hook/live-stream/useRecentPastLivestreams.ts` (new file)

## Testing Recommendations

1. **Portal Page:** Test with < 4 upcoming streams to verify placeholder removal
2. **Next Live Streams Page:** Test with < 4 upcoming streams for placeholder removal
3. **Recent Section:** Test with < 6 upcoming streams to verify section appears
4. **Responsive:** Test button and layout on mobile/tablet/desktop
5. **Navigation:** Verify "More to watch" button redirects to `/past-livestreams`
6. **Edge Cases:** Test with no recent streams, no upcoming streams, etc.

## Deployment Notes

- No database migrations required
- No breaking changes to existing functionality
- Backward compatible with current data structure
- Uses existing Firebase queries and collection structure

## Future Enhancements

- Could add loading states for the recent streams section
- Might consider adding analytics tracking for the new section
- Could implement infinite scroll or pagination for recent streams if needed