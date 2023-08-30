// Constants for Spark (Short Video) Entity
export const SPARK_CONSTANTS = {
   /**
    * The maximum duration of a spark in seconds
    */
   MAX_DURATION_SECONDS: 60,

   /**
    * The minimum duration of a spark in seconds
    */
   MIN_DURATION_SECONDS: 10,

   /**
    * The maximum file size of a spark in megabytes
    */
   MAX_FILE_SIZE_MB: 150,
   /**
    * The allowed file formats for a spark
    */
   ALLOWED_FILE_FORMATS: ["mp4", "mov"],

   /**
    * The maximum length of a spark question
    */
   QUESTION_MAX_LENGTH: 100,

   /**
    * The minimum length of a spark question
    */
   QUESTION_MIN_LENGTH: 10,

   /**
    * The minimum creators for a group to publish sparks
    */
   MINIMUM_CREATORS_TO_PUBLISH_SPARKS: 3,

   /**
    * The minimum sparks per creator for a group to publish sparks
    */
   MINIMUM_SPARKS_PER_CREATOR_TO_PUBLISH_SPARKS: 3,

   /**
    * The minimum sparks per creator for a group to publish sparks
    */
   MAX_PUBLIC_SPARKS: 15,
}
