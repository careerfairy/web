type DiscoveryTemplateWithUserName = {
   user_name: string
}
export type DiscoveryTag =
   | "onboarding-company"
   | "onboarding-sparks"
   | "onboarding-livestream"
   | "onboarding-recording"
   | "onboarding-feedback"
   | "onboarding-all"

export type CompanyDiscoveryTemplateModel = DiscoveryTemplateWithUserName

export type SparksDiscoveryTemplateModel = DiscoveryTemplateWithUserName

export type LivestreamDiscoveryTemplateModel = DiscoveryTemplateWithUserName & {
   recommendedEvents?: LivestreamDiscoveryEvents[]
}

export type LivestreamDiscoveryEvents = {
   image: string
   title: string
   shortTitle: string
   date: string
   link: string
}

export type RecordingDiscoveryTemplateModel = DiscoveryTemplateWithUserName

export type FeedbackDiscoveryTemplateModel = DiscoveryTemplateWithUserName
