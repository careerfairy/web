import React from 'react';
import Head from "next/head";
import PropTypes from 'prop-types';

const DashboardHead = ({title, group, isCompany}) => {
    const pageTitle = `${title} ${!group ? "" : isCompany ? group?.companyName : group?.universityName}`
    return (
        <Head>
            <title>{pageTitle}</title>
        </Head>
    );
};

DashboardHead.propTypes = {
  group: PropTypes.object,
  isCompany: PropTypes.bool,
  title: PropTypes.string.isRequired
}

export default DashboardHead;
