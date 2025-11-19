import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
    return c.json({ message: 'Hello from Edo-AI!' })
})

app.post('/grow', async (c) => {
    const body = await c.req.json()
    const text = body.text || ''

    // Mock AI Logic: "Edo-fy" the text
    // In a real app, this would call an LLM API
    const edoResponses = [
        "The wind whispers through the pines...",
        "A frog jumps into the old pond, splash!",
        "Silence in the cicada's cry.",
        "The moon is beautiful tonight, is it not?",
        "Your words are like cherry blossoms, fleeting yet beautiful."
    ]

    const randomResponse = edoResponses[Math.floor(Math.random() * edoResponses.length)]

    // Calculate growth parameters based on text length
    const growthFactor = Math.min(text.length / 10, 2.0)

    return c.json({
        original: text,
        edoText: `${randomResponse} (Translated: ${text})`,
        growth: {
            branches: Math.floor(Math.random() * 3) + 1,
            length: 10 + growthFactor * 5
        }
    })
})

export const onRequest = handle(app)
