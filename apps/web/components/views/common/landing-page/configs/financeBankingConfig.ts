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

export const financeBankingHeroConfig: HeroSectionConfig = {
   title: "Finance & Banking collection",
   subtitle:
      "Join live sessions with leading financial institutions and hear from experienced professionals about careers in finance and banking.",
   tags: [
      "Talk to finance experts",
      "Career insights & tips",
      "Live interaction",
   ],
   backgroundSx: {
      background:
         "linear-gradient(0deg, #E8F5E9 0%, #E8F5E9 100%), linear-gradient(104deg, #F1F8F4 0%, #F1F8F4 100%), linear-gradient(169deg, rgba(27, 154, 33, 0.13) 1.77%, rgba(46, 125, 50, 0.00) 98.23%), linear-gradient(25deg, rgba(46, 125, 50, 0.00) -0.66%, rgba(27, 154, 33, 0.48) 141.07%), #1B9A21",
   },
   titleColorSx: {
      color: "#1B9A21",
   },
   subtitleColorSx: {
      color: "neutral.700",
   },
   tagChipSx: {
      backgroundColor: "rgba(136, 136, 136, 0.22)",
      color: "neutral.700",
   },
   visualSupport: {
      left: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/financebanking-hero-left-shape.svg?alt=media&token=44f614ca-8335-4151-868e-27900cd7731b",
      right: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/financebanking-hero-right-shape.svg?alt=media&token=4b4d81d0-bdef-466f-aafa-3c888e2a401d",
   },
   impressionLocation: ImpressionLocation.panelsOverviewPage,
}

export const financeBankingCompaniesConfig: ParticipatingCompaniesSectionConfig =
   {
      title: "Featured financial institutions",
      description:
         "Get exclusive insights from top banks, investment firms, and fintech companies. Learn about career paths in corporate banking, investment banking, asset management, and emerging fintech sectors.",
      interactionSource: InteractionSources.Finance_Banking_Overview_Page,
      visualSupport: {
         left: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/financebanking-companies-left-shape.svg?alt=media&token=50bfe377-8ee3-4a28-9d06-5aee3387b076",
         right: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/financebanking-companies-right-shape.svg?alt=media&token=b7e908d2-c00a-49aa-9469-dc4a63af62ef",
      },
   }

export const financeBankingSpeakersConfig: SpeakersSectionConfig = {
   title: "Meet our finance experts!",
   description:
      "Connect with experienced professionals from leading financial institutions who have built successful careers in finance and banking. Learn from their experiences, get insider tips on interviews, and discover what it really takes to break into the finance industry.",
   visualSupport: {
      left: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/financebanking-speakers-left-shape.svg?alt=media&token=8d94cd6b-fe9f-4f08-92c4-6dd7d86f69d1",
      right: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/financebanking-speakers-right-shape.svg?alt=media&token=ea695cf6-f119-44f0-82e8-f6bcc4bcbba8",
   },
}

export const financeBankingRecordingsConfig: RecordingsSectionConfig = {
   title: "Can't wait for the insights?",
   description:
      "Get ahead of everyone with the insights from finance & banking live streams that recently happened",
   impressionLocation: ImpressionLocation.panelsOverviewPage,
}

export const financeBankingRegisterNowConfig: RegisterNowSectionConfig = {
   heading: "Don't miss your chance!",
   description:
      "Get one step closer to your dream job by exploring the live streams available.",
   buttonText: "Explore live streams",
   imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/consulting_page_explore_more_image.png?alt=media&token=453f0eb2-94ff-4029-b99e-835abe5b0a65",
   imageAlt: "Finance & Banking career illustration",
}

export const financeBankingWhosThisForConfig: WhosThisForSectionConfig = {
   title: "Who's this for?",
   targetAudience: [
      {
         text: "You're a student or graduate exploring finance careers",
         icon: CapIcon,
      },
      {
         text: "You're preparing for finance interviews",
         icon: JobsIcon,
      },
      {
         text: "Curious about day-to-day work in banking",
         icon: BombIcon,
      },
      {
         text: "You are wondering if finance is right for you",
         icon: PinIcon,
      },
   ],
   imageUrl: "/panels/whos-this-for.png",
   imageAlt: "Whos this for section - Finance & Banking",
   iconWrapperSx: {
      backgroundColor: "#E8F5E9",
   },
   iconSx: {
      color: "#1B9A21",
   },
}
