import { Sermon, BibleVerse } from "./types";

// Embedded Reina-Valera 1960 Bible database for high-readability live pulpit queries
export const BIBLE_LIBRARY: Record<string, string> = {
  "Juan 3:16": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
  "Mateo 7:24": "Cualquiera, pues, que me oye estas palabras, y las hace, le compararé a un hombre prudente, que edificó su casa sobre la roca.",
  "Mateo 7:25": "Descendió lluvia, y vinieron ríos, y soplaron vientos, y combatieron contra aquella casa; y no cayó, porque estaba fundada sobre la roca.",
  "Mateo 7:26": "Pero cualquiera que me oye estas palabras y no las hace, le compararé a un hombre insensato, que edificó su casa sobre la arena;",
  "Mateo 7:27": "Y descendió lluvia, y vinieron ríos, y soplaron vientos, y dieron con ímpetu contra aquella casa; y cayó, y fue grande su ruina.",
  "Filipenses 4:13": "Todo lo puedo en Cristo que me fortalece.",
  "Romanos 8:28": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
  "Salmo 23:1": "Jehová es mi pastor; nada me faltará.",
  "Proverbios 3:5": "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.",
  "Josué 1:9": "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.",
  "Hebreos 11:1": "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.",
  "Hechos 1:85": "Pero recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo, y me seréis testigos en Jerusalén, en toda Judea, en Samaria, y hasta lo último de la tierra.",
  "Génesis 1:1": "En el principio creó Dios los cielos y la tierra.",
  "Salmo 119:105": "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
  "Juan 14:6": "Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.",
  "Romanos 12:2": "No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento, para que comprobéis cuál sea la buena voluntad de Dios, agradable y perfecta.",
  "Gálatas 5:22": "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe,"
};

export function lookupScripture(query: string): BibleVerse {
  const normalizedQuery = query.replace(/\s+/g, " ").trim();
  
  // Try direct match
  let text = BIBLE_LIBRARY[normalizedQuery];
  
  // Try key lookups without spaces or minor accents
  if (!text) {
    const keys = Object.keys(BIBLE_LIBRARY);
    const matchedKey = keys.find(k => k.toLowerCase() === normalizedQuery.toLowerCase());
    if (matchedKey) {
      text = BIBLE_LIBRARY[matchedKey];
    }
  }

  // Handle book, chapter, verse parsing
  const parts = normalizedQuery.split(/\s+/);
  let book = "Biblia";
  let chapter = 1;
  let verse = "1";

  if (parts.length >= 2) {
    if (parts.length === 3 && /^[1-3]$/.test(parts[0])) {
      book = `${parts[0]} ${parts[1]}`;
      const address = parts[2].split(":");
      chapter = parseInt(address[0], 10) || 1;
      verse = address[1] || "1";
    } else {
      book = parts[0];
      const address = parts[1].split(":");
      chapter = parseInt(address[0], 10) || 1;
      verse = address[1] || "1";
    }
  }

  return {
    book,
    chapter,
    verse,
    text: text || "La palabra de Dios en su pasaje seleccionado fortalece y guía tu vida. Consulta tu Biblia física o digital para verificar el texto completo de esta gran verdad.",
    version: "Reina-Valera 1960"
  };
}

export const BIBLE_VERSIONS = [
  { id: "RVR1960", name: "Reina-Valera 1960" },
  { id: "NVI", name: "Nueva Versión Internacional" },
  { id: "LBLA", name: "La Biblia de las Américas" },
  { id: "DHH", name: "Dios Habla Hoy" },
  { id: "TLA", name: "Traducción en Lenguaje Actual" },
  { id: "KJV", name: "King James Version (Inglés)" }
];

