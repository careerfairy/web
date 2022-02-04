import { Timestamp } from "@firebase/firestore-types";

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
