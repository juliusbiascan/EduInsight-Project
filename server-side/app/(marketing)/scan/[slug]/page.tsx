"use client"

import {
  IDetectedBarcode,
  Scanner,
  useDevices
} from "@yudiel/react-qr-scanner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ScannerPage = () => {

  const deviceList = useDevices();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleScan = (text: string) => {

  }

  return (
    <div className="flex flex-col items-center gap-2 p-10">
      <Scanner
        formats={[
          'qr_code',
          'micro_qr_code',
          'rm_qr_code',
          'maxi_code',
          'pdf417',
          'aztec',
          'data_matrix',
          'matrix_codes',
          'dx_film_edge',
          'databar',
          'databar_expanded',
          'codabar',
          'code_39',
          'code_93',
          'code_128',
          'ean_8',
          'ean_13',
          'itf',
          'linear_codes',
          'upc_a',
          'upc_e'
        ]}
        components={{
          audio: true,
          onOff: true,
          torch: true,
        }}
        allowMultiple={true}
        scanDelay={2000}
        onScan={(detectedCodes: IDetectedBarcode[]) => {
          detectedCodes.map((detectedCode) => {
            handleScan(detectedCode.rawValue);
          })
        }}
        constraints={{
          deviceId: value
        }}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? deviceList?.find((deviceList) => deviceList.deviceId === value)?.label
              : "Select webcam..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search webcam..." />
            <CommandEmpty>No webcam found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {deviceList?.map((deviceList) => (
                  <CommandItem
                    key={deviceList.deviceId}
                    value={deviceList.deviceId}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === deviceList.deviceId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {deviceList.label}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ScannerPage;