# Algolia Events for Recommend Feature

This document explains how to use the Algolia events system to enable the Recommend feature for displaying related and common searches.

## Overview

Algolia's Recommend feature requires event tracking to understand user behavior and generate relevant recommendations. We've implemented a comprehensive event tracking system that integrates with your existing analytics infrastructure.

## Key Components

### 1. AlgoliaEventsService (`AlgoliaEventsService.ts`)

The core service that handles all Algolia event tracking:

-  **Search Result Clicks**: Tracks when users click on search results
-  **Search Result Views**: Tracks when users view search results
-  **Conversions**: Tracks valuable user actions (registrations, applications, follows)
-  **Recommendation Interactions**: Tracks clicks and views on recommended items

### 2. useAlgoliaEvents Hook (`hooks/useAlgoliaEvents.ts`)

A React hook that provides easy access to event tracking with automatic user context:

```typescript
const { userToken, trackSearchResultClick, trackConversion } =
   useAlgoliaEvents()
```

### 3. Enhanced Search Repository (`AlgoliaRepository.ts`)

Updated to support:

-  Click analytics (`clickAnalytics: true`)
-  User tokens for personalization
-  Query IDs for tracking search-to-conversion paths

### 4. Conversion Utilities (`util/algoliaConversions.ts`)

Pre-built functions for tracking common conversions:

-  Livestream registrations
-  Company follows
-  Job applications
-  Spark engagements

## Implementation Guide

### Step 1: Enable Analytics in Search

When using search hooks, enable analytics:

```typescript
const { data } = useLivestreamSearchAlgolia(
   searchQuery,
   filterOptions,
   targetReplica,
   false, // disable
   undefined, // itemsPerPage
   true // enableAnalytics - THIS IS KEY!
)
```

### Step 2: Track Search Result Clicks

Use the enhanced search components or implement click tracking manually:

```typescript
const { trackSearchResultClick } = useAlgoliaEvents()

const handleResultClick = (result, position) => {
   // Track the click for Algolia Recommend
   trackSearchResultClick({
      index: "livestreams",
      queryID: searchData.queryID, // From search response
      objectID: result.objectID,
      position: position,
      eventName: "Livestream Search Result Clicked",
   })

   // Handle the actual navigation
   navigateToResult(result)
}
```

### Step 3: Track Conversions

Track valuable user actions that indicate successful outcomes:

```typescript
import { trackLivestreamRegistration } from "util/algoliaConversions"

const handleRegister = async (livestreamId) => {
   // Register the user
   await registerForLivestream(livestreamId)

   // Track the conversion for Algolia
   await trackLivestreamRegistration({
      livestreamId,
      userId: userData?.id,
      queryID: lastSearchQueryID, // Store this from search results
   })
}
```

### Step 4: Track High-Value Actions

Track other valuable interactions:

```typescript
const handleCompanyPageVisit = async (companyId) => {
   await trackHighValueAction({
      objectId: companyId,
      index: "companies",
      userId: userData?.id,
      queryID: lastSearchQueryID,
      actionType: "visit_company_page",
   })
}
```

## Event Types and Their Importance

### 1. Click Events (Required)

-  **Purpose**: Tell Algolia which results users find relevant
-  **When**: Every time a user clicks a search result
-  **Impact**: Powers "Related Items" recommendations

### 2. View Events (Recommended)

-  **Purpose**: Understand user browsing patterns
-  **When**: When search results are displayed to users
-  **Impact**: Helps with impression-based recommendations

### 3. Conversion Events (Critical)

-  **Purpose**: Define what "success" looks like
-  **When**: User completes valuable actions (register, apply, follow)
-  **Impact**: Optimizes recommendations for business outcomes

## Best Practices

### 1. Consistent User Tokens

-  Logged-in users: Use `user_${userId}`
-  Anonymous users: Generate and persist in localStorage
-  Never change tokens for the same user

### 2. Meaningful Event Names

-  Use descriptive names: "Livestream Search Result Clicked"
-  Be consistent across similar actions
-  Include context when helpful

### 3. Appropriate Values

-  Assign higher values to more important conversions
-  Job applications > Company follows > Likes
-  Use consistent value scales across your app

### 4. Query ID Preservation

-  Store `queryID` from search responses
-  Pass it to conversion tracking when possible
-  Enables search-to-conversion attribution

## Testing and Validation

### 1. Events Debugger

Use Algolia's Events debugger in the dashboard:

1. Go to Algolia Dashboard → Your App → Events
2. Check that events are being received
3. Verify event structure and data

### 2. Local Testing

Events are disabled in test environments to avoid polluting data.

### 3. User Token Verification

Ensure each user has a consistent, unique token across sessions.

## Integration with Existing Analytics

The system integrates with your existing Customer.io analytics:

-  All Algolia events are also sent to Customer.io
-  Maintains your current analytics workflow
-  Adds Algolia-specific tracking on top

## Recommendation Model Training

Once events are flowing:

1. Go to Algolia Dashboard → Recommend
2. Select your index
3. Choose recommendation model type:
   -  **Related Items**: Based on user click patterns
   -  **Frequently Bought Together**: Based on conversion patterns
4. Start training (takes up to 2 hours)
5. Models retrain daily automatically

## Common Issues and Solutions

### 1. No QueryID in Response

-  Ensure `clickAnalytics: true` in search parameters
-  Check that search options include `enableAnalytics: true`

### 2. Events Not Appearing

-  Check browser network tab for failed requests
-  Verify API keys and app ID are correct
-  Ensure events aren't disabled in test environment

### 3. Inconsistent User Tokens

-  Check localStorage for anonymous tokens
-  Verify user ID format consistency
-  Don't change tokens mid-session

## Example Implementation

See `EnhancedLivestreamSearch.tsx` for a complete example of:

-  Enabling analytics in search
-  Tracking result clicks with position
-  Integrating with existing components
-  Maintaining backward compatibility

## Next Steps

1. **Enable analytics** in your search hooks
2. **Implement click tracking** in search result components
3. **Add conversion tracking** for key user actions
4. **Monitor events** in Algolia dashboard
5. **Train recommendation models** once sufficient data is collected
6. **Integrate recommendations** into your UI using Algolia's Recommend API

For questions or issues, check the Algolia documentation or consult the development team.
