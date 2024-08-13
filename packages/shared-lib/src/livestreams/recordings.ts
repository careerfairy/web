export const S3_ROOT_PATH = "livestreams"
export const S3_BUCKET_NAME = "agora-cf-cloud-recordings"
export const S3_BUCKET_LINK = `https://${S3_BUCKET_NAME}.s3.eu-central-1.amazonaws.com`
export const NEW_CHANGES_DATE = 1653501600000

/**
 * Max hours of a recording session
 *
 * resourceExpiredHour [1, 720]
 *   Time allowed to stop/update a recording.
 * maxRecordingHour [1,720]
 *   Time recording
 */
export const MAX_RECORDING_HOURS = 4

/**
 * Generate a download link for a recording
 *
 * @param livestreamId
 * @param sid
 * @param breakoutRoomID
 */
export const downloadLink = (
   livestreamId: string,
   sid: string,
   breakoutRoomID?: string
) => {
   if (breakoutRoomID) {
      return `${S3_BUCKET_LINK}/${S3_ROOT_PATH}/${livestreamId}/${breakoutRoomID}/${sid}_${breakoutRoomID}_0.mp4`
   } else {
      return `${S3_BUCKET_LINK}/${S3_ROOT_PATH}/${livestreamId}/${sid}_${livestreamId}_0.mp4`
   }
}

/**
 * Generate a download link for a recording
 * Supports the old download link format
 *
 * @param livestreamStartDate
 * @param livestreamId
 * @param sid
 * @param breakoutRoomID
 */
export const downloadLinkWithDate = (
   livestreamStartDate: Date,
   livestreamId: string,
   sid: string,
   breakoutRoomID?: string
) => {
   /**
    * On 24 May 2022 we've changed the Recording functions and started using a new S3 path for the recorded files
    * Any recording before this date, should use the old path
    * https://github.com/careerfairy/web/pull/130
    */
   if (livestreamStartDate?.getTime() < NEW_CHANGES_DATE) {
      return `https://agora-cf-cloud-recordings.s3.eu-central-1.amazonaws.com/directory1/directory5/${sid}_${livestreamId}_0.mp4`
   } else {
      return downloadLink(livestreamId, sid, breakoutRoomID)
   }
}
