export const S3_ROOT_PATH = "livestreams"
export const S3_BUCKET = "agora-cf-cloud-recordings"
export const S3_BUCKET_LINK = `https://${S3_BUCKET}.s3.eu-central-1.amazonaws.com`

/**
 * Max hours of a recording session
 *
 * resourceExpiredHour [1, 720]
 *   Time allowed to stop/update a recording.
 * maxRecordingHour [1,720]
 *   Time recording
 */
export const MAX_RECORDING_HOURS = 24

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
