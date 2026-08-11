export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-soft">
        <div className="mb-6">
          <div className="text-sm uppercase tracking-[0.2em] text-blue-400">WISP-MS</div>
          <h1 className="mt-2 text-3xl font-bold">Sign in</h1>
        </div>

        <div className="space-y-4">
          <input
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Email or username"
          />
          <input
            type="password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Password"
          />
          <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500">
            Login
          </button>
        </div>
      </div>
    </main>
  );
}