export async function lookupScriptureAsync(query: string, version: string): Promise<BibleVerse> {
  const normalizedQuery = query.replace(/\s+/g, " ").trim();
  const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : "";

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    console.log("No Gemini API key configured, falling back to offline database");
    return lookupScripture(normalizedQuery);
  }

  const selectedVersionObj = BIBLE_VERSIONS.find(v => v.id === version || v.name === version);
  const versionName = selectedVersionObj ? selectedVersionObj.name : "Reina-Valera 1960";

  const cachedModel = localStorage.getItem("sermonpro_last_working_gemini_model");
  const baseModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"];
  const modelsToTry = cachedModel && baseModels.includes(cachedModel)
    ? [cachedModel, ...baseModels.filter(m => m !== cachedModel)]
    : baseModels;

  let lastError: any = null;

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout per model

    try {
      console.log(`Attempting scripture lookup with model: ${model}`);
      const prompt = `Busca el pasaje bíblico: "${normalizedQuery}" en la versión: "${versionName}". 
Devuelve ÚNICAMENTE un objeto JSON estructurado según el siguiente esquema (sin formato markdown, sin comentarios, sin texto adicional):
{
  "book": "Nombre del Libro (ej. Juan)",
  "chapter": número,
  "verse": "número o rango (ej. 16 o 16-18)",
  "text": "Texto completo del versículo o pasaje",
  "version": "${versionName}"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = "";
        try {
          const errJson = await response.json();
          errorDetail = errJson.error?.message || JSON.stringify(errJson);
        } catch (e) {
          errorDetail = response.statusText || String(response.status);
        }
        
        lastError = new Error(`API error: ${response.status} - ${errorDetail}`);
        
        // If it's a 404 (model not found), try the next model
        if (response.status === 404) {
          console.warn(`Model ${model} returned 404. Trying next model...`);
          continue;
        }
        // For other API errors (e.g. 403, 429), break loop and throw
        throw lastError;
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textContent) {
        throw new Error("Empty response from Gemini");
      }

      const parsedVerse = JSON.parse(textContent.trim());
      
      // Save this model as the last working model so we try it first next time
      localStorage.setItem("sermonpro_last_working_gemini_model", model);
      console.log(`Successfully resolved scripture using model: ${model}`);

      return {
        book: parsedVerse.book || "Biblia",
        chapter: parseInt(parsedVerse.chapter, 10) || 1,
        verse: String(parsedVerse.verse || "1"),
        text: parsedVerse.text || "",
        version: parsedVerse.version || versionName
      };

    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(`Error with model ${model}:`, err);
      
      if (err.name === "AbortError") {
        lastError = new Error(`Request timed out for model ${model}`);
      } else {
        lastError = err;
      }

      // Stop looping if the key itself is unauthorized or over quota
      if (lastError.message && (lastError.message.includes("403") || lastError.message.includes("429"))) {
        break;
      }
    }
  }

  // If we reach here, all models in modelsToTry failed
  // Check if it's in our local library as a backup
  const offlineVerse = lookupScripture(normalizedQuery);
  if (offlineVerse.text && !offlineVerse.text.startsWith("La palabra de Dios en su pasaje")) {
    return {
      ...offlineVerse,
      version: offlineVerse.version + " (Offline Fallback)"
    };
  }
  
  return {
    book: normalizedQuery,
    chapter: 1,
    verse: "1",
    text: `Error al obtener el versículo. Detalle: ${lastError?.message || lastError}. Por favor, verifique que la API Key sea correcta y activa en Google AI Studio con soporte para modelos Gemini.`,
    version: versionName
  };
}

export async function generateSermonContentAsync(
  prompt: string,
  context: { title: string; theme: string; sectionName: string; currentContent: string }
): Promise<string> {
  const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : "";

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    throw new Error("No Gemini API key configured.");
  }

  const cachedModel = localStorage.getItem("sermonpro_last_working_gemini_model");
  const baseModels = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"];
  const modelsToTry = cachedModel && baseModels.includes(cachedModel)
    ? [cachedModel, ...baseModels.filter((m) => m !== cachedModel)]
    : baseModels;

  let lastError: any = null;

  for (const model of modelsToTry) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout per model for longer gen

    try {
      console.log(`Attempting content generation with model: ${model}`);
      const systemPrompt = `Eres un asistente de Inteligencia Artificial especializado en Homilética Cristiana.
Tu objetivo es ayudar a un pastor a desarrollar un bosquejo o sección específica de un sermón.
Contexto del Sermón:
- Título: ${context.title || "No definido"}
- Tema Central: ${context.theme || "No definido"}
- Nombre de la Sección a desarrollar: ${context.sectionName}
- Contenido Actual de la Sección: ${context.currentContent || "Vacío"}

Instrucciones:
Responde directamente a la siguiente petición del pastor. No incluyas comentarios iniciales como "Aquí tienes", entrega solo el contenido solicitado estructurado de forma profesional y teológica.

Petición del Pastor: "${prompt}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt,
                  },
                ],
              },
            ],
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = "";
        try {
          const errJson = await response.json();
          errorDetail = errJson.error?.message || JSON.stringify(errJson);
        } catch (e) {
          errorDetail = response.statusText || String(response.status);
        }
        
        lastError = new Error(`API error: ${response.status} - ${errorDetail}`);
        if (response.status === 404) continue;
        throw lastError;
      }

      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textContent) {
        throw new Error("Empty response from Gemini");
      }

      localStorage.setItem("sermonpro_last_working_gemini_model", model);
      return textContent.trim();
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(`Error with model ${model}:`, err);
      
      if (err.name === "AbortError") {
        lastError = new Error(`Request timed out for model ${model}`);
      } else {
        lastError = err;
      }

      if (lastError.message && (lastError.message.includes("403") || lastError.message.includes("429"))) {
        break;
      }
    }
  }

  throw lastError || new Error("Failed to generate content after trying all models.");
}


