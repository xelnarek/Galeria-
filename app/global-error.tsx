'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pl">
      <body style={{ backgroundColor: '#0B0B0B', color: '#F2F0EA', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
        <h2>Wystąpił błąd aplikacji</h2>
        <button
          onClick={() => reset()}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#C5A880', color: '#000', border: 'none', cursor: 'pointer' }}
        >
          Spróbuj ponownie
        </button>
      </body>
    </html>
  );
}
