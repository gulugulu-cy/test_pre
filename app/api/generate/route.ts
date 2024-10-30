import { generate } from "../service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { main_face_image, width, apiKey, height, presetStyle, characterType } = await request.json();
  if (!main_face_image) {
    return NextResponse.json({ error: 'Unable to obtain photos' }, { status: 400 });
  }
  try {
    const params = getParams(presetStyle, characterType)
    const generateResult = await generate(apiKey, { ...params, main_face_image, width, height })
    return NextResponse.json(generateResult, { status: 200 });
  } catch (error: any) {
    if (error.response) {
      try {
        const errorData = await error.response.json();
        return NextResponse.json({ ...errorData }, { status: 200 });
      } catch (parseError) {
        return NextResponse.json({ error: 'Failed to parse error response' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
    }
  }
}

const getParams = (presetStyle: string, characterType: string) => {
  const prompt = getPrompt(presetStyle)?.replace(/TOK/g, characterType)
  const paramsList = {
    'Comic Style': { true_cfg: 2, id_weight: 0.75, num_steps: 20, start_step: 1, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
    'Line Art Style': { true_cfg: 2, id_weight: 0.9, num_steps: 20, start_step: 1, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
    'Impressionism': { true_cfg: 1, id_weight: 1, num_steps: 20, start_step: 5, guidance_scale: 3.5, negative_prompt: 'watermark, signature, text, error' },
    'Clay': { true_cfg: 2, id_weight: 1, num_steps: 20, start_step: 2, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
    'Watercolor': { true_cfg: 1.5, id_weight: 0.7, num_steps: 20, start_step: 4, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
    'Cyberpunk': { true_cfg: 1, id_weight: 0.8, num_steps: 20, start_step: 2, guidance_scale: 4, negative_prompt: 'watermark, signature, text, error' },
    'Elf': { true_cfg: 1, id_weight: 0.9, num_steps: 20, start_step: 3, guidance_scale: 4, negative_prompt: 'watermark, signature, text, error' },
    'Clown': { true_cfg: 1, id_weight: 0.8, num_steps: 20, start_step: 1, guidance_scale: 4, negative_prompt: 'watermark, signature, text, error' },
    'Robot': { true_cfg: 1, id_weight: 0.8, num_steps: 20, start_step: 4, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
    'Vampire': { true_cfg: 1, id_weight: 0.75, num_steps: 20, start_step: 2, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
    'Zombie': { true_cfg: 1, id_weight: 0.75, num_steps: 20, start_step: 2, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
    'Low Poly Style': { true_cfg: 2, id_weight: 0.7, num_steps: 20, start_step: 1, guidance_scale: 3, negative_prompt: 'watermark, signature, text, error' },
  }
  // @ts-ignore
  return { ...paramsList[presetStyle], prompt }
}

const getPrompt = (presetStyle: string) => {
  switch (presetStyle) {
    case 'Comic Style':
      return `TOK's headshot rendered in vibrant comic book style, featuring bold outlines and flat color blocks. Expressive eyes with highlights, exaggerated facial features, and dynamic shading techniques typical of graphic novels. Hair styled with pronounced lines and highlights for added dimension. Background adorned with speed lines or halftone dots, enhancing the comic book aesthetic. Highly detailed artwork showcasing clean linework and rich, saturated colors reminiscent of classic superhero comics or modern manga illustrations.`

    case 'Line Art Style':
      return `TOK's headshot rendered in sleek, modern line art style. Minimalist portrait with heavy, bold strokes forming clean vector graphics. Sharp, angular lines define facial features and contours. Stark black and white contrast creates a striking graphic effect. Simplified yet expressive design captures essence of TOK's appearance. Geometric shapes and curves compose hair and facial structure. Negative space accentuates key elements. Clean, uncluttered background emphasizes the portrait's contemporary aesthetic.`

    case 'Impressionism':
      return `a TOK's face emerges from a swirl of vibrant, impressionistic brushstrokes. Loose, expressive strokes of vivid blues, reds, and yellows blend seamlessly, creating a dynamic interplay of light and shadow across a TOK's features. The portrait, framed as a close-up headshot, captures the essence of a female's expression with bold, energetic paint application. Dappled sunlight seems to dance across a female's skin, highlighting cheekbones and casting soft shadows. The background dissolves into a hazy mix of warm and cool tones, emphasizing the subject's presence. Visible brushwork adds texture and movement to a female's hair, creating a sense of life and energy within the painting.`

    case 'Clay':
      return `Ultra-detailed claymotion scene featuring a TOK meticulously crafted from polymer clay. Vibrant, cartoonish aesthetic with exaggerated features and smooth textures. Intricate fingerprint impressions visible on the surface, showcasing the handmade quality. Rich, saturated colors pop against a neutral background. Sharp focus captures every minute detail, from subtle clay imperfections to deliberate artistic choices. Lighting emphasizes the dimensional quality of the sculpted elements. Composition arranged to highlight the main subject while incorporating playful, whimsical supporting elements. 8K resolution reveals the finest textures and color gradients. Stop-motion-ready pose with slight, intentional irregularities adding charm and character to the scene.`

    case 'Watercolor':
      return `TOK's headshot, rendered in exquisite watercolor style. Vibrant hues blend seamlessly, creating a striking portrait with painterly brushstrokes. Delicate textures and intricate details bring the face to life. Soft edges and translucent washes enhance the artistic quality. Expressive eyes and subtle facial features capture TOK's essence. Rich, saturated colors highlight key areas, while softer tones provide depth and dimension. Loose, fluid strokes in the background contrast with more defined elements in the face. A harmonious balance of warm and cool tones adds visual interest. Watercolor pigments pool and blend, creating unique patterns and textures throughout the composition.`

    case 'Cyberpunk':
      return `TOK's cyberpunk headshot, vibrant neon lights illuminating facial features, ultramodern cybernetic implants seamlessly integrated with skin, sleek metallic components framing eyes and jawline, holographic interface projected from temples, iridescent hair with fiber optic strands, crisp high-contrast shadows accentuating bone structure, intricate circuitry patterns etched into skin, reflective chrome elements catching light, piercing gaze with augmented iris display, background of towering skyscrapers and flying vehicles blurred in bokeh effect, hyper-detailed texture of synthetic and organic materials blending seamlessly, cinematic composition with dramatic lighting angles`

    case 'Elf':
      return `Ethereal TOK, an elf with cascading golden locks, gazes directly at the viewer in a striking closeup portrait. Intricate silver armor adorns TOK's shoulders, etched with delicate elvish patterns. Piercing blue eyes reflect wisdom and ancient knowledge. The face is flawlessly sculpted, with high cheekbones and pointed ears peeking through the silky hair. A soft, radiant glow emanates from TOK's skin, accentuating the otherworldly beauty. Behind TOK, a misty forest of towering ancient trees stretches into the distance, their leaves shimmering with magical light. Rays of sunlight filter through the canopy, casting a warm, golden hue across the scene. The portrait is rendered in exquisite detail, blending photorealistic elements with fantastical artistry. Smooth lighting enhances the depth and dimensionality of the image, creating a captivating interplay of light and shadow.`

    case 'Clown':
      return `TOK as a clown, headshot portrait, expressionless face, vibrant makeup, red bulbous nose, colorful curly wig, white face paint, exaggerated eyebrows, painted smile, intricate details, surreal elements, bright colors, stark contrast lighting, abstract swirling background, blend of realistic and cartoonish features, comic book stylization, bold outlines, saturated hues, dynamic composition, high-resolution image, sharp focus on facial features, ornate costume details visible in frame, inspiration from Art Nouveau and contemporary digital art, painterly textures, dramatic shadows`

    case 'Robot':
      return `TOK's cyborg headshot portrait, ultra-realistic 8K rendering. Intricate mechanical parts seamlessly integrated with organic features. Gleaming metallic textures adorned with neon accents. Cyberpunk and steampunk aesthetics blend harmoniously. Eyes emit a subtle electronic glow. Wisps of steam escape from joints. Iridescent wires weave through synthetic skin. Golden hour lighting casts warm hues on polished surfaces. Photorealistic details capture every gear, circuit, and artificial muscle fiber. Unreal Engine quality brings hyper-realism to life. Artgerm's precise linework, Greg Rutkowski's dramatic lighting, Charlie Bowater's ethereal touch, Magali Villeneuve's intricate detailing, and Alphonse Mucha's flowing forms influence the style.`

    case 'Vampire':
      return `TOK as a vampire, pale alabaster skin, deep-set dark eyes with crimson irises, sharp elongated fangs protruding from slightly parted lips. Intricate shadows play across TOK's face, accentuating high cheekbones and a strong jawline. Rich, deep red hues dominate the background, swirling like mist. Tendrils of darkness frame TOK's face, creating an otherworldly aura. Hair styled in an ornate, Victorian-inspired updo with delicate curls. Adorned with a gothic choker featuring an intricate blood-red gemstone. Photorealistic noir style with surreal, dreamlike elements. Ethereal light source casts dramatic highlights, emphasizing TOK's supernatural features. Inspiration drawn from the artworks of Alphonse Mucha, blended with the dark fantasy style of Kai Carpenter and Leesha Hannigan.`

    case 'Zombie':
      return `headshot portrait of TOK as a zombie with rotting flesh, the skin peeling off in sections, revealing exposed bone and muscle tissue underneath. The eyes are sunken, cloudy, and lifeless, with deep shadows emphasizing the hollows of the face. The clothing is tattered and frayed, hanging loosely with mold and grime. The background is dark, filled with faint mist, creating a stark contrast against the pale, decaying skin. Every detail is highly defined, from the cracked lips to the bloodstained teeth. The lighting is dim, casting harsh highlights across the gaunt features. Ultra-realistic, 8k, photorealistic with a horror tone, influenced by the styles of Greg Rutkowski, Charlie Bowater, and Magali Villeneuve.`

    case 'Low Poly Style':
      return `Low poly geometric headshot of TOK, vibrant colors, sharp angular features, triangular facets, minimalist design, striking contrasts, 3D render, digital art style, crisp edges, bold outlines, abstract representation, front-facing portrait, stylized facial features, vector-like appearance, clean background, modern aesthetic, high-resolution detail`
  }
}