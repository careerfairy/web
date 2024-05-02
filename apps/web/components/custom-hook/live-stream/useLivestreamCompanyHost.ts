import { useMemo } from "react"

/*
 * Used to get the company host of the live stream
 *
 * @param {LivestreamPresenter} presenter
 * @returns {string | null} id of the live stream's company host or null if there are multiple companies or no company
 * */
const useLivestreamCompanyHost = (groupIds) => {
   return useMemo(() => {
      const companyGroups = groupIds.filter((group) => !group.universityCode)

      const isSingleCompany = companyGroups?.length === 1

      if (isSingleCompany) {
         return companyGroups[0]
      }

      return null
   }, [groupIds])
}

export default useLivestreamCompanyHost
