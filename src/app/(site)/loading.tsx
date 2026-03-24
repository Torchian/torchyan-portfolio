export default function SiteLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-busy
      aria-label="Loading page"
    />
  );
}
