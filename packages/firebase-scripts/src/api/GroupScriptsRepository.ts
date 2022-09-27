import {
   GroupFunctionsRepository,
   IGroupFunctionsRepository,
} from "@careerfairy/functions/dist/lib/GroupFunctionsRepository"

export interface IGroupScriptsRepository extends IGroupFunctionsRepository {}

export class GroupScriptsRepository
   extends GroupFunctionsRepository
   implements IGroupScriptsRepository
{
   async getAllGroups(withRef?: boolean) {}
}
