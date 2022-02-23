// test the sentry alerting
// will be removed
const toRemove = () => {
   return (
      <button
         type="button"
         onClick={() => {
            throw new Error("Sentry Frontend Error");
         }}
      >
         Throw error
      </button>
   );
};

export default toRemove;
