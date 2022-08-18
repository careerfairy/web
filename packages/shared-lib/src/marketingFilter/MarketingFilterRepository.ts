import firebase from "firebase/compat/app"
import { MarketingFilter } from "./marketingFilter"

export interface IMarketingFilterRepository {
   getAllMarketingFilters(): Promise<MarketingFilter[]>
}

export class FirebaseMarketingFilterRepository
   implements IMarketingFilterRepository
{
   constructor(private readonly firestore: firebase.firestore.Firestore) {}

   getAllMarketingFilters(): Promise<MarketingFilter[]> {}
}
