export const formatDate = (raw) => {
  const cleaned = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [];

  if (cleaned.length > 0) parts.push(cleaned.slice(0, 2));
  if (cleaned.length >= 3) parts.push(cleaned.slice(2, 4));
  if (cleaned.length >= 5) parts.push(cleaned.slice(4, 8));

  return parts.join("/");
};

export const formatPhone = (raw) => {
  const cleaned = raw.replace(/\D/g, "").slice(0, 11);
  const parts = [];

  if (cleaned.length > 0) parts.push("(" + cleaned.slice(0, 2) + ")");
  if (cleaned.length >= 3) parts.push(cleaned.slice(2, 7));
  if (cleaned.length >= 8) parts.push(cleaned.slice(7, 11));

  return parts.join(" ");
};
