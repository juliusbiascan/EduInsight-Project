"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Home, HomeIcon, PlusCircle, ScrollText } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useLabModal } from "@/hooks/use-lab-modal"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Avatar } from "@/components/ui/avatar"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface LabSwitcherProps extends PopoverTriggerProps {
  items: Record<string, any>[];
}

export default function LabSwitcher({ className, items = [] }: LabSwitcherProps) {
  const labModal = useLabModal();
  const params = useParams();
  const router = useRouter();

  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const currentLab = formattedItems.find((item) => item.value === params.labId);

  const [open, setOpen] = React.useState(false)

  const onLabSelect = (lab: { value: string, label: string }) => {
    setOpen(false);
    router.push(`/admin/${lab.value}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a lab"
            className={cn("relative w-full justify-between text-sm text-muted-foreground sm:pr-12 md:w-48 lg:w-64",
              className, "rounded-full border-2 border-primary/20 bg-primary/10 hover:bg-primary/20 transition-all duration-300")}
          >
            <div className="flex items-center">
              <Avatar className="w-6 h-6 mr-2">
                <HomeIcon className="h-4 w-4 text-primary" />
              </Avatar>
              <span className="font-medium text-primary">{currentLab?.label || "Select Lab"}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-primary/60" />
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-2 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <Command className="rounded-lg">
          <CommandInput placeholder="Search lab..." className="rounded-md" />
          <CommandEmpty>No lab found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading="Laboratories" className="text-primary font-medium">
              {formattedItems.map((lab) => (
                <CommandItem
                  key={lab.value}
                  onSelect={() => onLabSelect(lab)}
                  className="text-sm rounded-md hover:bg-primary/10 transition-colors duration-200"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center w-full"
                  >
                    <Avatar className="w-6 h-6 mr-2">
                      <HomeIcon className="h-3 w-3" />
                    </Avatar>
                    <span>{lab.label}</span>
                    {currentLab?.value === lab.value && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </motion.div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  labModal.onOpen()
                }}
                className="rounded-md hover:bg-primary/10 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                  <span className="font-medium">New Lab</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
