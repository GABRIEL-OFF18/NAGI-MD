import ws from 'ws'
import pkg from '@whiskeysockets/baileys'
const { DisconnectReason, generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg
import fs from "fs/promises"
import path from 'path'

// Quoted especial con mini-thumbnail
async function makeFkontak() {
  try {
    const { default: fetch } = await import('node-fetch')
    const res = await fetch('https://cdn.russellxz.click/a1d42213.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { 
        participants: '0@s.whatsapp.net', 
        remoteJid: 'status@broadcast', 
        fromMe: false, 
        id: 'Halo' 
      },
      message: { 
        locationMessage: { 
          name: '🌷 𝗟𝗶𝘀𝘁𝗮 𝗱𝗲 𝗦𝘂𝗯𝗯𝗼𝘁𝘀 𝗔𝗰𝘁𝗶𝘃𝗼𝘀', 
          jpegThumbnail: thumb2 
        } 
      },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

let handler = async(m, { usedPrefix, conn, text }) => {
  // Emoji de reacción inicial
  try { await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } }) } catch {}
  
const limit = 20
// --- VERSIÓN ORIGINAL ---
// Leemos desde global.subbots
const users = [...new Set([...global.subbots.filter((conn) => conn.user && conn.ws?.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];

// Emoji cuando se están procesando los bots
try { await conn.sendMessage(m.chat, { react: { text: '🤖', key: m.key } }) } catch {}

function dhms(ms) {
  var segundos = Math.floor(ms / 1000);
  var minutos = Math.floor(segundos / 60);
  var horas = Math.floor(minutos / 60);
  var días = Math.floor(horas / 24);

  segundos %= 60;
  minutos %= 60;
  horas %= 24;

  var resultado = "";
  if (días !== 0) {
    resultado += días + 'd '
  }
  if (horas !== 0) {
    resultado += horas + 'h '
  }
  if (minutos !== 0) {
    resultado += minutos + 'm '
  }
  if (segundos !== 0) {
    resultado += segundos + 's'
  }

  return resultado;
}

// Función para contar sesiones guardadas
async function info(path) {
    try {
        const items = await fs.readdir(path);
        return items.length;
    } catch (err) {
        console.error("Error:", err);
        return 0;
    }
}

const jadi = 'Sessions/SubBot'

// Generar lista de bots con la decoración solicitada
let botList = ''
users.forEach((v, index) => {
    const jid = v.user.jid.replace(/[^0-9]/g, '')
    const name = v.user.name || 'itsuki-sub'
    const uptime = v.uptime ? dhms(Date.now() - v.uptime) : "0s"

    botList += `🌷 *Nilou-v2 Sub*  *[ ${index + 1} ]*\n\n`
    botList += `🌱 *Tag :* +${jid}\n`
    botList += `🆔️ *ID :* wa.me/${jid}?text=.menu\n`
    botList += `🤖 *Bot :* Itsuki-V3 Sub\n`
    botList += `🕑 *Uptime :* ${uptime}\n`
    botList += `────────────────\n\n`
})

const totalUsers = users.length
const sesionesGuardadas = await info(jadi)

let cap = `# 📚 *Subbots activos : ${totalUsers}/100*\n\n`
cap += `💾 *Sesiones guardadas:* ${sesionesGuardadas}\n`
cap += `🟢 *Sesiones activas:* ${totalUsers}\n`

// ESPACIO ELIMINADO - si no hay bots, no mostrar nada más
if (totalUsers > 0) {
    if (totalUsers > limit) {
        cap += `\n> *[🧃] El número de subbots activos supera el límite de ${limit} por lo que no se mostrará la lista con los tags.*\n\n`
        // Aún así mostrar algunos (los primeros 5)
        const limitedUsers = users.slice(0, 5)
        limitedUsers.forEach((v, index) => {
            const jid = v.user.jid.replace(/[^0-9]/g, '')
            const name = v.user.name || 'itsuki-sub'
            const uptime = v.uptime ? dhms(Date.now() - v.uptime) : "0s"

            cap += `🌷 *Nilou-V2 Sub*  *[ ${index + 1} ]*\n`
            cap += `🌱 Tag : +${jid}\n`
            cap += `🆔️ ID : wa.me/${jid}?text=.menu\n`
            cap += `🤖 Bot : Itsuki-V3 Sub\n`
            cap += `🕑 Uptime : ${uptime}\n`
            cap += `────────────────\n\n`
        })
        cap += `*... y ${totalUsers - 5} bots más*`
    } else {
        cap += `\n${botList}`
    }
} else {
    // Cuando no hay bots, agregar un mensaje amigable sin espacio extra
    cap += `\n\n📭 *No hay subbots activos en este momento.*\n😊 *¡Sé el primero en crear uno!*`
}

// Obtener menciones para los tags
const mentions = users.map(v => v.user.jid)

// Obtener el quoted especial
const fkontak = await makeFkontak()

// Emoji de éxito cuando se va a enviar el mensaje
try { await conn.sendMessage(m.chat, { react: { text: '✅️', key: m.key } }) } catch {}

// Crear botón del canal oficial
const nativeButtons = [
  {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({ 
      display_text: '𝗖𝗔𝗡𝗔𝗟 𝗢𝗙𝗜𝗖𝗜𝗔𝗟 🌸', 
      url: 'https://whatsapp.com/channel/0029VbCJFHmFy72CvfvzSR0Q' 
    })
  }
]

try {
  // Usar la imagen del fkontak como imagen principal
  const imageUrl = "https://cdn.russellxz.click/a1d42213.jpg"
  const media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer })

  const header = proto.Message.InteractiveMessage.Header.fromObject({
    hasMediaAttachment: true,
    imageMessage: media.imageMessage
  })

  // Crear mensaje interactivo con botón
  const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
    body: proto.Message.InteractiveMessage.Body.fromObject({ text: cap }),
    header,
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
      buttons: nativeButtons
    })
  })

  const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { 
    userJid: conn.user.jid, 
    quoted: fkontak // Usar el quoted especial
  })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

} catch (e) {
  console.error('❌ Error al enviar mensaje interactivo:', e)
  // Fallback: enviar mensaje normal si falla el interactivo
  await conn.sendMessage(m.chat, {
    text: cap, 
    mentions: mentions,
    contextInfo: {
      mentionedJid: mentions,
      externalAdReply: {
        title: "🤖 LISTA DE SUBBOTS ACTIVOS",
        mediaType: 1,
        previewType: 0,
        renderLargerThumbnail: true,
        thumbnail: await (await fetch("https://cdn.russellxz.click/a1d42213.jpg")).buffer(),
        sourceUrl: ''
      }
    }
  }, { quoted: fkontak || m })
}
}

handler.help = ['botlist']
handler.tags = ['serbot']
handler.command = ['bots', 'listabots', 'subbots'] 
// handler.rowner = true

export default handler