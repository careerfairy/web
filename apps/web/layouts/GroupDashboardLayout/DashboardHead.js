import React from "react"
import PropTypes from "prop-types"
import SEO from "../../components/util/SEO"

const DashboardHead = ({ title, group }) => {
   const pageTitle = `${title} ${group?.universityName}`
   return <SEO title={pageTitle} />
}

DashboardHead.propTypes = {
   title: PropTypes.string.isRequired,
   group: PropTypes.object,
}

export default DashboardHead
