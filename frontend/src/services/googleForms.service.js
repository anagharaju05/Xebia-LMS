const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const googleFormsService = {
  isConfigured: Boolean(CLIENT_ID),
  clientId: CLIENT_ID || "",
  async connect() {
    if (!CLIENT_ID) {
      return { ok: false, reason: "Add VITE_GOOGLE_CLIENT_ID to enable Google OAuth." };
    }
    return { ok: false, reason: "OAuth token exchange must be completed by the backend before production use." };
  },
  isValidFormUrl(url) {
    try {
      const parsed = new URL(url);
      return ["docs.google.com", "forms.gle"].includes(parsed.hostname);
    } catch {
      return false;
    }
  },
  openForm(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
