'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Baza de date de rezervă (Dacă AI-ul e blocat)
const sugestiiRezerva: any = {
  "PARIS": [
    { "ora": "09:00", "descriere": "Mic dejun la o boulangerie locală" },
    { "ora": "11:00", "descriere": "Vizită la Muzeul Luvru (Mona Lisa)" },
    { "ora": "15:00", "descriere": "Plimbare în Grădinile Tuileries" }
  ],
  "LONDRA": [
    { "ora": "10:00", "descriere": "Schimbarea gărzii la Buckingham Palace" },
    { "ora": "13:00", "descriere": "Prânz în Borough Market" },
    { "ora": "16:00", "descriere": "Vizită la British Museum" }
  ],
  "TOKYO": [
    { "ora": "08:00", "descriere": "Piața de pește Tsukiji" },
    { "ora": "12:00", "descriere": "Explorare cartierul Shibuya" },
    { "ora": "18:00", "descriere": "Cină în Shinjuku Golden Gai" }
  ]
};

export async function genereazaPlanAI(numeVacanta: string) {
  const oras = numeVacanta.toUpperCase().trim();
  console.log("--- ÎNCERCARE AI PENTRU:", oras, "---");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Sugerează 3 activități pentru "${oras}". Răspunde STRICT JSON: [{"ora": "09:00", "descriere": "Text"}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonCurat = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("✅ SUCCES GOOGLE AI");
    return JSON.parse(jsonCurat);

  } catch (error: any) {
    console.log("⚠️ GOOGLE AI BLOCAT. Folosim baza de date de rezervă.");
    
    // Dacă orașul e în lista noastră de rezervă, dăm acele date
    if (sugestiiRezerva[oras]) {
      return sugestiiRezerva[oras];
    }

    // Dacă e un oraș necunoscut, dăm ceva generic să nu lăsăm pagina goală
    return [
      { "ora": "09:00", "descriere": "Explorarea centrului istoric din " + numeVacanta },
      { "ora": "13:00", "descriere": "Degustare de produse locale tradiționale" },
      { "ora": "17:00", "descriere": "Plimbare la apus și fotografii" }
    ];
  }
}

// Aceeași logică pentru bagaje
export async function genereazaBagajAI(numeVacanta: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Bagaj pentru ${numeVacanta}. JSON: [{"obiect": "Nume", "categorie": "Tip"}]`);
    const text = result.response.text();
    const jsonCurat = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonCurat);
  } catch (e) {
    return [
      { obiect: "Pașaport și acte", categorie: "Documente" },
      { obiect: "Încărcător universal", categorie: "Electronice" },
      { obiect: "Kit de igienă", categorie: "Personale" }
    ];
  }
}