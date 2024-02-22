export type DiscoveryTag =
   | "onboarding-company"
   | "onboarding-sparks"
   | "onboarding-livestream"
   | "onboarding-recording"
   | "onboarding-feedback"
   | "onboarding-all"

export type CompanyDiscoveryTemplateModel = {
   user_name: string
}

export type SparksDiscoveryTemplateModel = {
   user_name: string
}

export type LivestreamDiscoveryTemplateModel = {
   user_name: string
   recommendedEvents?: LivestreamDiscoveryEvents[]
}

export type LivestreamDiscoveryEvents = {
   image: string
   title: string
   shortTitle: string
   date: string
   link: string
}

export type RecordingDiscoveryTemplateModel = {
   user_name: string
}

export type FeedbackDiscoveryTemplateModel = {
   user_name: string
}
