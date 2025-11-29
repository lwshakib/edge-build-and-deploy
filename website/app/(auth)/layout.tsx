import type { ReactNode } from "react"

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return <main className="min-h-screen" style={{ backgroundColor: "#0A0E1A" }}>{children}</main>
}