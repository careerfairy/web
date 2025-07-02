# Event Tracking Changes: Separate Events for Upcoming LS and Recording Page Views

## Overview
Implemented separate Customer.io analytics events to differentiate between upcoming Learning Session (LS) page views and recording page views, as requested in issue CF-1506.

## Changes Made

### 1. Added New Analytics Event Constants
**File:** `apps/web/util/analyticsConstants.ts`

Added two new event constants:
- `EventDetailsPageViewed: "event_details_page_viewed"` (for upcoming LS)
- `RecordingDetailsPageViewed: "recording_details_page_viewed"` (for recordings)

### 2. Enhanced useTrackLivestreamView Hook
**File:** `apps/web/components/custom-hook/live-stream/useTrackLivestreamView.ts`

- Added optional `showRecording` parameter to determine which event to send
- Added Customer.io analytics event tracking using `dataLayerLivestreamEvent`
- Logic: sends `RecordingDetailsPageViewed` if `showRecording` is true, otherwise sends `EventDetailsPageViewed`

### 3. Updated LivestreamDetailsView Component
**File:** `apps/web/components/views/livestream-dialog/views/livestream-details/LivestreamDetailsView.tsx`

- Modified to pass the `showRecording` parameter to `useTrackLivestreamView`
- Utilizes existing `useRecordingAccess` hook to determine if a recording is being shown

### 4. Updated Upcoming Livestream Page
**File:** `apps/web/pages/upcoming-livestream/[livestreamId].tsx`

- Updated to pass the `showRecording` parameter to `useTrackLivestreamView`
- Uses existing `useRecordingAccess` hook for consistency

## Event Flow

1. **Upcoming LS View**: When a user views a future/upcoming Learning Session → sends `event_details_page_viewed` event
2. **Recording View**: When a user views a past Learning Session with recording access → sends `recording_details_page_viewed` event

## Technical Details

The differentiation is based on the existing `useRecordingAccess` hook, which determines if a recording should be shown based on:
- Whether the livestream is past (`livestreamPresenter.isPast()`)
- Whether recording access is allowed (`!livestreamPresenter.denyRecordingAccess`)

## Testing

The changes maintain backward compatibility since the `showRecording` parameter is optional and defaults to `false`, ensuring existing functionality continues to work while adding the new event tracking capability.

## Impact

- **Upcoming LS pages** will now send `event_details_page_viewed` events
- **Recording pages** will now send `recording_details_page_viewed` events
- All existing Firebase tracking and popularity events remain unchanged
- Customer.io analytics will now receive properly differentiated events for better reporting and segmentation