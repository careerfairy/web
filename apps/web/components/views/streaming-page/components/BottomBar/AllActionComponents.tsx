import {
   CTAActionButton,
   ChatActionButton,
   HandRaiseActionButton,
   JobsActionButton,
   MicActionButton,
   PollActionButton,
   QaActionButton,
   ReactionsActionButton,
   SettingsActionButton,
   ShareActionButton,
   VideoActionButton,
} from "../Buttons"
import { StopHandRaisingButton } from "../Buttons/StopHandRaisingButton"

export const AllActions = {
   "Hand raise": <HandRaiseActionButton key="Hand raise" />,
   "Q&A": <QaActionButton key="Q&A" />,
   Polls: <PollActionButton key="Polls" />,
   Jobs: <JobsActionButton key="Jobs" />,
   Reactions: <ReactionsActionButton key="Reactions" />,
   Chat: <ChatActionButton key="Chat" />,
   Settings: <SettingsActionButton key="Settings" />,
   CTA: <CTAActionButton key="CTA" />,
   Share: <ShareActionButton key="Share" />,
   Mic: <MicActionButton key="Mic" />,
   Video: <VideoActionButton key="Video" />,
   "Stop hand raise": <StopHandRaisingButton key="Stop hand raise" />,
   Divider: null,
} as const

export type ActionName = keyof typeof AllActions
