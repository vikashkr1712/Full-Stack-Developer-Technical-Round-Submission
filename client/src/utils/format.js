export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString();
}

export function getInitials(name) {
  if (!name) return 'NA';
  const parts = name.split(' ').filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
}
