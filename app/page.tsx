export default function Home() {
  return (
    <>
      <iframe 
        src="/index.html" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}
        title="Numb8"
      />
    </>
  );
}
