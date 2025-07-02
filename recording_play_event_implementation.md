# Recording Play Event Implementation

## Summary

Successfully implemented the `recording_play` custom event for tracking when users watch recordings on the CareerFairy platform. The event is triggered whenever a user clicks the play icon on recording videos AND when users hover over recordings causing auto-play to start. Uses the same metadata structure as the existing `event_registration_started` event.

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

### 5. Hover Auto-Play Scenario ⭐ **NEW**
**File**: `apps/web/components/views/common/stream-cards/RecordingPreviewCardContainer.tsx`
- Added analytics imports and livestream context access
- Added event tracking in `handleMouseEnter` function
- Event fires when users hover over recordings and auto-play starts (desktop only)
- Covers the past livestreams overview page hover functionality

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

### Trigger Scenarios
1. **Past Livestreams Page**: `https://www.careerfairy.io/past-livestreams/livestream/[id]` - Click play
2. **Livestream Dialog Windows**: When opening recordings from any dialog - Click play
3. **Portal Content Carousel**: "Watch now" buttons for recording content - Click play
4. **Past Livestreams Overview**: `https://www.careerfairy.io/past-livestreams` - Hover over recordings ⭐ **NEW**

## Implementation Details

### Function Signature
```typescript
dataLayerLivestreamEvent(AnalyticsEvents.RecordingPlay, livestreamObject)
```

### Auto-Play Detection
- Desktop hover auto-play tracked in `RecordingPreviewCardContainer`
- Mobile viewport auto-play (using intersection observer) tracked via existing hover logic
- Event fires immediately when auto-play starts, not when video actually begins

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
- [x] Click play on recording in past livestream page
- [x] Click play on recording in livestream dialog
- [x] Click "Watch now" in portal carousel
- [x] Hover over recording cards in past livestreams overview (desktop)
- [ ] Verify event appears in analytics dashboard
- [ ] Confirm metadata structure matches `event_registration_started`

### Analytics Verification
1. Open browser developer tools
2. Navigate to Network tab
3. Trigger recording play (click or hover)
4. Verify `recording_play` event in analytics requests

## Rollout Plan

1. **Merge PR** to main branch
2. **Deploy** to staging environment
3. **Test** event firing and metadata
4. **Deploy** to production
5. **Monitor** analytics dashboard for new events

## Notes

- Event fires for both manual clicks AND hover auto-play scenarios
- Desktop hover auto-play: Event fires immediately when mouse enters recording card
- Mobile auto-play: Uses existing intersection observer logic
- Consistent with existing analytics event patterns in codebase
- Uses established `dataLayerLivestreamEvent` function for reliable metadata
- Compatible with existing Customer.io integration

## Commits in PR

1. **Initial Implementation**: Added event constant and tracking for click scenarios
2. **Hover Auto-Play**: Added tracking for hover auto-play scenarios on past livestreams overview