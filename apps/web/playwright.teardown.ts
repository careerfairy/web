const exec = require("child_process").execSync

/**
 * On some systems (MacOS), playwright doesn't clean the webserver processes when done
 *
 * This scripts tries to kill the firebase emulators if they are running
 */
function globalTearDown() {
   if (["linux", "darwin"].includes(process.platform)) {
      try {
         // Find pid of the firebase emulators suite
         const pids = exec(
            "lsof -t -i:5000 -i:5001 -i:8080 -i:9099 -i:9199 || true"
         )
            .toString()
            .trim()
            .split("\n")

         for (let i = 0; i < pids.length; i++) {
            const pid = pids[i]

            if (pid.length > 0) {
               // SIGINT (graceful shutdown the emulators)
               process.kill(parseInt(pid), "SIGINT")
            }
         }
      } catch (e) {
         console.log("Failed to graceful shutdown the emulators", e)
      }
   }
}

export default globalTearDown
