import {
   FirebaseGroupRepository,
   IGroupRepository,
} from "@careerfairy/shared-lib/dist/groups/GroupRepository"

export interface IGroupScriptsRepository extends IGroupRepository {}

export class GroupScriptsRepository
   extends FirebaseGroupRepository
   implements IGroupScriptsRepository {}
