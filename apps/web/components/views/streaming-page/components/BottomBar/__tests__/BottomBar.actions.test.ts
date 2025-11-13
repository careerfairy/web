jest.mock("HOCs/AuthProvider", () => ({
   useAuth: jest.fn(() => ({})),
}))

jest.mock("components/views/streaming-page/context", () => ({
   useStreamingContext: jest.fn(() => ({})),
}))

jest.mock("components/custom-hook/streaming", () => ({
   useStreamIsLandscape: jest.fn(() => false),
   useStreamIsMobile: jest.fn(() => false),
}))

jest.mock("store/selectors/streamingAppSelectors", () => ({
   useIsSpyMode: jest.fn(() => false),
   useStreamHandRaiseEnabled: jest.fn(() => false),
}))

jest.mock(
   "components/custom-hook/streaming/hand-raise/useUserHandRaiseState",
   () => ({
      useUserHandRaiseState: jest.fn(() => ({ userCanJoinPanel: false })),
   })
)

jest.mock("../../StreamSetupWidget/permissions/CheckPermissions.tsx", () => ({
   CheckPermissions: () => null,
}))

jest.mock("../ActionsSpeedDial.tsx", () => ({
   ActionsSpeedDial: () => null,
}))

jest.mock("../AllActionComponents", () => ({
   AllActions: {
      Mic: () => null,
      Video: () => null,
      Share: () => null,
      Divider: () => null,
      "Q&A": () => null,
      Chat: () => null,
      SpeedDial: () => null,
      CTA: () => null,
      "Hand raise": () => null,
      Polls: () => null,
      Jobs: () => null,
      Settings: () => null,
      Admin: () => null,
      "Stop hand raise": () => null,
      Reactions: () => null,
      Phone: () => null,
   },
}))

import { bottomBarTestHelpers } from "../index"

const { getHostActionNames, getViewerActionNames } = bottomBarTestHelpers

describe("BottomBar host actions", () => {
   it("returns host mobile actions for non-admin host in regular mode", () => {
      expect(
         getHostActionNames({
            isMobile: true,
            isAdmin: false,
            isSpyMode: false,
            isAssistantMode: false,
         })
      ).toEqual([
         "Mic",
         "Video",
         "Share",
         "Divider",
         "Q&A",
         "Chat",
         "SpeedDial",
      ])
   })

   it("adds admin actions for host mobile admin", () => {
      expect(
         getHostActionNames({
            isMobile: true,
            isAdmin: true,
            isSpyMode: false,
            isAssistantMode: false,
         })
      ).toEqual([
         "Mic",
         "Video",
         "Share",
         "Divider",
         "Chat",
         "SpeedDial",
         "Divider",
         "Admin",
      ])
   })

   it("omits mic/video actions in spy mode on desktop", () => {
      expect(
         getHostActionNames({
            isMobile: false,
            isAdmin: false,
            isSpyMode: true,
            isAssistantMode: false,
         })
      ).toEqual([
         "Share",
         "CTA",
         "Divider",
         "Q&A",
         "Hand raise",
         "Polls",
         "Jobs",
         "Chat",
      ])
   })

   it("includes settings and admin actions for desktop admin host", () => {
      expect(
         getHostActionNames({
            isMobile: false,
            isAdmin: true,
            isSpyMode: false,
            isAssistantMode: false,
         })
      ).toEqual([
         "Mic",
         "Video",
         "Share",
         "CTA",
         "Divider",
         "Q&A",
         "Hand raise",
         "Polls",
         "Jobs",
         "Chat",
         "Divider",
         "Settings",
         "Divider",
         "Admin",
      ])
   })

   it("omits mic/video for a mobile host in spy mode", () => {
      expect(
         getHostActionNames({
            isMobile: true,
            isAdmin: false,
            isSpyMode: true,
            isAssistantMode: false,
         })
      ).toEqual(["Share", "Divider", "Q&A", "Chat", "SpeedDial"])
   })

   it("retains admin shortcuts for desktop host in spy mode", () => {
      expect(
         getHostActionNames({
            isMobile: false,
            isAdmin: true,
            isSpyMode: true,
            isAssistantMode: false,
         })
      ).toEqual([
         "Share",
         "CTA",
         "Divider",
         "Q&A",
         "Hand raise",
         "Polls",
         "Jobs",
         "Chat",
         "Divider",
         "Admin",
      ])
   })

   it("adds phone controls for assistant host in spy mode on desktop", () => {
      expect(
         getHostActionNames({
            isMobile: false,
            isAdmin: false,
            isSpyMode: true,
            isAssistantMode: true,
         })
      ).toEqual([
         "Phone",
         "Divider",
         "Share",
         "CTA",
         "Divider",
         "Q&A",
         "Hand raise",
         "Polls",
         "Jobs",
         "Chat",
      ])
   })

   it("places phone next to settings when assistant joins stream on desktop", () => {
      expect(
         getHostActionNames({
            isMobile: false,
            isAdmin: false,
            isSpyMode: false,
            isAssistantMode: true,
         })
      ).toEqual([
         "Mic",
         "Video",
         "Share",
         "CTA",
         "Divider",
         "Q&A",
         "Hand raise",
         "Polls",
         "Jobs",
         "Chat",
         "Divider",
         "Settings",
         "Phone",
      ])
   })

   it("prepends phone controls for assistant host in spy mode on mobile", () => {
      expect(
         getHostActionNames({
            isMobile: true,
            isAdmin: false,
            isSpyMode: true,
            isAssistantMode: true,
         })
      ).toEqual([
         "Phone",
         "Divider",
         "Share",
         "Divider",
         "Q&A",
         "Chat",
         "SpeedDial",
      ])
   })

   it("appends settings and phone for assistant host on mobile after joining", () => {
      expect(
         getHostActionNames({
            isMobile: true,
            isAdmin: false,
            isSpyMode: false,
            isAssistantMode: true,
         })
      ).toEqual([
         "Mic",
         "Video",
         "Share",
         "Divider",
         "Q&A",
         "Chat",
         "SpeedDial",
         "Divider",
         "Settings",
         "Phone",
      ])
   })
})

