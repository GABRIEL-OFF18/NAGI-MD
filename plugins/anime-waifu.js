import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin, participants }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

try {
    await m.react('🧧')
    
    conn.sendPresenceUpdate('composing', m.chat)
    let waitingMsg = await conn.sendMessage(m.chat, { 
        text: `🔎 *Nilou-IA buscando waifus...* ✨\n╰ 📚 Analizando base de datos de chicas kawaii...` 
    }, { quoted: m })

    let res = await fetch('https://api.waifu.pics/sfw/waifu')
    if (!res.ok) throw new Error('Error en la API')

    let json = await res.json()
    if (!json.url) throw new Error('No se encontró waifu')

    // Enviar la imagen
    await conn.sendFile(m.chat, json.url, 'waifu.jpg', 
        `🌸 *¡WAIFU ENCONTRADA!* 🌸\n` +
        `🧧 *Nilou-IA te presenta:*\n` +
        `✨ Una waifu virtual perfecta para ti\n` +
        `📚 ¿No es absolutamente kawaii? (◕‿◕✿)\n` +
        `🍜 ~ Disfruta de tu compañera virtual ~`, 
    m, ctxOk)

    // Eliminar mensaje de espera después de un breve delay
    setTimeout(async () => {
        try {
            if (waitingMsg) {
                await conn.sendMessage(m.chat, { delete: waitingMsg.key })
            }
        } catch (e) {
            console.log('No se pudo eliminar mensaje de espera:', e)
        }
    }, 1000)

} catch (error) {
    console.error(error)
    await m.react('❌')
    await conn.reply(m.chat, `*Itsuki Nakano-IA dice:*\n╰ ❌ Ocurrió un error al buscar waifus...\n╰ 📚 Por favor, intenta de nuevo más tarde.`, m, ctxErr)
}
}

handler.help = ['waifu']
handler.tags = ['anime', 'fun']
handler.command = ['waifu', 'waifus']
handler.group = true
handler.register = true

export default handler