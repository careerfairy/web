export type GroupClientEventsPayload = {
   events: GroupEventClient[]
}

export type GroupEventClient = {
   authId: string | null
   visitorId: string | null
   stringTimestamp: string
   utm_source: string | null
   utm_medium: string | null
   utm_campaign: string | null
   utm_term: string | null
   utm_content: string | null
   actionType: GroupEventActionType
   interactionSource: string | null
   groupId: string
}

export type GroupEventServer = Omit<GroupEventClient, "stringTimestamp"> & {
   timestamp: Date
   countryCode: string
}

export const GroupEventActions = {
   Follow: "Follow",
   Page_View: "Page_View",
   Impression: "Impression",
} as const

export type GroupEventActionType =
   (typeof GroupEventActions)[keyof typeof GroupEventActions]

export const InteractionSources = {
   Portal_Page_Featured_Company: "Portal_Page_Featured_Company",
   Companies_Overview_Page: "Companies_Overview_Page",
   Company_Page: "Company_Page",
   Live_Stream_Details: "Live_Stream_Details",
   Streaming_Page: "Streaming_Page",
   Talent_Profile: "Talent_Profile",
   Sparks_Feed: "Sparks_Feed",
   Talent_Guide: "Talent_Guide",
} as const

export type InteractionSourcesType =
   (typeof InteractionSources)[keyof typeof InteractionSources]
