import axios from "axios";

const SMARTRECRUITER_API_URL = "https://api.smartrecruiters.com";
const X_SMART_TOKEN = "pp-d78f4a13a52b44c5939ac23d0d0d0917";

class SmartRecruitersDataAccess {
   static getCompanyPositions = async () => {
      return axios({
         method: "get",
         url: `${SMARTRECRUITER_API_URL}/feed/publications`,
         headers: {
            "X-SmartToken": X_SMART_TOKEN,
         },
      });
   };
}

export default SmartRecruitersDataAccess;
