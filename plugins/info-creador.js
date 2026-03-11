import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: '👑', key: m.key } })

    const menuText = `> *@𓆩Hola Soy 𝗀𝖺𝖻𝗑𝗓 𝖢𝗋𝖾𝖺𝖽𝗈𝗋 De 𝖭𝗂𝗅𝗈𝗎 La Bot Que Estas Usando*\n\n> sᴇʟᴇᴄɪᴏɴᴀ ᴜɴ ᴍᴇᴛᴏᴅᴏ ᴘᴀʀᴀ ᴄᴏᴍᴜɴɪᴄᴀʀᴛᴇ ᴄᴏɴᴍɪɢᴏ𓆪 :`

    const imageUrl = 'https://cdn.russellxz.click/892b3d23.jpg'

    const nativeButtons = [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '𝙄𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢 📸', 
          url: 'https://www.instagram.com/𝗀𝖺𝖻𝗋𝗂𝖾𝗅' 
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '𝙊𝙬𝙣𝙚𝙧 👑', 
          url: 'https://wa.me/59175850453' 
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({ 
          display_text: '𝗧𝗜𝗞𝗧𝗢𝗞 ❤️‍🩹', 
          url: 'https://paypal.me/Erenxs01' 
        })
      }
    ]

    // === Imagen desde URL ===
    const media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer })
    const header = proto.Message.InteractiveMessage.Header.fromObject({
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    })

    // === Crear mensaje interactivo ===
    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: menuText }),
      header,
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: nativeButtons
      })
    })

    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.jid, quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('❌ Error en el comando owner:', e)
    await conn.sendMessage(m.chat, {
      text: `❌ *Error al cargar la información del creador*\n\n🔗 Contacta directamente: https://wa.me/573187418668\n\n⚠️ *Error:* ${e.message}`
    }, { quoted: m })
  }
}

handler.help = ['owner', 'creador']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'contacto']

export default handler