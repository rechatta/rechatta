import * as React from "react"

// 861px, not the shadcn default 768 — matches this app's one existing
// responsive breakpoint (used throughout sidebar.tsx/center-panel.tsx via
// min-[861px]:/max-[860px]: arbitrary variants) so the sidebar's mobile/
// desktop switch lines up with everything else instead of introducing a
// second, conflicting breakpoint.
const MOBILE_BREAKPOINT = 861

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
