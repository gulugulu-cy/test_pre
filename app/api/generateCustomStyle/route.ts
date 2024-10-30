import ky, { KyResponse } from "ky";
import { NextResponse } from "next/server";
import { generate } from "../service";

export async function POST(request: Request) {

    const { main_face_image, width, content, apiKey, height, model, characterType } = await request.json();

    const headers = {
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "Apifox/1.0.0 (https://apifox.com)",
        "Content-Type": "application/json"
    };
    if (!main_face_image) {
        return NextResponse.json({ error: 'Unable to obtain photos' }, { status: 400 });
    }
    const messages = getPrompt(content)

    try {
        const result: any = await ky(`${process.env.NEXT_PUBLIC_API_URL}/v1/chat/completions`, {
            headers,
            method: 'post',
            timeout: false,
            body: JSON.stringify({ model, messages }),
        }).then(res => res.json());
        if (result?.choices[0]?.message?.content) {
            const prompt = `headshot of TOK, ${result.choices[0].message.content}`.replace(/TOK/g, characterType);
            const generateResult = await generate(apiKey, { main_face_image, prompt, width: +width, height: +height })
            return NextResponse.json(generateResult, { status: 200 });
        }
        return NextResponse.json({ error: 'Generation failed' }, { status: 400 });
    } catch (error: any) {
        if (error.response) {
            try {
                const errorData = await error.response.json();
                return NextResponse.json({ ...errorData }, { status: 200 });
            } catch (parseError) {
                console.log('Error parsing JSON from response:', parseError);
                return NextResponse.json({ error: 'Failed to parse error response' }, { status: 500 });
            }
        } else {
            return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
        }
    }
}

const getPrompt = (content: string) => {
    return [
        {
            role: 'user',
            content: `Optimize and enhance the prompt which provided for image generation, make sure that can be generate an excellent view by Midjourney or other Diffusion models.

            You should describe the view of the prompt in detailed and accurately, and you should add some parts if the provided prompt is too simple. You can use some famous IP names if needed.
            
            Use higher weight to introduce the subject. Do not use any introductory phrase like 'This image shows', 'In the scene' or other similar phrases. Don't use words that describe cultural values ​​or spirituality like 'create a xxx atmosphere', 'creating xxx presence', 'hinting at xxx', 'enhancing the xxxx of the scene' or others. Don't use ambiguous words. Just describe the scene which you see. Don't over-describe the indescribable.
            
            You can describe the scene fluently using natural language like a native speaker. Use 'TOK' to replace the subject of the content, such as 'a female', 'a man', don't use gender-specific pronouns.
            
            Input content:<text>
            ${content}
            </text>
            
            Always return the result in English in plain text format, do not add any other contents.`
        }
    ]
}