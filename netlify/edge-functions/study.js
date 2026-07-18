export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { topic, classLevel, difficulty } = await request.json();
    
    // Grabs your secret key securely from the Netlify Environment Dashboard settings
    const apiKey = Deno.env.get("NVIDIA_API_KEY");
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "NVIDIA API Key variable is not set up in Netlify." }), { status: 500 });
    }

    const promptText = `You are a teacher formatting a student workbook.
    Create comprehensive study notes about "${topic}" customized perfectly for students in ${classLevel} at an "${difficulty}" difficulty level.
    Directly after your notes, add exactly 3 multiple-choice questions tracking that level. Keep your answer brief so it fits the limits.
    Format your output exactly like this so the app script parses it correctly:
    
    [Notes text here]
    
    QUIZ_START
    Q1: Question text?
    A) Option 1
    B) Option 2
    C) Option 3
    Correct: A
    
    Q2: Question text?
    A) Option 1
    B) Option 2
    C) Option 3
    Correct: B
    
    Q3: Question text?
    A) Option 1
    B) Option 2
    C) Option 3
    Correct: C`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "google/gemma-3n-e4b-it",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 512
      })
    });

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    return new Response(JSON.stringify({ text: aiText }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
