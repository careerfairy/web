import { AIDenoiserExtension } from "agora-extension-ai-denoiser"
import VirtualBackgroundExtension from "agora-extension-virtual-background"
import { getBaseUrl } from "components/helperFunctions/HelperFunctions"

export const agoraNoiseSuppression = new AIDenoiserExtension({
   assetsPath: `${getBaseUrl()}/wasms/denoiser/external`,
})

export const agoraVirtualBackgroundExtension = new VirtualBackgroundExtension()
