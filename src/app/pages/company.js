import { Fragment, useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { withFirebase } from '../data/firebase'

import CompanyLandingPage from '../components/views/company-profile/CompanyLandingPage';
import CompanyDiscoverPage from '../components/views/company-profile/CompanyDiscoverPage';
import CompanyWatchPage from '../components/views/company-profile/CompanyWatchPage';
import CompanyMeetPage from '../components/views/company-profile/CompanyMeetPage';

import Loader from '../components/views/loader/Loader';

function CompanyProfile(props) {    
    const router = useRouter();
    const { id } = router.query;
    const [company, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const sectionTwoRef = useRef(null);
    const sectionThreeRef = useRef(null);

    function scrollToRef(ref) {
        ref.current.scrollIntoView({
            behavior: 'smooth'
        });
    }

    useEffect(() => {
        if (id) {
            setLoading(true);
            props.firebase.getCompanyById(id).then( querySnapshot => {
                let company = querySnapshot.data();
                company.id = querySnapshot.id;
                setCompanyData(company);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return <Loader/>;
    }

    if (company.companyId === 'Axpo') {
        return (
            <Fragment>
                <div className="sectionOne">
                    <CompanyLandingPage company={company} scrollToSecond={() => scrollToRef(sectionTwoRef)} scrollToThird={() => scrollToRef(sectionThreeRef)}/>
                </div>
                <div className="section" ref={sectionTwoRef}>
                    <CompanyDiscoverPage company={company}/>
                </div>
                <div className="section" ref={sectionThreeRef}>
                    <CompanyWatchPage company={company}/>
                </div>
                <div className="section">
                    <CompanyMeetPage company={company}/>
                </div>
                <style jsx>{`
                    .sectionOne {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        min-height: 800px;
                    }
                `}</style>
            </Fragment>
        );
    } else {
        return (
            <Fragment>
                <div className="sectionOne">
                    <CompanyLandingPage {...props} company={company} scrollToSecond={() => scrollToRef(sectionTwoRef)} scrollToThird={() => scrollToRef(sectionThreeRef)}/>
                </div>
                <div className="section" ref={sectionTwoRef}>
                    <CompanyDiscoverPage {...props} company={company}/>
                </div>
                <div className="section" ref={sectionThreeRef}>
                    <CompanyWatchPage {...props} company={company}/>
                </div>
                <style jsx>{`
                    .sectionOne {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        min-height: 800px;
                    }
                `}</style>
            </Fragment>
        );
    }
}

export default withFirebase(CompanyProfile);