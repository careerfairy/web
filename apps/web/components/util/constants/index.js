import React from "react"

export const speakerPlaceholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/mentors-pictures%2Fplaceholder.png?alt=media"
export const GENERAL_ERROR =
   "Something went wrong, please try again or contact support"
export const PERMISSION_ERROR =
   "You do not have permission to perform this action."
// increased max domain name length from 5 to 9 since
// propulsion academy has a long domain name for their privacy policy.
// Maybe other websites do to?
export const URL_REGEX =
   /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,9}(:[0-9]{1,5})?(\/.*)?$/gm
export const EMAIL_REGEX =
   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i

export const YOUTUBE_URL_REGEX =
   /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/

export const logoPlaceholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/group-logos%2Fplaceholder.png?alt=media&token=242adbfc-8ebb-4221-94ad-064224dca266"

export const demoVideo =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media"
export const demoSlides =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/background-videos%2Fslides-demo.mp4?alt=media&token=44532e6a-7355-4b78-9f62-88c81f7edbe1"
// Stream form Constants
export const SAVE_WITH_NO_VALIDATION = "SAVE_WITH_NO_VALIDATION"
export const SUBMIT_FOR_APPROVAL = "SUBMIT_FOR_APPROVAL"

export const LONG_NUMBER = 9999999

export const EMOTE_MESSAGE_TEXT_TYPE = "EMOTE"

// Collections

export const COMPANY_COLLECTION = "companyData"
export const CAREER_CENTER_COLLECTION = "careerCenterData"
export const USER_DATA_COLLECTION = "userData"

// Notification types

export const COMPANY_DASHBOARD_INVITE = "COMPANY_DASHBOARD_INVITE"
export const GROUP_DASHBOARD_INVITE = "GROUP_DASHBOARD_INVITE"

export const COMPANIES_PAGE_SIZE = 12

// Onboarding Video
export const ONBOARDING_VIDEO_URL_DESKTOP =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/onboarding-video%2FOnboarding_desktop_final.mp4?alt=media&token=8242df0b-1e6b-4df8-bb29-63138c67637c"

export const ONBOARDING_VIDEO_URL_MOBILE =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/onboarding-video%2FOnboarding_mobile_final.mp4?alt=media&token=63c9914b-307a-4e23-ae6d-78550f69e707"
