# Backfill EndedAt for Livestreams

This migration backfills the `endedAt` field for livestream events that don't have it set. Instead of using the estimated duration from the `duration` field, it calculates the actual duration by fetching the video file and using `ffprobe` to get its exact length.

## What it does

1. Fetches all livestreams that:

   -  Don't have an `endedAt` field
   -  Have either `startedAt` or `start` field

2. For each livestream:
   -  Gets the recording token from the `recordingToken` subcollection to get the `sid`
   -  Uses `downloadLinkWithDate` to get the video URL
   -  Uses `ffprobe` to get the actual video duration in seconds
   -  Calculates the `endedAt` timestamp by adding the video duration to the start timestamp
   -  Updates the livestream document with the calculated `endedAt` value

## Requirements

-  `ffprobe` must be installed on the system (it's part of the `ffmpeg` package)
-  Access to the S3 bucket where the video files are stored

## Usage

```bash
npm run script -w @careerfairy/firebase-scripts -- scriptPath=./migrations/livestreams/backFillEndedAt
```
