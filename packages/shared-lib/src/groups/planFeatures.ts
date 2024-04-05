export type PlanFeatureItem = {
   enabled: boolean
   name: string
}

export const PREMIUM_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "Unlimited Sparks slots",
   },
   {
      enabled: true,
      name: "Unlimited featured employees",
   },
   {
      enabled: true,
      name: "External promotion",
   },
   {
      enabled: true,
      name: "Engagement analytics",
   },
   {
      enabled: true,
      name: "Audience analytics",
   },
   {
      enabled: true,
      name: "Competitor analytics",
   },
   {
      enabled: true,
      name: "Dedicated account manager",
   },
   {
      enabled: true,
      name: "11'000 - 13’000 expected target reach",
   },
]
export const ADVANCED_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "10 Sparks slots",
   },
   {
      enabled: true,
      name: "Up to 7 featured employees",
   },
   {
      enabled: true,
      name: "External promotion",
   },
   {
      enabled: true,
      name: "Engagement analytics",
   },
   {
      enabled: false,
      name: "Audience analytics",
   },
   {
      enabled: false,
      name: "Competitor analytics",
   },
   {
      enabled: true,
      name: "Dedicated account manager",
   },
   {
      enabled: true,
      name: "7'000 - 8’000 expected target reach",
   },
]
export const ESSENTIAL_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "6 Sparks slots",
   },
   {
      enabled: true,
      name: "Up to 4 featured employees",
   },
   {
      enabled: false,
      name: "External promotion",
   },
   {
      enabled: true,
      name: "Engagement analytics",
   },
   {
      enabled: false,
      name: "Audience analytics",
   },
   {
      enabled: false,
      name: "Competitor analytics",
   },
   {
      enabled: false,
      name: "Dedicated account manager",
   },
   {
      enabled: true,
      name: "4'000 - 5’000 expected target reach",
   },
]
