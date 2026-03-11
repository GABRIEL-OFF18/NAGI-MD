import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!text) {
    return conn.reply(m.chat,
`╭━━━〔 🎴 𝐁𝐔𝐒𝐂𝐀𝐃𝐎𝐑 𝐃𝐄 𝐌𝐀𝐍𝐆𝐀 🎴 〕━━━⬣
│ 🔍 *Falta el nombre del manga*
│ 
│ 📋 *Uso del comando:*
│ ${usedPrefix + command} <nombre_manga>
│ 
│ 🎯 *Ejemplo:*
│ ${usedPrefix + command} One Piece
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Nilou espera tu búsqueda...* 📚`, 
    m, ctxWarn)
  }

  // Emoji de reacción de búsqueda
  await m.react('🕑')

  try {
    let res = await fetch('https://api.jikan.moe/v4/manga?q=' + text)

    if (!res.ok) {
      await m.react('❌')
      return conn.reply(m.chat,
`╭━━━〔 💎 𝐄𝐑𝐑𝐎𝐑 💎 〕━━━⬣
│ ❌ *Servidor no disponible*
│ 
│ 📡 Error en conexión API
│ 🕒 Intenta nuevamente más tarde
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Nilou lamenta el inconveniente...* (´；ω；\`)`, 
      m, ctxErr)
    }

    let json = await res.json()

    if (!json.data || json.data.length === 0) {
      await m.react('❌')
      return conn.reply(m.chat,
`╭━━━〔 🎴 𝐒𝐈𝐍 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 🎴 〕━━━⬣
│ 🔍 *Manga no encontrado*
│ 
│ 🎯 Término: ${text}
│ 📚 No se encontró en base de datos
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Nilou sugiere verificar el nombre...* 📖`, 
      m, ctxErr)
    }

    let manga = json.data[0]
    let { chapters, title_japanese, url, type, score, members, status, volumes, synopsis, favorites, published, genres, authors } = manga

    let author = authors?.[0]?.name || 'Desconocido'
    let title_english = manga.title_english || manga.title
    let title = manga.title
    let genreList = genres?.map(g => g.name).join(', ') || 'No especificado'

    let mangainfo = 
`╭━━━〔 💎 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍 𝐃𝐄𝐋 𝐌𝐀𝐍𝐆𝐀 💎 〕━━━⬣
│ 🎴 *Título Japonés:* ${title_japanese}
│ 🏷️ *Título Inglés:* ${title_english}
│ 📖 *Título Principal:* ${title}
│ 
│ 📊 *Capítulos:* ${chapters || 'En publicación'}
│ 🎞️ *Tipo:* ${type}
│ 🗂️ *Estado:* ${status}
│ 📚 *Volúmenes:* ${volumes || 'En publicación'}
│ 
│ ⭐ *Favoritos:* ${favorites?.toLocaleString() || '0'}
│ 🎯 *Puntaje:* ${score || 'N/A'}
│ 👥 *Miembros:* ${members?.toLocaleString() || '0'}
│ 🎭 *Géneros:* ${genreList}
│ 
│ 👨‍🔬 *Autor:* ${author}
│ 📅 *Publicación:* ${published?.string || 'N/A'}
│ 
│ 🔗 *URL:* ${url}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

📝 *Sinopsis:*
${synopsis ? synopsis.substring(0, 400) + (synopsis.length > 400 ? '...' : '') : 'Sinopsis no disponible'}

🎀 *Itsuki te presenta información detallada del manga* 🌟`

    // Enviar imagen con información
    await conn.sendFile(m.chat, manga.images.jpg.image_url, 'manga.jpg', mangainfo, m)

    // Emoji de reacción de éxito
    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('❌')

    await conn.reply(m.chat,
`╭━━━〔 💎 𝐄𝐑𝐑𝐎𝐑 𝐂𝐑𝐈𝐓𝐈𝐂𝐎 💎 〕━━━⬣
│ ❌ *Error en la búsqueda*
│ 
│ 📝 Detalles: ${error.message}
╰━━━━━━━━━━━━━━━━━━━━━━⬣

💮 *Nilou no pudo completar la búsqueda...* (´；ω；\`)`, 
    m, ctxErr)
  }
}

handler.help = ['infomanga'] 
handler.tags = ['anime'] 
handler.group = true;
handler.command = ['infoanime'] 

export default handler