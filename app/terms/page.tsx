
'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function TermsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams?.get?.('from') || '/'

  const handleAccept = () => {
    router.push(from)
  }

  return (
    <div className="cosmic-bg" style={{background: "url('/assets/images/numb8-cosmic-bg.webp') no-repeat center center fixed", backgroundSize: 'cover'}}>
      <Link href="/" className="back-btn">Back to Home</Link>
      <div className="security-card" style={{maxWidth: '600px', margin: '80px auto', textAlign: 'center'}}>
        <h1>Terms of Ascension</h1>
        <p>By connecting your wallet, you enter the path of ascension. You acknowledge that:</p>
        <ul>
          <li>Numb8 will only read your public blockchain data (address, NFTs) — never your private keys or funds.</li>
          <li>108 Studio Art never has access to your wallet custody or private keys.</li>
          <li>All blockchain transactions are final, irreversible, and your sole responsibility.</li>
          <li>Progression through The Portal, The Circle, and The Infinite depends on your NFT holdings and community engagement.</li>
          <li>Physical artifacts (prints, sculptures) may be linked via NFC or redemption codes.</li>
          <li>108 Studio Art is not liable for losses caused by third-party services, failed transactions, or compromised wallets.</li>
        </ul>
        <p><em>To connect is not to surrender — it is to prove your belonging.</em></p>
        <button onClick={handleAccept} className="wallet-btn" style={{cursor: 'pointer'}}>Accept and Ascend</button>
      </div>

      <footer style={{textAlign: 'center', marginTop: '60px', padding: '20px'}}>
        <p style={{fontFamily: 'Orbitron, sans-serif', fontSize: '0.9em', color: '#fff', textShadow: '0 0 10px #00ccff, 0 0 20px #a55cff'}}>
          © 2025 108 Studio Art | 
          <Link href="/security" style={{color: '#00ccff', textDecoration: 'none', textShadow: '0 0 5px #00ccff'}}> Privacy Policy</Link> | 
          <Link href="/termsgeneral" style={{color: '#a55cff', textDecoration: 'none', textShadow: '0 0 5px #a55cff'}}> General Terms of Service</Link>
        </p>
      </footer>
    </div>
  )
}

export default function TermsPage() {
  return (
    <Suspense fallback={
      <div className="cosmic-bg" style={{background: "url('/assets/images/numb8-cosmic-bg.webp') no-repeat center center fixed", backgroundSize: 'cover', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: '#fff'}}>Loading...</p>
      </div>
    }>
      <TermsContent />
    </Suspense>
  )
}
