"use client"

import {
  RiCheckboxCircleFill,
  RiInformationFill,
  RiLoader4Line,
  RiCloseCircleFill,
  RiAlertFill,
} from "@remixicon/react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <RiCheckboxCircleFill className="size-4" />,
        info: <RiInformationFill className="size-4" />,
        warning: <RiAlertFill className="size-4" />,
        error: <RiCloseCircleFill className="size-4" />,
        loading: <RiLoader4Line className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