describe("BottomBar viewer actions", () => {
   it("returns mobile spectator actions while watching the stream", () => {
      expect(
         getViewerActionNames({
            isMobile: true,
            isViewerBroadcasting: true,
            handRaiseEnabled: true,
            userCanJoinPanel: false,
            isAdmin: false,
         })
      ).toEqual(["Divider", "Q&A", "Hand raise", "Polls", "Chat", "Reactions"])
   })

   it("returns mobile panelist controls when viewer joins the stage", () => {
      expect(
         getViewerActionNames({
            isMobile: true,
            isViewerBroadcasting: true,
            handRaiseEnabled: true,
            userCanJoinPanel: true,
            isAdmin: false,
         })
      ).toEqual([
         "Mic",
         "Video",
         "Divider",
         "Q&A",
         "Polls",
         "SpeedDial",
         "Divider",
         "Stop hand raise",
      ])
   })

   it("includes admin controls for desktop viewers", () => {
      expect(
         getViewerActionNames({
            isMobile: false,
            isViewerBroadcasting: true,
            handRaiseEnabled: false,
            userCanJoinPanel: false,
            isAdmin: true,
         })
      ).toEqual([
         "Divider",
         "Q&A",
         "Polls",
         "Chat",
         "Reactions",
         "Divider",
         "Admin",
      ])
   })

   it("returns spectator actions when the viewer is not broadcasting", () => {
      expect(
         getViewerActionNames({
            isMobile: true,
            isViewerBroadcasting: false,
            handRaiseEnabled: true,
            userCanJoinPanel: false,
            isAdmin: false,
         })
      ).toEqual(["Q&A", "Hand raise", "Polls", "Chat", "Reactions"])
   })

   it("returns desktop panelist controls when viewer joins the stage", () => {
      expect(
         getViewerActionNames({
            isMobile: false,
            isViewerBroadcasting: true,
            handRaiseEnabled: true,
            userCanJoinPanel: true,
            isAdmin: false,
         })
      ).toEqual([
         "Mic",
         "Video",
         "Divider",
         "Q&A",
         "Polls",
         "Chat",
         "Divider",
         "Settings",
         "Stop hand raise",
      ])
   })

   it("omits hand raise option when feature is disabled", () => {
      expect(
         getViewerActionNames({
            isMobile: true,
            isViewerBroadcasting: true,
            handRaiseEnabled: false,
            userCanJoinPanel: false,
            isAdmin: false,
         })
      ).toEqual(["Divider", "Q&A", "Polls", "Chat", "Reactions"])
   })

   it("adds admin shortcut for spectators with admin rights", () => {
      expect(
         getViewerActionNames({
            isMobile: false,
            isViewerBroadcasting: false,
            handRaiseEnabled: true,
            userCanJoinPanel: false,
            isAdmin: true,
         })
      ).toEqual([
         "Q&A",
         "Hand raise",
         "Polls",
         "Chat",
         "Reactions",
         "Divider",
         "Admin",
      ])
   })
})
