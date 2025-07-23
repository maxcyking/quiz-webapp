export default function Head() {
  return (
    <>
      <link 
        rel="preload" 
        href="/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      
      <link 
        rel="preload" 
        href="/styles/critical.css" 
        as="style" 
      />
      
      <link 
        rel="preconnect" 
        href="https://firebaseapp.com" 
      />
      <link 
        rel="preconnect" 
        href="https://firebaseinstallations.googleapis.com" 
      />
      <link 
        rel="preconnect" 
        href="https://apis.google.com" 
      />
    </>
  )
}