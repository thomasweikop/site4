type SuperadminLoginFormProps = {
  error?: string;
};

export default function SuperadminLoginForm({
  error,
}: SuperadminLoginFormProps) {
  return (
    <form
      action="/api/superadmin/login"
      method="post"
      className="border border-line bg-white p-8 shadow-[var(--shadow)]"
    >
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#697b9e]">
        Superadmin login
      </p>
      <h1 className="mt-4 text-balance font-display text-[2.6rem] leading-[0.95] text-ink">
        Log ind på ComplyCheck admin
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-soft">
        Adgangen beskytter sessions, specialister, brugere, spørgsmål, scoring
        og admin-brugere.
      </p>

      <div className="mt-8 grid gap-4">
        <div>
          <label
            htmlFor="superadmin-email"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Email
          </label>
          <input
            id="superadmin-email"
            name="email"
            type="email"
            defaultValue="thomas.weikop@gmail.com"
            autoComplete="username"
            required
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>

        <div>
          <label
            htmlFor="superadmin-password"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Password
          </label>
          <input
            id="superadmin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex bg-[#050a1f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#101937]"
      >
        Log ind
      </button>

      {error ? <p className="mt-4 text-sm text-[#b64848]">{error}</p> : null}
    </form>
  );
}
