import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || "dummy-key-to-pass-build";

const openai = new OpenAI({
    apiKey: apiKey,
});

export default openai;
