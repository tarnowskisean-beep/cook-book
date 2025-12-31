export default function Home() {
  return (
    <main style={{ padding: 'var(--space-8)' }}>
      <div className="container">
        <h1 style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>
          AI Social Media Assistant
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: 'var(--space-8)' }}>
          Manage your cookbook projects, generate social content, and track performance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div className="card">
            <h2>Projects</h2>
            <p style={{ margin: 'var(--space-2) 0 var(--space-4)' }}>Manage your cookbook volumes and recipes.</p>
            <a href="/projects" className="btn btn-primary">View Projects</a>
          </div>
          <div className="card">
            <h2>Analytics</h2>
            <p style={{ margin: 'var(--space-2) 0 var(--space-4)' }}>Track engagement across all platforms.</p>
            <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
          </div>
        </div>
      </div>
    </main>
  );
}
