import { Identifiable } from "./commonTypes";

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
}
