import BrandedTextField from "components/views/common/inputs/BrandedTextField"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { MenuItem } from "@mui/material"
import { SelectProps } from "@mui/material/Select"
import { useLocalTracks } from "../../context"
import { sxStyles } from "types/commonTypes"
import { getRTCErrorCode } from "../../util"
import { useState } from "react"

const styles = sxStyles({
   root: {
      maxWidth: "100%",
   },
   icon: {
      pointerEvents: "none",
      position: "absolute",
      right: 12,
      top: 20,
   },
   iconOpen: {
      transform: "rotate(180deg)",
   },
})

type DeviceSelectProps = SelectProps & {
   label: string
   options: MediaDeviceInfo[]
   onDeviceSelect: (deviceId: string) => void
   value: string
   permissionDenied: boolean
}

const getValue = (value: string, options: MediaDeviceInfo[]) =>
   options.find((op) => op.deviceId === value)?.deviceId ?? ""

export const DeviceSelect = ({
   label,
   options,
   onDeviceSelect,
   value,
   permissionDenied,
   ...props
}: DeviceSelectProps) => {
   const inputId = `select-${label.toLowerCase()}` // Generate a unique ID based on the label, replacing spaces with hyphens
   const [selectOpen, setSelectOpen] = useState(false) // Add this line to manage the open state

   return (
      <BrandedTextField
         select
         label={label}
         disabled={permissionDenied}
         sx={styles.root}
         fullWidth
         size="medium"
         value={
            permissionDenied ? "Permission Denied" : getValue(value, options)
         }
         SelectProps={{
            IconComponent: () => (
               <ExpandMoreIcon
                  sx={[styles.icon, selectOpen && styles.iconOpen]}
               />
            ),
            open: selectOpen,
            onOpen: () => setSelectOpen(true),
            onClose: () => setSelectOpen(false),
         }}
         InputLabelProps={{ htmlFor: inputId }}
         inputProps={{ id: inputId }}
         // @ts-ignore
         onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
            return onDeviceSelect(event.target.value as string)
         }}
         {...props}
      >
         {Boolean(permissionDenied) && (
            <MenuItem disabled value={"Permission Denied"}>
               Permission Denied
            </MenuItem>
         )}
         {options.map((option) => (
            <MenuItem key={option.deviceId} value={option.deviceId}>
               {option.label}
            </MenuItem>
         ))}
      </BrandedTextField>
   )
}

export const CameraSelect = () => {
   const {
      setActiveCameraId,
      activeCameraId,
      cameraError,
      fetchCamerasError,
      cameraDevices,
   } = useLocalTracks()

   return (
      <DeviceSelect
         key={cameraDevices.length}
         label="Camera"
         options={cameraDevices}
         onDeviceSelect={setActiveCameraId}
         value={activeCameraId}
         permissionDenied={
            getRTCErrorCode(fetchCamerasError || cameraError) ===
            "PERMISSION_DENIED"
         }
      />
   )
}

export const MicrophoneSelect = () => {
   const {
      setActiveMicrophoneId,
      activeMicrophoneId,
      microphoneError: micError,
      fetchMicsError,
      microphoneDevices: micDevices,
   } = useLocalTracks()

   return (
      <DeviceSelect
         label="Microphone"
         options={micDevices}
         onDeviceSelect={setActiveMicrophoneId}
         value={activeMicrophoneId}
         permissionDenied={
            getRTCErrorCode(fetchMicsError || micError) === "PERMISSION_DENIED"
         }
      />
   )
}
