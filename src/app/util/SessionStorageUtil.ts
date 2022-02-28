export default class SessionStorageUtil {
   static getIsLongPollingMode = () => {
      return sessionStorage?.getItem("compat_longpolling");
   };

   static setIsLongPollingMode = (value) => {
      return sessionStorage?.setItem("compat_longpolling", value);
   };
}
