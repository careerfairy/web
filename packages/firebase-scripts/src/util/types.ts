import { Identifiable } from "@careerfairy/shared-lib/dist/commonTypes"
import { DocRef } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"

export type DataWithRef<
   TWithRef extends boolean,
   TData extends Identifiable
> = TWithRef extends true ? TData & DocRef<TData> : TData
