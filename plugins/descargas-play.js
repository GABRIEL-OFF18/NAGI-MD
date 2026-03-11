import yts from "yt-search"
import fetch from "node-fetch"

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply("🎶 Ingresa el nombre del video de YouTube o su enlace.")

  await m.react("🕘")

  try {
    let url = text
    let title = "Desconocido"
    let rcanal = "Desconocido"       // ← Cambié authorName → rcanal
    let durationTimestamp = "Desconocida"
    let views = "Desconocidas"
    let thumbnail = ""

    if (!text.startsWith("https://")) {
      const res = await yts(text)
      if (!res?.videos?.length) return m.reply("🚫 No encontré nada.")
      const video = res.videos[0]
      title = video.title
      rcanal = video.author?.name || "Canal desconocido"
      durationTimestamp = video.timestamp || "??:??"
      views = video.views || 0
      url = video.url
      thumbnail = video.thumbnail
    }

    const vistas = formatViews(views)

    const res3 = await fetch("https://files.catbox.moe/wfd0ze.jpg")
    const thumb3 = Buffer.from(await res3.arrayBuffer())

    const fkontak = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        locationMessage: {
          name: `『 ${title} 』`,
          jpegThumbnail: thumb3
        }
      }
    }

    const caption = `
✧━───『 𝙸𝚗𝚏𝚘 𝚍𝚎𝚕 𝚅𝚒𝚍𝚎𝚘 』───━✧

🎼 Título     : ${title}
📺 **Canal**   : ${rcanal}          ← aquí está rcanal
👁️ Vistas     : ${vistas}
⏳ Duración   : ${durationTimestamp}
🌐 Enlace     : ${url}

✧━───『 𝑺𝒉𝒂𝒅𝒐𝒘 𝑩𝒐𝒕 』───━✧
⚡ Powered by Yosue ⚡
`

    const thumb = (await conn.getFile(thumbnail)).data

    await conn.sendMessage(
      m.chat,
      {
        image: thumb,
        caption,
        footer: "⚡ Shadow — Descargas rápidas ⚡",
        headerType: 4
      },
      { quoted: fkontak }
    )

    await downloadMedia(conn, m, url, fkontak, rcanal, title)   // ← paso rcanal y title

    await m.react("✅")
  } catch (e) {
    m.reply("❌ Error: " + e.message)
    m.react("⚠️")
  }
}

const downloadMedia = async (conn, m, url, quotedMsg, rcanal, title) => {
  try {
    const sent = await conn.sendMessage(
      m.chat,
      { text: "🎵 Descargando audio..." },
      { quoted: m }
    )

    const apiUrl = `https://api-adonix.ultraplus.click/download/ytaudio?url=${encodeURIComponent(url)}&apikey=SHADOWBOTKEYMD`
    const r = await fetch(apiUrl)
    const data = await r.json()

    if (!data?.status || !data?.data?.url)
      return m.reply("🚫 No se pudo descargar el archivo.")

    const fileUrl = data.data.url
    
    // Nombre más claro: Título + Canal (limitado en longitud)
    const fileTitle = cleanName(`${title} - ${rcanal}`) || cleanName(title) || "audio"

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: fileUrl },
        mimetype: "audio/mpeg",
        fileName: fileTitle + ".mp3",
        ptt: false
      },
      { quoted: quotedMsg }
    )

    await conn.sendMessage(
      m.chat,
      { 
        text: `✅ Descarga completada\n\n🎼 ${title}\n📺 ${rcanal}`, 
        edit: sent.key 
      }
    )

    await m.react("✅")
  } catch (e) {
    console.error(e)
    m.reply("❌ Error: " + e.message)
    m.react("💀")
  }
}

const cleanName = (name) =>
  name
    .replace(/[^\w\s-_.]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 60)

const formatViews = (views) => {
  if (views === undefined || views === null || isNaN(views)) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K`
  return views.toLocaleString()
}

handler.command = ["play", "yt", "ytsearch"]
handler.tags = ["downloader"]
handler.register = true

export default handler