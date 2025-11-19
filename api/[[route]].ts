import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
    return c.json({ message: 'Hello from Edo-AI!' })
})

app.get('/haiku', (c) => {
    const edoTechPhrases = [
        "The server is down, like a cherry blossom falling. 404.",
        "Deploying to production is like crossing the Hakone mountains.",
        "A bug in the code, hidden like a ninja in the night.",
        "The cloud is vast, but my wifi is weak. Wabi-sabi.",
        "Refactoring legacy code... the endless rain of the rainy season.",
        "Git merge conflict: a duel of samurais.",
        "Infinite loop: the wheel of reincarnation turns forever.",
        "Cache invalidation is as fleeting as the morning dew.",
        "Docker container: a small tea room for your code.",
        "Kubernetes: the Shogun of orchestration.",
        "Stack Overflow: the ancient scroll of wisdom.",
        "404 Not Found: The path you seek is lost in the mist.",
        "500 Internal Server Error: The spirits are restless.",
        "Console.log is the ink brush of the debugger.",
        "Async/Await: Waiting for the moon to rise."
    ]

    const randomPhrase = edoTechPhrases[Math.floor(Math.random() * edoTechPhrases.length)]

    return c.json({
        haiku: randomPhrase
    })
})

export const onRequest = handle(app)
