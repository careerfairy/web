export const AnalyticsEvents = {
   BookDemoClick: "book_demo_click",
   GetInTouchClick: "get_in_touch_click",
   HubspotMeetingBooked: "hubspot_meeting_booked",
   LivestreamOpenSupport: "livestream_open_support",
   LivestreamJobOpen: "livestream_job_open",
   LivestreamJobApplicationComplete: "livestream_job_application_complete",
   LivestreamSpeakerLinkedinClick: "livestream_speaker_linkedin_click",
   LivestreamViewerHandRaiser: "livestream_viewer_hand_raiser",
   LivestreamViewerSelectJobs: "livestream_viewer_select_jobs",
   EventAddToCalendar: "event_add_to_calendar",
   EventRegistrationComplete: "event_registration_complete",
   EventRegistrationQuestionSubmit: "event_registration_question_submit",
   EventRegistrationRemoved: "event_registration_removed",
   EventRegistrationStarted: "event_registration_started",
   EventRegistrationStartedLoginRequire:
      "event_registration_started_login_require",
   EventRegistrationStartedProfileIncomplete:
      "event_registration_started_profile_incomplete",
   EventRegistrationTalentpoolJoin: "event_registration_talentpool_join",
   EventRegistrationTalentpoolSkip: "event_registration_talentpool_skip",
   NewsletterAcceptedOn1stReminder: "newsletter_accepted_on_1st_reminder",
   NewsletterAcceptedOn2ndReminder: "newsletter_accepted_on_2nd_reminder",
   NewsletterAcceptedOnSignup: "newsletter_accepted_on_signup",
   NewsletterDeniedOn1stReminder: "newsletter_denied_on_1st_reminder",
   NewsletterDeniedOn2ndReminder: "newsletter_denied_on_2nd_reminder",
   NewsletterDeniedOnSignup: "newsletter_denied_on_signup",
   SignupCredentialsCompleted: "signup_credentials_completed",
   SignupPinComplete: "signup_pin_complete",
   SignupStarted: "signup_started",
   AttendEvent: "attend_event",
   CompanyPageVisit: "company_page_visit",
   CompanyFollow: "company_follow",
   NewsletterAcceptedOnCompanyPage: "newsletter_accepted_on_company_page",
   RecommendedEventImpression: "recommended_event_impression",
   TalentPoolJoined: "talent_pool_joined",
   TalentPoolLeave: "talent_pool_leave",
   ClickCareerPageCTA: "Click_CareerPageCTA",
   ClickCompanyPageCTA: "Click_CompanyPageCTA",
   ClickDiscoverLivestreamCTA: "Click_DiscoverLivestreamCTA",
   ClickJobCTA: "Click_JobCTA",
   ClickMentorPageCTA: "Click_MentorPageCTA",
   ClickReachOutLinkedIn: "Click_ReachOut_LinkedIn",
   Impression: "Impression",
   Like: "Like",
   PlayedSpark: "Played_Spark",
   RegisterEvent: "Register_Event",
   ShareClipboard: "Share_Clipboard",
   ShareFacebook: "Share_Facebook",
   ShareLinkedIn: "Share_LinkedIn",
   ShareMobile: "Share_Mobile",
   ShareWhatsApp: "Share_WhatsApp",
   ShareX: "Share_X",
   Unlike: "Unlike",
   WatchedCompleteSpark: "Watched_CompleteSpark",
   LevelsStart: "levels_start",
   LevelsComplete: "levels_complete",
   LevelsFeedbackRatingSubmitted: "levels_feedback_rating_submitted",
   LevelsFeedbackSurveySubmitted: "levels_feedback_survey_submitted",
   LevelsProgressArticle: "levels_progress_article",
   LevelsProgressHighlight: "levels_progress_highlight",
   LevelsProgressQuiz: "levels_progress_quiz",
   LevelsProgressVideo: "levels_progress_video",
   LevelsLeave: "levels_leave",
   LevelsLivestreamOpened: "levels_livestream_opened",
   LevelsLivestreamRegistrationCompleted:
      "levels_livestream_registration_completed",
   LevelsJobViewed: "levels_job_viewed",
   LevelsJobApplied: "levels_job_applied",
   LevelsMentorView: "levels_mentor_view",
   LevelsMentorLinkedinClick: "levels_mentor_linkedin_click",
} as const

