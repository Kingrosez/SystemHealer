export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-[1200px]">
        <h1 className="text-3xl font-bold text-foreground">SystemHealer</h1>
        <p className="mt-2 text-muted-foreground">
          Diagnose. Repair. Restore.
        </p>
        <div className="mt-6 flex gap-3">
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            Primary action
          </button>
          <button className="rounded-md bg-secondary px-4 py-2 text-foreground">
            Secondary
          </button>
          <button className="rounded-md bg-destructive px-4 py-2 text-destructive-foreground">
            Destructive
          </button>
        </div>
        <div className="mt-8 rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Scaffold OK. Tailwind tokens are wired up. shadcn/ui pending.
          </p>
        </div>
      </div>
    </div>
  );
}