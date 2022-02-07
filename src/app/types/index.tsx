import { Timestamp } from "@firebase/firestore-types";
import { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { MediaDeviceInfo } from "agora-rtc-sdk";

export interface StreamData {
   author: {
      email: string;
      groupId: string;
   };
   backgroundImageUrl: string;
   company: string;
   companyId: string;
   companyLogoUrl: string;

   currentSpeakerId: string;
   groupIds: string[];
   hidden: boolean;
   id: string;
   language: {
      code: string;
      name: string;
   };
   screenSharerId: string;
   registeredUsers: string[];
   talentPool: string[];
   participatingStudents: string[];
   speakers: object[];
   lastUpdated: Timestamp;
   start: Timestamp;
   created: Timestamp;
   summary: string;
   mode?: "presentation" | "desktop";
   targetCategories: object;
   test: boolean;
   title: string;
   type: string;
}

export interface LocalStream {
   uid: string;
   isAudioPublished: boolean;
   isVideoPublished: boolean;
   isLocal: boolean;
   audioTrack?: IMicrophoneAudioTrack;
   videoTrack?: ICameraVideoTrack;
   videoMuted?: boolean;
}

export interface LocalMediaHandlers {
   initializeLocalAudioStream: () => Promise<any>;
   initializeLocalVideoStream: () => Promise<any>;
   closeLocalCameraTrack: () => Promise<any>;
   closeLocalMicrophoneTrack: () => Promise<any>;
}
export interface MediaControls {
   audioSource: MediaDeviceInfo["deviceId"];
   videoSource: MediaDeviceInfo["deviceId"];
   updateAudioSource: (deviceId: MediaDeviceInfo["deviceId"]) => Promise<any>;
   updateVideoSource: (deviceId: MediaDeviceInfo["deviceId"]) => Promise<any>;
}

export interface DeviceList {
   audioInputList: DeviceOption[];
   audioOutputList: DeviceOption[];
   videoDeviceList: DeviceOption[];
}

export interface DeviceOption {
   value: MediaDeviceInfo["deviceId"];
   text: MediaDeviceInfo["label"] | string;
}
