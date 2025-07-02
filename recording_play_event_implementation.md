# Recording Play Event Implementation

## Summary

Successfully implemented the `recording_play` custom event for tracking when users watch recordings on the CareerFairy platform. The event is triggered whenever a user clicks the play icon on recording videos and uses the same metadata structure as the existing `event_registration_started` event.

## Branch and PR Information

- **Branch**: `cursor/create-custom-event-for-recording-play-4542`
- **Target**: `main`
- **Status**: ✅ Committed and pushed to remote repository

**To create the PR, visit:**
```
https://github.com/careerfairy/web/pull/new/cursor/create-custom-event-for-recording-play-4542
```

## Changes Made

### 1. Added Event Constant
**File**: `apps/web/util/analyticsConstants.ts`
```typescript
RecordingPlay: "recording_play"
```

### 2. Recording Player Component (Livestream Dialogs)
**File**: `apps/web/components/views/livestream-dialog/views/livestream-details/RecordingPlayer.tsx`
- Added analytics imports
- Added event tracking in `handlePreviewPlay` function
- Event fires when users click play on recordings in dialog views

### 3. HeroSection Recording Player
**File**: `apps/web/components/views/upcoming-livestream/HeroSection/index.tsx` 
- Added analytics imports
- Added event tracking in `handlePreviewPlay` function
- Event fires when users click play on recordings in past livestream pages

### 4. Content Carousel Banner Play
**File**: `apps/web/components/views/portal/content-carousel/ContentCarousel.tsx`
- Added event tracking in `handleBannerPlayRecording` function
- Event fires when users click "Watch now" on recordings in portal carousels

## Event Metadata

The `recording_play` event includes the same metadata as `event_registration_started`:

### Automatic Metadata (from `dataLayerLivestreamEvent`)
- `livestreamId`: ID of the livestream/recording
- `livestreamTitle`: Title of the livestream/recording
- `companyName`: Name of the hosting company

### Enhanced Customer.io Variables
- Calendar links (Google, Outlook, Apple)
- Speaker information (up to 3 speakers)
- Speaker count
- Background image URL
- Livestream start date

## Usage Examples

### Example Event Payload
```javascript
{
  event: "recording_play",
  livestreamId: "gvkw1nANQ6w5ef92ED5Z",
  livestreamTitle: "Tech Career Opportunities at Google",
  companyName: "Google",
  calendarLinks: { /* calendar URLs */ },
  speakers: [ /* speaker details */ ],
  speakerCount: 2,
  backgroundImageUrl: "https://...",
  livestreamStartDate: 1672531200
}
```

### Trigger Locations
1. **Past Livestreams Page**: `https://www.careerfairy.io/past-livestreams/livestream/[id]`
2. **Livestream Dialog Windows**: When opening recordings from any dialog
3. **Portal Content Carousel**: "Watch now" buttons for recording content

## Implementation Details

### Function Signature
```typescript
dataLayerLivestreamEvent(AnalyticsEvents.RecordingPlay, livestreamObject)
```

### Error Handling
- All implementations include proper error handling from existing recording play functions
- Events only fire for authenticated users where recordings are accessible
- Graceful fallback if livestream data is unavailable

### Performance Considerations
- Event tracking added to existing user interaction points
- No additional API calls or performance overhead
- Uses existing analytics infrastructure

## Testing

### Manual Testing Checklist
- [ ] Click play on recording in past livestream page
- [ ] Click play on recording in livestream dialog
- [ ] Click "Watch now" in portal carousel
- [ ] Verify event appears in analytics dashboard
- [ ] Confirm metadata structure matches `event_registration_started`

### Analytics Verification
1. Open browser developer tools
2. Navigate to Network tab
3. Trigger recording play
4. Verify `recording_play` event in analytics requests

## Rollout Plan

1. **Merge PR** to main branch
2. **Deploy** to staging environment
3. **Test** event firing and metadata
4. **Deploy** to production
5. **Monitor** analytics dashboard for new events

## Notes

- Event only fires when actual video playback begins (not on preview image clicks)
- Consistent with existing analytics event patterns in codebase
- Uses established `dataLayerLivestreamEvent` function for reliable metadata
- Compatible with existing Customer.io integration