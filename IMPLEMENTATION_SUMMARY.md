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
- **Change:** Modified the `formatLivestreamsEvents` call to pass `0` as minimum when `events?.length < 4`
- **Effect:** No more placeholder cards in the upcoming live streams section

### 2. Add "Recent live streams" Section

**When there are less than 6 upcoming live streams on `/next-livestreams`:**

#### New Hook Created
- **File:** `apps/web/components/custom-hook/live-stream/useRecentPastLivestreams.ts`
- **Purpose:** Fetches the 9 most recent past live streams
- **Features:** 
  - Uses SWR for caching and performance
  - Filters for ended, non-test, non-hidden streams
  - Orders by start date descending
  - Configurable limit (default 9)
  - Proper error handling with notifications

#### Next Live Streams Page Enhancement
- **File:** `apps/web/components/views/common/NextLivestreams/NextLiveStreamsWithFilter.tsx`
- **New Section:** Added "Recent live streams" section with:
  - 1px divider with `neutral[100]` color
  - "Recent live streams" title with proper typography
  - Grid of 9 most recent past live streams using `GroupStreams` component
  - Consistent spacing and margins matching existing sections
  - 16px spacing between title and grid

#### "More to watch" Button
- **Styling:** 
  - Stroke color: `neutral[200]`
  - Text color: `neutral[600]`
  - No fill color (transparent background)
  - Hover state: `neutral[50]` background
  - ChevronRight icon from react-feather
- **Functionality:** Redirects to `/past-livestreams`
- **Responsive:** Full width with proper text transform

### 3. Conditional Display Logic

The "Recent live streams" section only shows when:
- On the upcoming events tab (`initialTabValue === "upcomingEvents"`)
- Less than 6 upcoming live streams
- No filters applied
- No search input
- At least 1 recent past live stream available

## Technical Implementation Details

### Import Additions
- Added `ChevronRight` import from `react-feather`
- Added `useRecentPastLivestreams` hook import
- Added Material-UI components: `Divider`, `Button`

### Styling
- Added comprehensive sx styles for the new section
- Proper theme integration with neutral color palette
- Responsive design considerations
- Consistent spacing with existing components

### Performance Considerations
- Used SWR for efficient data fetching and caching
- Lazy loading with conditional rendering
- Proper memoization of computed values

## Build Fixes Applied

### Issue: Missing ChevronRight Import
- **Problem:** ChevronRight component was used but not imported
- **Fix:** Added ChevronRight to the react-feather import statement
- **Result:** Resolved TypeScript compilation error

### Issue: Component Props
- **Problem:** StreamsSection component missing currentGroup prop
- **Fix:** Added `currentGroup={null}` to StreamsSection props
- **Result:** Resolved TypeScript prop validation error

## Files Modified
1. `apps/web/components/views/portal/events-preview/ComingUpNextEvents.tsx`
2. `apps/web/components/views/common/NextLivestreams/StreamsSection/index.js`
3. `apps/web/components/views/common/NextLivestreams/NextLiveStreamsWithFilter.tsx`
4. `apps/web/components/custom-hook/live-stream/useRecentPastLivestreams.ts` (new file)

## Testing Recommendations
- Test with various numbers of upcoming streams (0-10)
- Verify responsive behavior on mobile and desktop
- Test button navigation to past livestreams page
- Verify proper loading states and error handling
- Test with and without filters applied

## Accessibility & UX
- Proper semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- Consistent visual hierarchy
- Clear call-to-action with descriptive button text

## Performance Impact
- Minimal: Only fetches data when needed
- Cached responses via SWR
- Conditional rendering reduces unnecessary computations
- Leverages existing components for consistency

## Deployment Notes

- No database migrations required
- No breaking changes to existing functionality
- Backward compatible with current data structure
- Uses existing Firebase queries and collection structure
- Build errors resolved and CI should pass

## Future Enhancements

- Could add loading states for the recent streams section
- Might consider adding analytics tracking for the new section
- Could implement infinite scroll or pagination for recent streams if needed

## Commit History

1. **Initial Implementation:** Core functionality for placeholder removal and recent streams section
2. **Build Fixes:** Resolved TypeScript errors, missing imports, and component prop issues