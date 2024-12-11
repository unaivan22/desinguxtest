import React from 'react'
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { setTheme } = useTheme()

  const toLight = () => {
    setTheme("light")
  };

  const toDark = () => {
    setTheme("dark")
  };

  return (
    <div>
      <Button
        variant="outline"
        size="icon"
        onClick={toDark}
        className='dark:hidden'
        >
      <Sun className="h-5 w-5 dark:hidden" />
    </Button>
    <Button
        variant="outline"
        size="icon"
        onClick={toLight}
        className='hidden dark:flex items-center justify-center'
        >
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
    </div>
  )
}