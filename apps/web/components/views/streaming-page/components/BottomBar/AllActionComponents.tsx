import {
   SettingsActionButton,
   JobsActionButton,
   ReactionsActionButton,
   ChatActionButton,
   PollActionButton,
   HandRaiseActionButton,
   QaActionButton,
   CTAActionButton,
   ShareActionButton,
   MicActionButton,
   VideoActionButton,
} from "../Buttons"

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
   Divider: null,
} as const

export type ActionName = keyof typeof AllActions
