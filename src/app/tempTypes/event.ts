import { Identifiable } from "./commonTypes";
import { Timestamp } from "@firebase/firestore-types";

export interface LiveStreamEventsdf extends Identifiable {
   author?: {
      email: string;
      groupId: string;
   };
   start?: Timestamp;
   startDate: Date;
   summary?: string;
   backgroundImageUrl?: string;
   company?: string;
   companyId?: string;
   companyLogoUrl?: string;
   created?: string;
   currentSpeakerId?: string;
   duration?: number;
   groupIds?: string[];
   interestsIds?: string[];
   isRecording?: boolean;
   language?: {
      code?: string;
      name?: string;
   };
   talentPool?: string[];
   test?: boolean;
   title?: string;
   type?: string;
}
