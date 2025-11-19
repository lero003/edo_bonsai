import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
    return c.json({ message: 'Hello from Edo-AI!' })
})

app.get('/haiku', (c) => {
    const edoTechPhrases = [
        "サーバー落ちて　散る桜かな　404",
        "デプロイや　箱根の山を　越えるごとし",
        "バグ潜む　闇夜の忍者　見つけたり",
        "クラウドは　広けれど我が　Wifi弱し",
        "レガシーや　五月雨のごと　降り止まぬ",
        "マージコンフリクト　侍たちの　決闘かな",
        "無限ループ　輪廻転生　止まらざる",
        "キャッシュ消え　朝露のごと　儚きかな",
        "コンテナは　コードのための　茶室なり",
        "クバネテス　指揮する将軍　威風堂々",
        "スタックオーバーフロー　古き知恵の　巻物よ",
        "404　探す道は　霧の中",
        "500エラー　御霊（みたま）鎮めよ　サーバー室",
        "コンソールログ　デバッガーの　墨跡なり",
        "非同期や　月出るを待つ　心持ち"
    ]

    const randomPhrase = edoTechPhrases[Math.floor(Math.random() * edoTechPhrases.length)]

    return c.json({
        haiku: randomPhrase
    })
})

export const onRequest = handle(app)
