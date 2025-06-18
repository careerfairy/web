import { DocRef } from "@careerfairy/shared-lib/dist/BaseFirebaseRepository"
import { Identifiable } from "@careerfairy/shared-lib/dist/commonTypes"

export type DataWithRef<
   TWithRef extends boolean,
   TData extends Identifiable
> = TWithRef extends true ? TData & DocRef : TData

export type WithRef<TData extends Identifiable> = TData & DocRef
