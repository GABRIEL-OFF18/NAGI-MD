import pkg from '@whiskeysockets/baileys'
const { useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason, generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg
import pino from "pino"
import { protoType, serialize, makeWASocket } from '../lib/simple.js'
import path from 'path'
import fs from 'fs'

// --- YEEH ---
// Inicializamos global.subbots
if (!global.subbots) global.subbots = []

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let userName = args[0] ? args[0] : m.sender.split("@")[0]
  const folder = path.join('Sessions/SubBot', userName)

  // --- VERSIÓN ORIGINAL ---
  // Usamos global.subbots para verificar el límite
  if (global.subbots.length >= 100) {
    try { await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }) } catch {}
    return conn.reply(m.chat, '> [🌱] 𝙔𝙖 𝙉𝙤 𝙃𝙖𝙮 𝙈𝙖́𝙨 𝙀𝙨𝙥𝙖𝙘𝙞𝙤 𝙋𝙖𝙧𝙖 𝙃𝙖𝙘𝙚𝙧𝙩𝙚 𝙎𝙪𝙗-𝘽𝙤𝙩 𝙄𝙣𝙩𝙚𝙣𝙩𝙖𝙡𝙤 𝙉𝙪𝙚𝙫𝙖𝙢𝙚𝙣𝙩𝙚 𝙈𝙖́𝙨 𝙏𝙖𝙧𝙙𝙚...', m)
  }

  // --- OKEY ---
  // Usamos global.subbots para buscar una conexión existente
  const existing = global.subbots.find(c => c.id === userName && c.connection === 'open')
  if (existing) {
    try { await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } }) } catch {}
    return conn.reply(m.chat, '*𝘠𝘢 𝘌𝘳𝘦𝘴 𝘚𝘶𝘣-𝘣𝘰𝘵 𝘋𝘦 𝘐𝘵𝘴𝘶𝘬𝘪 🟢*', m)
  }

  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })

  try { await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }) } catch {}
  try { await conn.sendPresenceUpdate('composing', m.chat) } catch {}

  // util
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  // reconnection/backoff state (kept per-start invocation)
  let retryCount = 0
  let destroyed = false // if we decide to stop trying (e.g. logged out)

  const start = async () => {
    if (destroyed) return
    try {
      const { state, saveCreds } = await useMultiFileAuthState(folder)
      const { version } = await fetchLatestBaileysVersion()

      const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        browser: Browsers.macOS('Safari'),
        printQRInTerminal: false
      })

      // identify
      sock.id = userName
      sock.saveCreds = saveCreds
      sock.connection = 'connecting'
      sock.uptime = null
      let pairingCodeSent = false
      let cleanedForInvalidCreds = false

      try {
        protoType()
        serialize()
      } catch (e) {
        console.log(e)
      }

      let handlerr
      try {
        ({ handler: handlerr } = await import('../handler.js'))
      } catch (e) {
        console.error('[Handler] Error importando handler:', e)
      }

      // message upsert
      sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
          if (!handlerr) return
          await handlerr.call(sock, chatUpdate)
        } catch (e) {
          console.error("Error en handler subbot:", e)
        }
      })

      // save creds
      sock.ev.on('creds.update', saveCreds)

      // keep-alive/auto-clean if no user after a while -> credentials invalid
      const initTimeout = setTimeout(async () => {
        if (!sock.user) {
          try {
            cleanedForInvalidCreds = true
            // close ws if any
            try { sock.ws?.close() } catch {}
            // remove event listeners
            sock.ev.removeAllListeners()
            // remove from global list
            global.subbots = global.subbots.filter(c => c.id !== userName)
            // remove folder
            try { 
              fs.rmSync(folder, { recursive: true, force: true }) 
            } catch (e) {
              console.error('Error eliminando carpeta de sesión: ', e)
            }
            console.log(`[SUB-BOT ${userName}] Limpiado por falta de autenticación (60s)`)
          } catch (e) {
            console.error('Error en limpieza por timeout:', e)
          }
        }
      }, 60000) // 60s

      sock.ev.on('connection.update', async (update) => {
        try {
          const { connection, lastDisconnect } = update

          if (connection === 'open') {
            // reset retry count on successful open
            retryCount = 0
            sock.__sessionOpenAt = Date.now()
            sock.connection = 'open'
            sock.uptime = new Date()

            // --- VERSIÓN ORIGINAL (añadida la reconexión robusta) ---
            // Filtramos y añadimos a global.subbots
            global.subbots = global.subbots.filter(c => c.id !== userName)
            global.subbots.push(sock)
            clearTimeout(initTimeout)
            
            // React success
            try { await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }) } catch {}
            
            try {
              await sleep(500)
              await conn.reply(m.chat, '```🧘‍♀️ Ya estas activa como sub-bot en mi Sistema ✅```\n\n> _Si deseas tener más bots así contacta a mi desarrollador._', m)
            } catch (e) {}
            
            console.log(`[SUB-BOT ${userName}] Conectado`)
          } else if (connection === 'close') {
            sock.connection = 'close'
            global.subbots = global.subbots.filter(c => c.id !== userName)
            
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            
            // if invalid credentials, remove session folder
            if (reason === DisconnectReason.loggedOut || reason === 401 || reason === 405 || reason === 403) {
              // do not reconnect: remove session folder
              try {
                fs.rmSync(folder, { recursive: true, force: true })
              } catch (e) {
                console.error('Error eliminando carpeta de sesión: ', e)
              }
              destroyed = true
              console.log(`[SUB-BOT ${userName}] Desconectado y credenciales inválidas. Sesión eliminada.`)
              return
            }

            // For transient errors we will attempt reconnection with exponential backoff.
            // Map some common HTTP-like status codes to behaviours (inspired by example).
            if (reason === 428 || reason === 408) {
              console.log(`[SUB-BOT ${userName}] Conexión perdida o expiró (${reason}). Reintentando...`)
            } else if (reason === 440) {
              console.log(`[SUB-BOT ${userName}] Reemplazada por otra sesión activa (440). Intentando reconectar...`)
            } else if (reason === 500 || reason === 515) {
              console.log(`[SUB-BOT ${userName}] Error servidor (${reason}). Reiniciando sesión...`)
            } else {
              console.log(`[SUB-BOT ${userName}] Conexión cerrada (reason: ${reason}). Reintentando...`)
            }

            // increment retry count and calculate backoff
            retryCount = (retryCount || 0) + 1
            const backoff = Math.min(60000, 2000 * (2 ** Math.min(retryCount, 6))) // max 60s
            setTimeout(() => {
              // if we were cleaned for invalid creds, don't start again
              if (cleanedForInvalidCreds) return
              if (destroyed) return
              try {
                start()
              } catch (e) {
                console.error(`[SUB-BOT ${userName}] Error al reiniciar:`, e)
              }
            }, backoff)
          }
        } catch (e) {
          console.error('Error en connection.update (subbot):', e)
        }
      })

      // group participants placeholder (kept)
      sock.ev.on('group-participants.update', async (update) => {
        try {
          const { id, participants, action } = update || {}
          if (!id || !participants || !participants.length) return
        } catch (e) {}
      })

      // pairing code flow (solo si no hay credenciales registradas)
      if (!state.creds?.registered && !pairingCodeSent) {
        pairingCodeSent = true

        // Emoji de espera
        try { await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } }) } catch {}
        setTimeout(async () => {
          try {
            const rawCode = await sock.requestPairingCode(userName)

            // Emoji cuando se genera el código
            try { await conn.sendMessage(m.chat, { react: { text: '✅️', key: m.key } }) } catch {}

            // Imagen URL
            const imageUrl
='https://iili.io/qY3xHen.jpg'
            // note: prepareWAMessageMedia uses the main connection's upload function.
            // If main conn is offline, upload may fail; we try/catch to avoid breaking subbot lifecycle.
            let media
            try {
              media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer })
            } catch (e) {
              // fallback: no media if upload fails
              media = null
            }

            const header = media ? proto.Message.InteractiveMessage.Header.fromObject({
              hasMediaAttachment: true,
              imageMessage: media.imageMessage
            }) : null

            // Crear mensaje interactivo con botones
            const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
              header,
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `> *❀ OPCIÓN-CODIGO ❀*
  
> 1. 📲 *WhatsApp → Ajustes*  
> 2. ⛓️‍💥 *Dispositivos vinculados*  
> 3. 🔐 *Toca vincular*  
> 4. ✨ Copia este código:
> ˗ˏˋ ꕤ  ${rawCode.match(/.{1,4}/g)?.join(' ⸰ ')}  ꕤ ˎˊ˗
> ⌛ ⋮ *10 segundos de magia*  
> 🍒 ࣪𓂃 *¡Consejito dale rapidito!* ˚₊‧꒰ა ♡ ໒꒱ ‧₊˚`
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: "ᴄᴏᴘɪᴀ ᴇʟ ᴄᴏᴅɪɢᴏ ᴀǫᴜɪ ᴀʙᴀᴊᴏ 🌺"
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                      display_text: "𝗖𝗼𝗽𝗶𝗮 𝗘𝗹 𝗖𝗼𝗱𝗶𝗴𝗼 📋",
                      copy_code: rawCode
                    })
                  },
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "𝗖𝗮𝗻𝗮𝗹 𝗢𝗳𝗶𝗰𝗮𝗹 🌷",
                      url: "https://whatsapp.com/channel/0029VbCJFHmFy72CvfvzSR0Q"
                    })
                  }
                ]
              })
            })

            const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.jid, quoted: m })
            try {
              await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
            } catch (e) {
              // if relay fails (main conn offline), attempt to send via sock (best effort)
              try {
                await sock.sendMessage(m.chat, { text: `Código: ${rawCode}` }, { quoted: m })
              } catch (e2) {
                // give up silently; subbot remains running
              }
            }

            console.log(`Código de vinculación enviado: ${rawCode}`)

          } catch (err) {
            console.error('Error al obtener pairing code:', err)
            try { await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }) } catch {}
            try { await conn.reply(m.chat, `*⚙️ Error: ${err.message}*`, m) } catch {}
          }
        }, 3000)
      }

    } catch (error) {
      console.error('Error al crear socket:', error)
      try { await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }) } catch {}
      try { await conn.reply(m.chat, `Error critico: ${error.message}`, m) } catch {}
      // Attempt restart with backoff if not destroyed
      retryCount = (retryCount || 0) + 1
      const backoff = Math.min(60000, 2000 * (2 ** Math.min(retryCount, 6)))
      setTimeout(() => {
        if (!destroyed) start()
      }, backoff)
    }
  }

  // Start subbot in background; even if main conn later disconnects, this function
  // will manage its own reconnections independent of the main bot's state.
  start()
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code']

export default handler