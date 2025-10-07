import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import { ImpressionLocation } from "@careerfairy/shared-lib/livestreams"
import { JobsIcon } from "components/views/common/icons/JobsIcon"
import { BombIcon } from "../../../panels/page/components/BombIcon"
import { CapIcon } from "../../../panels/page/components/CapIcon"
import { PinIcon } from "../../../panels/page/components/PinIcon"
import {
   HeroSectionConfig,
   ParticipatingCompaniesSectionConfig,
   RecordingsSectionConfig,
   RegisterNowSectionConfig,
   SpeakersSectionConfig,
   WhatYouTakeAwaySectionConfig,
   WhosThisForSectionConfig,
} from "../index"

export const consultingHeroConfig: HeroSectionConfig = {
   title: "Consulting collection",
   subtitle:
      "Join live sessions with Europe's top consulting firms packed with career tips and real stories from young consultants.",
   tags: ["Talk to real consultants", "Cases, tips & more", "Live interaction"],
   backgroundSx: {
      background:
         "linear-gradient(0deg, #F0F4FF 0%, #F0F4FF 100%), linear-gradient(104deg, #F5F7FF 0%, #F5F7FF 100%), linear-gradient(169deg, rgba(98, 117, 255, 0.13) 1.77%, rgba(70, 90, 230, 0.00) 98.23%), linear-gradient(25deg, rgba(70, 90, 230, 0.00) -0.66%, rgba(98, 117, 255, 0.48) 141.07%), #4A5BAD",
   },
   titleColorSx: {
      color: "#4A72C8",
   },
   subtitleColorSx: {
      color: "neutral.700",
   },
   tagChipSx: {
      backgroundColor: "rgba(136, 136, 136, 0.22)",
      color: "neutral.700",
   },
   visualSupport: {
      left: "/panels/header-left-visual-support.svg",
      right: "/panels/header-right-visual-support.svg",
   },
   impressionLocation: ImpressionLocation.panelsOverviewPage,
}

export const consultingCompaniesConfig: ParticipatingCompaniesSectionConfig = {
   title: "Featured consulting firms",
   description:
      "Get exclusive insights from leading consulting firms including MBB (McKinsey, BCG, Bain) and top-tier boutique consultancies. Learn about their unique cultures, hiring processes, and what they look for in candidates.",
   interactionSource: InteractionSources.Consulting_Overview_Page,
}

export const consultingSpeakersConfig: SpeakersSectionConfig = {
   title: "Meet our consulting experts!",
   description:
      "Connect with seasoned consultants from top-tier firms who have navigated the competitive consulting landscape. Learn from their experiences, get insider tips on case interviews, and discover what it really takes to break into consulting.",
}

export const consultingRecordingsConfig: RecordingsSectionConfig = {
   title: "Can't wait for the insights?",
   description:
      "Get ahead of everyone with the insights from consulting live streams that recently happened",
   impressionLocation: ImpressionLocation.panelsOverviewPage,
}

export const consultingRegisterNowConfig: RegisterNowSectionConfig = {
   heading: "Don't miss your chance!",
   description:
      "Get one step closer to your dream job by exploring the live streams available.",
   buttonText: "Explore live streams",
   imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/consulting_page_explore_more_image.png?alt=media&token=453f0eb2-94ff-4029-b99e-835abe5b0a65",
   imageAlt: "Consulting career illustration",
}

export const consultingWhosThisForConfig: WhosThisForSectionConfig = {
   title: "Who's this for?",
   targetAudience: [
      {
         text: "You're a student or graduate exploring consulting",
         icon: CapIcon,
      },
      {
         text: "You're preparing for case interviews",
         icon: JobsIcon,
      },
      {
         text: "Curious about day-to-day consulting work",
         icon: BombIcon,
      },
      {
         text: "You are wondering if consulting is right for you",
         icon: PinIcon,
      },
   ],
   imageUrl: "/panels/whos-this-for.png",
   imageAlt: "Whos this for section - Consulting",
   iconWrapperSx: {
      backgroundColor: (theme) => theme.brand.purple[50],
   },
   iconSx: {
      color: (theme) => theme.brand.purple[800],
   },
}

export const consultingWhatYouTakeAwayConfig: WhatYouTakeAwaySectionConfig = {
   title: "What do you take away?",
   takeaways: [
      "A replay link straight to your inbox",
      "Exclusive consulting case study frameworks and templates",
      "Priority access to future consulting-focused sessions",
      "Networking opportunities with consulting professionals",
   ],
}
