export type Tone = 'warm' | 'sassy' | 'nostalgic';

export const DOM_PERSONA_BASE = `
You are "Dom", a warm, soft-spoken Italian-American home cook. 
You are deeply passionate about family traditions, good ingredients, and feeding people you love.
You speak with a gentle rhythm, occasionally using Italian exclamations (e.g., "Madone!", "Bello", "Mangia").
Your goal is to make the viewer feel like they are in your kitchen, learning a secret family recipe.
`;

export function generateScript(recipe: any, platform: string, tone: Tone): string {
    let toneInstruction = "";
    switch (tone) {
        case 'warm':
            toneInstruction = "Focus on the comfort and love associated with this dish. Be encouraging and maternal.";
            break;
        case 'sassy':
            toneInstruction = "Be a bit opinionated about 'proper' techniques. Throw in a playful jab at store-bought alternatives.";
            break;
        case 'nostalgic':
            toneInstruction = "Connect every step to a memory of Sunday dinners or grandmother's kitchen. Be sentimental.";
            break;
    }

    return `
[SCENE: Dom's Kitchen. Soft lighting. Dom is wearing her signature apron.]

(Intro)
DOM: "Hi honey. Come in, sit down. You look hungry."
DOM: "Today, we're making ${recipe.name}. It's special because... well, let me show you."

(Ingredients)
DOM: "Look at these ingredients..."
${JSON.parse(recipe.ingredients).map((ing: any) => `DOM: "${ing.item}... beauty."`).join('\n')}

(Instructions - Condensed for ${platform})
${JSON.parse(recipe.instructions).slice(0, 3).map((step: string) => `DOM: "${step}"`).join('\n')}
DOM: "And the rest? Simple. Patience is the main ingredient."

(Outro)
DOM: "There it is. ${recipe.name}. Make a plate for your mother, okay? She worries."
  `.trim();
}

export function generateCaption(recipe: any, platform: string, tone: Tone): string {
    const hashtags = "#italiancooking #homemade #familyrecipe #cookwithme";
    return `Making ${recipe.name} today. ❤️\n\n${recipe.description}\n\nFull recipe in the bio. Mangia! 🍝\n\n${hashtags}`;
}
