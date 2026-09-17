import { formatAmountMinor } from "./money.ts";

const emptyClientCount = 0;
const emptyAmountMinor = 0;

export function App() {
  return (
    <div className="app">
      <header className="header">
        <p className="badge">Local development mode</p>
        <h1>Freelancer Ledger</h1>
        <p className="subtitle">
          Track clients, invoices, payments, and outstanding balances.
        </p>
      </header>

      <section className="cards" aria-label="Dashboard placeholders">
        <article className="card">
          <h2>Clients</h2>
          <p className="value">{emptyClientCount}</p>
        </article>
        <article className="card">
          <h2>Outstanding</h2>
          <p className="value">{formatAmountMinor(emptyAmountMinor)}</p>
        </article>
        <article className="card">
          <h2>Overdue</h2>
          <p className="value">{formatAmountMinor(emptyAmountMinor)}</p>
        </article>
        <article className="card">
          <h2>Paid This Month</h2>
          <p className="value">{formatAmountMinor(emptyAmountMinor)}</p>
        </article>
      </section>

      <p className="backend-note">
        Backend connection will be added in Patch 4.
      </p>
    </div>
  );
}
