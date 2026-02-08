// Mapping des codes de langue internes vers les codes DeepL
export function getDeepLLanguageCode(lang: string): string {
  switch (lang) {
    case "EN": return "EN-US";
    case "PT": return "PT-PT";
    case "NO": return "NB"; // Norvégien Bokmål
    default: return lang;
  }
}

// Les 26 langues cibles (sans FR qui est la source)
export const TARGET_LANGUAGES = [
  "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH",
  "KO", "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU",
  "RO", "SK", "UK", "BG", "HR", "ID"
];

// Fonction pour traduire un texte via DeepL
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === "") return "";
  
  const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
  if (!DEEPL_API_KEY) return text;

  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        source_lang: "FR",
        target_lang: getDeepLLanguageCode(targetLang),
      }),
    });

    if (!response.ok) return text;
    const data = await response.json();
    return data.translations?.[0]?.text || text;
  } catch {
    return text;
  }
}
