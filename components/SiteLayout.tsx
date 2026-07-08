'use client'

import Header from './Header'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div>TEST HEADER</div>
      {children}
    </>
  )
}