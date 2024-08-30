import { Step } from "react-joyride"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   panelSpotlight: {
      borderRadius: "16px",
   },
})

export const TutorialSteps = {
   ACTION_BAR_1: "ACTION_BAR_1",
   Q_AND_A_1: "Q_AND_A_1",
   Q_AND_A_2: "Q_AND_A_2",
   Q_AND_A_3: "Q_AND_A_3",
   HAND_RAISE_1: "HAND_RAISE_1",
   HAND_RAISE_2: "HAND_RAISE_2",
   HAND_RAISE_3: "HAND_RAISE_3",
   POLLS_1: "POLLS_1",
   POLLS_2: "POLLS_2",
   POLLS_3: "POLLS_3",
   JOBS: "JOBS",
   CHAT: "CHAT",
} as const

export const TutorialStepsInfo: Step[] = [
   {
      target: "#action-bar",
      content:
         "This is your action bar. Your most important actions are going to be concentrated here for easy access at all times.",
      title: "Action bar",
      disableBeacon: true,
      data: { id: TutorialSteps.ACTION_BAR_1 },
   },
   {
      target: "#qanda-button",
      title: "Questions and answers",
      content:
         "Let's start with the Q&A, where you can find your audience questions! Let's give it a look.",
      disableBeacon: true,
      data: { id: TutorialSteps.Q_AND_A_1 },
   },
   {
      target: "#qanda-panel",
      title: "Questions and answers",
      placement: "left",
      content:
         "Here you can find all the questions that your audience left and upvoted beforehand, as well as the ones you already answered!",
      disableBeacon: true,
      styles: { spotlight: styles.panelSpotlight },
      data: { id: TutorialSteps.Q_AND_A_2 },
   },
   {
      target: "#highlight-question-button",
      title: "Questions and answers",
      placement: "left",
      content:
         "Highlight a question when answering it, so that all viewers can keep track of what you're referring to! This way it's easier for them to engage and follow your presentation.",
      disableBeacon: true,
      data: { id: TutorialSteps.Q_AND_A_3 },
   },
   {
      target: "#hand-raise-button",
      title: "Hand raise",
      content:
         "Feel like having deeper conversations? Hand raise allows your audience to request to join with audio and video and have a direct conversation.",
      disableBeacon: true,
      data: { id: TutorialSteps.HAND_RAISE_1 },
   },
   {
      target: "#hand-raise-panel",
      title: "Hand raise",
      placement: "left",
      content:
         "This option will only show up to your audience once you activate it!",
      disableBeacon: true,
      styles: { spotlight: styles.panelSpotlight },
      data: { id: TutorialSteps.HAND_RAISE_2 },
   },
   {
      target: "#hand-raise-panel",
      title: "Hand raise",
      placement: "left",
      content:
         "Once active, a status banner will appear to remind you that the hand raise feature is on, allowing your audience to request to join. You can deactivate this feature anytime.",
      disableBeacon: true,
      styles: { spotlight: styles.panelSpotlight },
      data: { id: TutorialSteps.HAND_RAISE_3 },
   },
   {
      target: "#polls-button",
      title: "Polls",
      content:
         "Make your live stream interactive with polls, get instant feedback and spark conversations!",
      disableBeacon: true,
      data: { id: TutorialSteps.POLLS_1 },
   },
   {
      target: "#polls-panel",
      title: "Polls",
      placement: "left",
      content:
         "Creating polls is quick and easy! Simply enter your question and all the options that you want to give users to choose from!",
      disableBeacon: true,
      styles: { spotlight: styles.panelSpotlight },
      data: { id: TutorialSteps.POLLS_2 },
   },
   {
      target: "#polls-panel",
      title: "Polls",
      placement: "left",
      content:
         "After creating it, your poll is going to be displayed here. Once you feel it's time to start the interaction you can simply click on ”Start poll” to make it visible to your audience!",
      disableBeacon: true,
      styles: { spotlight: styles.panelSpotlight },
      data: { id: TutorialSteps.POLLS_3 },
   },
   {
      target: "#jobs-button",
      title: "Jobs",
      content:
         "Here you can easily find all the job openings that are linked to your live stream and promoted to your audience.",
      disableBeacon: true,
      data: { id: TutorialSteps.JOBS },
   },
   {
      target: "#chat-button",
      title: "Chat",
      content: "Easily interact and see what your audience is talking about!",
      disableBeacon: true,
      data: { id: TutorialSteps.CHAT },
   },
]
