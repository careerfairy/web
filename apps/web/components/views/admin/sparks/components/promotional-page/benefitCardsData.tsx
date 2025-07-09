import { AnalyticsMockup } from "./AnalyticsMockup"
import { EngagementMockup } from "./EngagementMockup"
import { LivestreamMockup } from "./LivestreamMockup"
import { StudentMockup } from "./StudentMockup"

export const benefitCardsData = [
   {
      id: "students",
      mockupContent: <StudentMockup />,
      title: "Get in front of the right students",
      description:
         "Target by study field, degree level, and more to engage students and build your pipeline",
   },
   {
      id: "engagement",
      mockupContent: <EngagementMockup />,
      title: "Easy to make, hard to ignore",
      description:
         "Quick to create, no big production needed. Authentic videos that perform best with Gen Z",
   },
   {
      id: "analytics",
      mockupContent: <AnalyticsMockup />,
      title: "Understand what&apos;s working",
      description:
         "Track views, likes and shares in real time to double down on what students actually care about",
   },
   {
      id: "livestreams",
      mockupContent: <LivestreamMockup />,
      title: "Get more out of your Live Streams",
      description:
         "Use Sparks to warm up student interest early, so more of them join your events and apply afterward",
   },
]
