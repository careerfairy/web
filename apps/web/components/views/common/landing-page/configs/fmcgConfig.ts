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
   WhosThisForSectionConfig,
} from "../index"

export const fmcgHeroConfig: HeroSectionConfig = {
   title: "FMCG collection",
   subtitle:
      "Join live sessions with Europe's leading FMCG companies packed with career insights and real stories from industry professionals.",
   tags: [
      "Talk to FMCG professionals",
      "Career tips & insights",
      "Live interaction",
   ],
   backgroundSx: {
      background:
         "linear-gradient(0deg, #FFF8E1 0%, #FFF8E1 100%), linear-gradient(104deg, #FFF9E5 0%, #FFF9E5 100%), linear-gradient(169deg, rgba(249, 168, 37, 0.13) 1.77%, rgba(249, 168, 37, 0.00) 98.23%), linear-gradient(25deg, rgba(249, 168, 37, 0.00) -0.66%, rgba(249, 168, 37, 0.48) 141.07%), #F9A825",
   },
   titleColorSx: {
      color: "#E29313",
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

export const fmcgCompaniesConfig: ParticipatingCompaniesSectionConfig = {
   title: "Featured FMCG companies",
   description:
      "Get exclusive insights from leading consumer goods companies. Learn about their brands, company culture, career opportunities, and what they look for in candidates.",
   interactionSource: InteractionSources.FMCG_Overview_Page,
}

export const fmcgSpeakersConfig: SpeakersSectionConfig = {
   title: "Meet our FMCG experts!",
   description:
      "Connect with experienced professionals from leading consumer goods companies who have built successful careers in FMCG. Learn from their experiences, get insider tips on interviews, and discover what it really takes to thrive in the industry.",
}

export const fmcgRecordingsConfig: RecordingsSectionConfig = {
   title: "Can't wait for the insights?",
   description:
      "Get ahead of everyone with the insights from FMCG live streams that recently happened",
   impressionLocation: ImpressionLocation.panelsOverviewPage,
}

export const fmcgRegisterNowConfig: RegisterNowSectionConfig = {
   heading: "Don't miss your chance!",
   description:
      "Get one step closer to your dream job by exploring the live streams available.",
   buttonText: "Explore live streams",
   imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/consulting_page_explore_more_image.png?alt=media&token=453f0eb2-94ff-4029-b99e-835abe5b0a65",
   imageAlt: "FMCG career illustration",
}

export const fmcgWhosThisForConfig: WhosThisForSectionConfig = {
   title: "Who's this for?",
   targetAudience: [
      {
         text: "You're a student or graduate interested in FMCG",
         icon: CapIcon,
      },
      {
         text: "You're preparing for interviews with consumer goods companies",
         icon: JobsIcon,
      },
      {
         text: "Curious about marketing, brand management, or supply chain roles",
         icon: BombIcon,
      },
      {
         text: "You are wondering if FMCG is right for you",
         icon: PinIcon,
      },
   ],
   imageUrl: "/panels/whos-this-for.png",
   imageAlt: "Whos this for section - FMCG",
   iconWrapperSx: {
      backgroundColor: "#FFF8E1",
   },
   iconSx: {
      color: "#E29313",
   },
}
