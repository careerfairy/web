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
   Follow: "Featured_Company_Page_View",
   Page_View: "Featured_Company_Follow",
} as const

export type GroupEventActionType =
   (typeof GroupEventActions)[keyof typeof GroupEventActions]

export const InteractionSources = {
   Portal_Page_View_Featured_Company: "Portal_Page_View_Featured_Company",
   Companies_Page_View_Featured_Company: "Companies_Page_View_Featured_Company",
   Companies_Page_View_Company: "Companies_Page_View_Company",
   Companies_Page_Follow_Company: "Companies_Page_Follow_Company",
   Company_Page: "Company_Page",
} as const