type EventMetadata = {
   [AnalyticsEvents.LivestreamOpenSupport]: {
      livestreamId: string
   }
   [AnalyticsEvents.GetInTouchClick]: {
      contactMethod: string
   }
   [AnalyticsEvents.HubspotMeetingBooked]: {
      meetingId: string
   }
   [AnalyticsEvents.LivestreamJobOpen]: {
      jobId: string
      livestreamId: string
   }
   [AnalyticsEvents.LivestreamJobApplicationComplete]: {
      jobId: string
      livestreamId: string
   }
   [AnalyticsEvents.LivestreamSpeakerLinkedinClick]: {
      speakerId: string
      livestreamId: string
   }
   [AnalyticsEvents.LivestreamViewerHandRaiser]: {
      livestreamId: string
   }
   [AnalyticsEvents.LivestreamViewerSelectJobs]: {
      livestreamId: string
      jobIds: string[]
   }
   [AnalyticsEvents.EventAddToCalendar]: {
      eventId: string
      calendarType: string
   }
   [AnalyticsEvents.EventRegistrationComplete]: {
      eventId: string
   }
   [AnalyticsEvents.EventRegistrationQuestionSubmit]: {
      eventId: string
      questionId: string
   }
   [AnalyticsEvents.LevelsFeedbackRatingSubmitted]: {
      levelId: string
      rating: number
   }
   [AnalyticsEvents.LevelsFeedbackSurveySubmitted]: {
      levelId: string
      surveyId: string
   }
   [AnalyticsEvents.LevelsProgressArticle]: {
      levelId: string
      articleId: string
   }
   [AnalyticsEvents.LevelsProgressHighlight]: {
      levelId: string
      highlightId: string
   }
   [AnalyticsEvents.LevelsProgressQuiz]: {
      levelId: string
      quizId: string
      score?: number
   }
   [AnalyticsEvents.LevelsProgressVideo]: {
      levelId: string
      videoId: string
      progress: number
   }
   [AnalyticsEvents.LevelsJobViewed]: {
      levelId: string
      jobId: string
   }
   [AnalyticsEvents.LevelsJobApplied]: {
      levelId: string
      jobId: string
   }
   [AnalyticsEvents.LevelsMentorView]: {
      levelId: string
      mentorId: string
   }
   [AnalyticsEvents.LevelsMentorLinkedinClick]: {
      levelId: string
      mentorId: string
   }
   [AnalyticsEvents.CompanyPageVisit]: {
      companyId: string
   }
   [AnalyticsEvents.CompanyFollow]: {
      companyId: string
   }
   [AnalyticsEvents.ShareClipboard]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.ShareFacebook]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.ShareLinkedIn]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.ShareMobile]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.ShareWhatsApp]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.ShareX]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.Like]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.Unlike]: {
      contentId: string
      contentType: string
   }
   [AnalyticsEvents.PlayedSpark]: {
      sparkId: string
   }
   [AnalyticsEvents.WatchedCompleteSpark]: {
      sparkId: string
   }
   [AnalyticsEvents.Impression]: {
      contentId: string
      contentType: string
      location: string
   }
}

type AnalyticsEvent = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]

// Generic event type
type AnalyticsEventPayload<T extends AnalyticsEvent> =
   T extends keyof EventMetadata ? EventMetadata[T] : Record<string, unknown>

// Function to send an event
declare function sendAnalyticsEvent<T extends AnalyticsEvent>(
   event: T,
   metadata: AnalyticsEventPayload<T>
): void

sendAnalyticsEvent(AnalyticsEvents.LivestreamOpenSupport, {
   livestreamId: "xyz789",
})
