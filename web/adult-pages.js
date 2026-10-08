// A real channel is supplied by the operator; do not infer an email or owner.
fetch("site-config.json").then((response) => {
  if (!response.ok) throw new Error("contact_unavailable");
  return response.json();
}).then(({ contact }) => {
  const links = document.getElementById("contactLinks");
  if (!links || !contact) return;
  const entries = [];
  if (typeof contact.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) && !/[\r\n?]/.test(contact.email)) entries.push([`mailto:${contact.email}`, contact.email]);
  try {
    const url = new URL(contact.url);
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) entries.push([url.href, "Abrir canal de contacto"]);
  } catch {}
  for (const [href, label] of entries) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    links.appendChild(link);
  }
  if (entries.length) document.getElementById("contactStatus").textContent = "Puedes contactar con el responsable mediante:";
}).catch(() => {});
