
import Link from 'next/link'

export default function EchoesCirclePage() {
  return (
    <div className="cosmic-bg" style={{background: "url('/assets/images/numb8-cosmic-bg.webp') no-repeat center center fixed", backgroundSize: 'cover'}}>
      <Link href="/" className="back-btn">⟵ Back to Home</Link>
      <section className="auth-gate">
        <div className="auth-card">
          <h1>The Echoes Circle</h1>
          
          <p className="lore">&quot;Welcome to The Echoes Circle — a sacred community where collectors of Numb8 gather. This is where the journey deepens, and the path to ascension begins.&quot;</p>
          
          <h3>Join the Circle:</h3>
          <ul>
            <li>Exclusive access to member benefits</li>
            <li>Community events and rewards</li>
            <li>Path to higher tiers</li>
          </ul>
        
          <Link href="/terms?from=echoes-circle" className="wallet-btn" style={{display: 'inline-block', textAlign: 'center', cursor: 'pointer'}}>Connect Wallet</Link>
          <p className="status-msg">Awaiting connection...</p>
        </div>
      </section>

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
