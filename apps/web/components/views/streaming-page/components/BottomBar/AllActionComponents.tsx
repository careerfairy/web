import { Divider } from "@mui/material"
import {
   ActionButtonProps,
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

export const AllActions = {
   "Hand raise": (props: ActionButtonProps) => (
      <HandRaiseActionButton {...props} key="Hand raise" />
   ),
   "Q&A": (props: ActionButtonProps) => <QaActionButton {...props} key="Q&A" />,
   Polls: (props: ActionButtonProps) => (
      <PollActionButton {...props} key="Polls" />
   ),
   Jobs: (props: ActionButtonProps) => (
      <JobsActionButton {...props} key="Jobs" />
   ),
   Reactions: (props: ActionButtonProps) => (
      <ReactionsActionButton {...props} key="Reactions" />
   ),
   Chat: (props: ActionButtonProps) => (
      <ChatActionButton {...props} key="Chat" />
   ),
   Settings: (props: ActionButtonProps) => (
      <SettingsActionButton {...props} key="Settings" />
   ),
   CTA: (props: ActionButtonProps) => <CTAActionButton {...props} key="CTA" />,
   Share: (props: ActionButtonProps) => (
      <ShareActionButton {...props} key="Share" />
   ),
   Mic: (props: ActionButtonProps) => <MicActionButton {...props} key="Mic" />,
   Video: (props: ActionButtonProps) => (
      <VideoActionButton {...props} key="Video" />
   ),
   Divider: () => <Divider orientation="vertical" flexItem />,
} as const

export type ActionName = keyof typeof AllActions

export const ActionTooltips = {
   "Hand Raise": "Hand Raise",
   "Q&A": "Questions and Answers",
   Polls: "Polls",
   Jobs: "Linked Jobs",
   Reactions: "Reactions",
   Chat: "Chat",
   Settings: "Settings",
   CTA: "Send call to action",
   Share: "Share content",
   StopShare: "Stop sharing",
   MicMute: "Mute",
   MicUnmute: "Unmute",
   VideoTurnOff: "Switch camera off",
   VideoTurnOn: "Switch camera on",
} as const