// Preload standard sample sermons
export const SAMPLE_SERMONS: Sermon[] = [
  {
    id: "sermon_1",
    title: "La Roca Firme en la Tormenta",
    theme: "Fe y Obediencia Práctica en tiempos de prueba y tribulaciones",
    mainPassage: "Mateo 7:24-27",
    durationMinutes: 40,
    notes: "Recordar pedir a los músicos orar de fondo en tono suave (piano en re menor) durante las conclusiones y llamados del final del bloque 5.",
    sections: [
      {
        id: "sermon_1_sec_1",
        title: "1. Introducción y Contexto de la Prudencia",
        durationMinutes: 5,
        content: "Comenzamos recordando la vida de sumisión y obediencia absoluta. En Mateo 7:24 Jesús nos enseña que cualquiera que oye estas palabras y las hace, le compararé a un hombre prudente, que edificó su casa sobre la roca. La prudencia no radica sólo en escuchar reflexivamente las escrituras, sino en la obediencia diaria práctica de Su verdad."
      },
      {
        id: "sermon_1_sec_2",
        title: "2. La Llegada Inevitable de la Tormenta",
        durationMinutes: 10,
        content: "Las pruebas y adversidades son reales para todos, justos e injustos. En Mateo 7:25 vemos que descendió lluvia, y vinieron ríos, y soplaron vientos, y combatieron contra aquella casa; y no cayó, porque estaba fundada sobre la roca. Las crisis revelan de qué sustancia está hecho tu fundamento espiritual. ¡Anímate hoy con Romanos 8:28!"
      },
      {
        id: "sermon_1_sec_3",
        title: "3. La Casa del Hombre Insensato",
        durationMinutes: 10,
        content: "Pero el que no obedece sufre desilusión y pérdida irreparable. En Mateo 7:26 se nos advierte con gran sobriedad: cualquiera que me oye estas palabras y no las hace, le compararé a un hombre insensato, que edificó su casa sobre la arena. La arena representa modas, opiniones humanas pasacionales y el orgullo necio temporal en Proverbios 3:5."
      },
      {
        id: "sermon_1_sec_4",
        title: "4. La Caída Grande y Estruendosa",
        durationMinutes: 10,
        content: "La terrible consecuencia final de la desobediencia sistemática. En Mateo 7:27 descendió lluvia, y vinieron ríos, y soplaron vientos, y dieron con ímpetu contra aquella casa; y cayó, y fue grande su ruina. No permitas que el derrumbe de tu vida sea el final de tu historia. Es tiempo de volver los ojos a Jesús."
      },
      {
        id: "sermon_1_sec_5",
        title: "5. Conclusión y Llamado al Púlpito",
        durationMinutes: 5,
        content: "¿Sobre qué terreno estás edificando hoy la eternidad de tu familia? Recuerda Filipenses 4:13: Todo puedo en Cristo que me fortalece. Si pones hoy tu fe en Dios, nada te faltará, pues Jehová es mi pastor; nada me faltará como testifica el Salmo 23:1. Avancemos con valentía según Josué 1:9."
      }
    ]
  },
  {
    id: "sermon_2",
    title: "El Poder Renovador de la Palabra",
    theme: "La renovación del entendimiento para discernir la voluntad perfecta de Dios",
    mainPassage: "Romanos 12:2",
    durationMinutes: 30,
    notes: "Utilizar el proyector principal para desplegar las citas claves de Filipenses.",
    sections: [
      {
        id: "sermon_2_sec_1",
        title: "1. No os conforméis a este siglo",
        durationMinutes: 8,
        content: "El apóstol Pablo nos insta con urgencia en Romanos 12:2 a no amoldarnos a las corrientes mundanas y pasajeras de este siglo. El peligro es sutil. Necesitamos la verdad eterna para iluminar el sendero según el Salmo 119:105."
      },
      {
        id: "sermon_2_sec_2",
        title: "2. La Renovación del Entendimiento",
        durationMinutes: 15,
        content: "Nuestra mente es transformada por el Espíritu Santo a través de la lectura devocional constante. Cuando nuestra mente cambia, nuestras prioridades y gozo se transforman de raíz y empezamos a producir frutos eternos como se ilustra en Gálatas 5:22."
      },
      {
        id: "sermon_2_sec_3",
        title: "3. Discerning la Voluntad Buena",
        durationMinutes: 7,
        content: "Dios tiene un propósito que es bueno, agradable y perfecto. Cree de todo corazón en Hebreos 11:1 y descansa bajo la guía protectora del único Salvador que es el Camino en Juan 14:6."
      }
    ]
  }
];
