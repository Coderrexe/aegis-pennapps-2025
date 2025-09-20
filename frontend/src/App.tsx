function App() {
  return (
    <div className="min-h-screen min-w-screen bg-[var(--base)] text-[var(--neutral)] flex flex-col items-center justify-center p-6">
      <h1 className="text-[var(--accent)] text-4xl font-bold mb-8">
        aegis
      </h1>

      <div className="flex gap-4">
        <div className="w-24 h-24 bg-[var(--primary)] rounded-lg flex items-center justify-center">
          <span className="text-[var(--neutral)] text-sm">Primary</span>
        </div>
        <div className="w-24 h-24 bg-[var(--secondary)] rounded-lg flex items-center justify-center">
          <span className="text-[var(--neutral)] text-sm">Secondary</span>
        </div>
        <div className="w-24 h-24 bg-[var(--accent)] rounded-lg flex items-center justify-center">
          <span className="text-[var(--base)] text-sm">Accent</span>
        </div>
        <div className="w-24 h-24 bg-[var(--neutral)] rounded-lg flex items-center justify-center">
          <span className="text-[var(--base)] text-sm">Neutral</span>
        </div>
        <div className="w-24 h-24 bg-[var(--base)] rounded-lg flex items-center justify-center border border-[var(--neutral)]">
          <span className="text-[var(--neutral)] text-sm">Base</span>
        </div>
      </div>
    </div>
  );
}

export default App;
