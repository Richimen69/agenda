const ALLOWED_LEAD_FIELDS = [
  "date",
  "phone",
  "fullName",
  "department",
  "contactMethod",
  "agent",
  "interest",
  "status",
  "contactState",
  "needsRecovery",
  "recoveryStatus",
  "lostReason",
  "firstContactTime",
  "assignment",
  "hasAppointment",
  "showedUp",
  "hasQuote",
  "amount",
  "source",
  "isReturning",
  "branch",
  "captureView",
];

/**
 * Filtra req.body para que solo pasen campos reales del modelo Lead.
 * Evita mass assignment (id, createdAt, comments, etc. inyectados desde el cliente).
 */
export function sanitizeLeadInput(body) {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => ALLOWED_LEAD_FIELDS.includes(key)),
  );
}