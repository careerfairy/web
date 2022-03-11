import { Identifiable } from "./commonTypes";

// CareerCenterData documents
export interface Group extends Identifiable {
   description?: string;
   groupId?: string;
   logoUrl?: string;
   partnerGroupIds?: string[];
   rank?: number;
   test?: boolean;
   universityCode?: string;
   universityId?: string;
   universityName?: string;
}
