import React, { useMemo } from "react"
import PropTypes from "prop-types"
import SEO from "../../components/util/SEO"
import { useGroup } from "./index"

const DashboardHead = ({ title }) => {
   const { group } = useGroup()

   const pageTitle = useMemo(() => {
      let result = title

      if (group?.universityName) {
         result += ` ${group.universityName}`
      }

      return result
   }, [group?.universityName, title])

   return <SEO title={pageTitle} />
}

DashboardHead.propTypes = {
   title: PropTypes.string.isRequired,
   group: PropTypes.object,
}

export default DashboardHead
