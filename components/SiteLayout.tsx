'use client'

import Header from './Header'
import Footer from './Footer'
import ScrollManager from './ScrollManager'
import BackToTop from './BackToTop'
import ContentProtection from './ContentProtection'

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ScrollManager />
      <ContentProtection />
      <Header />
      {children}
      <Footer />
      <BackToTop />
    </>
  )
}
