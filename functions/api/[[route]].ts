import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
    return c.json({ message: 'Hello from Edo-AI!' })
})

app.get('/haiku', (c) => {
    const kami = [
        "サーバーの", "春の夜の", "Wifiの", "コード書く", "デプロイの",
        "バグ潜む", "古き良き", "クラウドの", "画面見て", "キーボード"
    ];

    const naka = [
        "落ちて儚き", "つながり求めて", "待てど暮らせど", "エラー吐き出す", "夢は幻",
        "光り輝く", "音も聞こえず", "指も止まらぬ", "知恵も及ばず", "明日を信じて"
    ];

    const shimo = [
        "404", "再起動", "砂時計", "青い画面", "アップデート",
        "コンフリクト", "タイムアウト", "強制終了", "神頼み", "ログの山"
    ];

    const k = kami[Math.floor(Math.random() * kami.length)];
    const n = naka[Math.floor(Math.random() * naka.length)];
    const s = shimo[Math.floor(Math.random() * shimo.length)];

    const randomPhrase = `${k}　${n}　${s}`;

    return c.json({
        haiku: randomPhrase
    })
})

export const onRequest = handle(app)
