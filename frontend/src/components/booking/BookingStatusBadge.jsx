const STATUS_STYLES = {
  Pending:   'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
  Confirmed: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
  Completed: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
  Canceled:  'bg-red-900/40 text-red-400 border-red-700/50',
};

const PAYMENT_STYLES = {
  Unpaid:   'bg-red-900/30 text-red-400 border-red-700/40',
  Partial:  'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  Paid:     'bg-emerald-900/30 text-emerald-400 border-emerald-700/40',
  Refunded: 'bg-blue-900/30 text-blue-400 border-blue-700/40',
};

export function BookingStatusBadge({ status }) {
  return (
    <span className={`badge border text-xs ${STATUS_STYLES[status] || 'badge-purple'}`}>
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }) {
  const label = status || 'Unpaid';
  return (
    <span className={`badge border text-xs ${PAYMENT_STYLES[label] || PAYMENT_STYLES.Unpaid}`}>
      {label}
    </span>
  );
}
