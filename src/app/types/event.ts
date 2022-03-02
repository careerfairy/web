import { Identifiable } from "./commonTypes";
import { Timestamp } from "@firebase/firestore-types";

export interface LiveStreamEvent extends Identifiable {
   author?: {
      email: string;
      groupId: string;
   };
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
   start?: Timestamp;
   startDate?: Date;
}
