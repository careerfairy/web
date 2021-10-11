import React from "react";
import Head from "next/head";
import PropTypes from "prop-types";

const DashboardHead = ({ title, group }) => {
   const pageTitle = `${title} ${group?.universityName}`;
   return (
      <Head>
         <title>{pageTitle}</title>
      </Head>
   );
};

DashboardHead.propTypes = {
   title: PropTypes.string.isRequired,
   group: PropTypes.object,
};

export default DashboardHead;
