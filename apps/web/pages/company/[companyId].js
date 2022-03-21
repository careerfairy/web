import { Fragment, useState, useEffect, useRef } from "react"

import { useRouter } from "next/router"

import { withFirebasePage } from "../../context/firebase/FirebaseServiceContext"
import CompanyLandingPage from "../../components/views/company-profile/CompanyLandingPage"
import CompanyDiscoverPage from "../../components/views/company-profile/CompanyDiscoverPage"
import CompanyWatchPage from "../../components/views/company-profile/CompanyWatchPage"

import Loader from "../../components/views/loader/Loader"

function CompanyProfile(props) {
   const router = useRouter()
   console.log("-> props", props)
   const [company, setCompanyData] = useState(null)
   const [loading, setLoading] = useState(true)

   const sectionTwoRef = useRef(null)
   const sectionThreeRef = useRef(null)

   function scrollToRef(ref) {
      ref.current.scrollIntoView({
         behavior: "smooth",
      })
   }

   useEffect(() => {
      if (props.companyId) {
         setLoading(true)
         props.firebase
            .getCompanyById(props.companyId)
            .then((querySnapshot) => {
               let company = querySnapshot.data()
               company.id = querySnapshot.id
               setCompanyData(company)
               setLoading(false)
            })
      }
   }, [props.companyId])

   if (loading) {
      return <Loader />
   }

   return (
      <Fragment>
         <div className="sectionOne">
            <CompanyLandingPage
               {...props}
               company={company}
               scrollToSecond={() => scrollToRef(sectionTwoRef)}
               scrollToThird={() => scrollToRef(sectionThreeRef)}
            />
         </div>
         <div className="section" ref={sectionTwoRef}>
            <CompanyDiscoverPage {...props} company={company} />
         </div>
         <div className="section" ref={sectionThreeRef}>
            <CompanyWatchPage {...props} company={company} />
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
   )
}

CompanyProfile.getInitialProps = ({ query }) => {
   return { companyId: query.companyId }
}

export default withFirebasePage(CompanyProfile)
