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

export const engineeringHeroConfig: HeroSectionConfig = {
   title: "Engineering collection",
   subtitle:
      "Join live sessions with leading engineering companies packed with career tips and real stories from young engineers.",
   tags: [
      "Talk to real engineers",
      "Technical skills & more",
      "Live interaction",
   ],
   backgroundSx: {
      backgroundColor: "#9A9A9A",
   },
   titleColorSx: {
      color: (theme) => theme.brand.white[50],
   },
   subtitleColorSx: {
      color: (theme) => theme.brand.white[50],
   },
   tagChipSx: {
      backgroundColor: "rgba(221, 221, 221, 0.22)",
      color: (theme) => theme.brand.white[50],
      backdropFilter: "blur(32px)",
   },
   visualSupport: {
      left: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/engineering-hero-left-shape.svg?alt=media&token=516a5e84-949f-4ce7-80fd-bcf01464972a",
      right: "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/engineering-hero-right-shape.svg?alt=media&token=90e37ba9-3b28-406d-bb54-85e7578ac0cd",
   },
   impressionLocation: ImpressionLocation.panelsOverviewPage,
}

export const engineeringCompaniesConfig: ParticipatingCompaniesSectionConfig = {
   title: "Featured engineering companies",
   description:
      "Get exclusive insights from leading engineering companies across various industries. Learn about their technologies, engineering cultures, hiring processes, and what they look for in candidates.",
   interactionSource: InteractionSources.Engineering_Overview_Page,
}

export const engineeringSpeakersConfig: SpeakersSectionConfig = {
   title: "Meet our engineering experts!",
   description:
      "Connect with experienced engineers from leading companies who have navigated the competitive engineering landscape. Learn from their experiences, get insider tips on technical interviews, and discover what it really takes to break into engineering.",
}

export const engineeringRecordingsConfig: RecordingsSectionConfig = {
   title: "Can't wait for the insights?",
   description:
      "Get ahead of everyone with the insights from engineering live streams that recently happened",
   impressionLocation: ImpressionLocation.panelsOverviewPage,
}

export const engineeringRegisterNowConfig: RegisterNowSectionConfig = {
   heading: "Don't miss your chance!",
   description:
      "Get one step closer to your dream job by exploring the live streams available.",
   buttonText: "Explore live streams",
   imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/consulting_page_explore_more_image.png?alt=media&token=453f0eb2-94ff-4029-b99e-835abe5b0a65",
   imageAlt: "Engineering career illustration",
}

export const engineeringWhosThisForConfig: WhosThisForSectionConfig = {
   title: "Who's this for?",
   targetAudience: [
      {
         text: "You're a student or graduate exploring engineering",
         icon: CapIcon,
      },
      {
         text: "You're preparing for technical interviews",
         icon: JobsIcon,
      },
      {
         text: "Curious about day-to-day engineering work",
         icon: BombIcon,
      },
      {
         text: "You are wondering if engineering is right for you",
         icon: PinIcon,
      },
   ],
   imageUrl: "/panels/whos-this-for.png",
   imageAlt: "Whos this for section - Engineering",
   iconWrapperSx: {
      backgroundColor: (theme) => theme.brand.white[400],
   },
   iconSx: {
      color: (theme) => theme.brand.tq[600],
   },
}
