import {
   BigQueryUserResponse,
   GetUserFilters,
} from "@careerfairy/shared-lib/dist/bigQuery/types"

export interface IGroupAdminFirebaseRepository {
   getUsers(
      page: number,
      limit: number | false,
      orderBy: string,
      sortOrder: "DESC" | "ASC",
      filters: GetUserFilters
   ): Promise<BigQueryUserResponse[]>
}
