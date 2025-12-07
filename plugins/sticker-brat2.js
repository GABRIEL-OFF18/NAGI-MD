import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let handler = async (m, { conn, text, usedPrefix, command }) => {
    //Fixieada por ZzawX
    
    try {
        await m.react('🕒');

        if (!text) {
            await m.react('❔');
            return conn.reply(m.chat, 
                '> `❌ TEXTO FALTANTE`\n\n' +
                '> `📝 Debes escribir texto después del comando`\n\n' +
                '> `💡 Ejemplo:` *' + usedPrefix + command + ' texto aquí*', 
                m
            );
        }

        // Primero verifiquemos qué devuelve la API
        let apiUrl = `https://apizell.web.id/tools/bratanimate?q=${encodeURIComponent(text)}`;
        console.log('🔍 URL de API:', apiUrl);

        // Usar fetch nativo
        let response = await fetch(apiUrl);
        
        // Verificar tipo de contenido
        const contentType = response.headers.get('content-type');
        console.log('📄 Content-Type:', contentType);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        console.log('📦 Tamaño del buffer:', buffer.byteLength, 'bytes');
        
        if (buffer.byteLength < 100) {
            throw new Error('Respuesta demasiado pequeña');
        }

        // Verificar si es imagen/video válido
        const arr = new Uint8Array(buffer.slice(0, 12));
        console.log('🔬 Bytes iniciales:', Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(' '));
        
        await m.react('✅️');

        const username = m.pushName || m.sender.split('@')[0] || "Usuario";
        
        // Enviar como sticker directamente
        await conn.sendMessage(m.chat, {
            sticker: Buffer.from(buffer),
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `𝐈𝐭𝐬𝐮𝐤𝐢𝐁𝐨𝐭-𝐌𝐃`,
                    body: `𝗦𝗼𝗹𝗶𝗰𝗶𝘁𝗮𝗱𝗼 𝗽𝗼𝗿: ${username}\n𝗖𝗿𝗲𝗮𝗱𝗼𝗿: 𝗟𝗲𝗼𝗗𝗲𝘃`,
                    thumbnailUrl: 'https://files.catbox.moe/yxcu1g.png',
                    sourceUrl: 'https://whatsapp.com/channel/0029Va9VhS8J5+50254766704',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('❌ Error en brat2:', error);
        
        await m.react('❌');
        
        let errorMessage = '> `❌ ERROR ENCONTRADO`\n\n';
        
        if (error.message.includes('HTTP')) {
            errorMessage += `> \`📝 Error en la API: ${error.message}\``;
        } else if (error.message.includes('demasiado pequeña')) {
            errorMessage += '> `📝 El servicio devolvió un archivo vacío o corrupto.`';
        } else {
            errorMessage += `> \`📝 ${error.message}\``;
        }

        await conn.reply(m.chat, errorMessage, m);
    }
};

handler.help = ['brat2'];
handler.tags = ['sticker'];
handler.command = ['brat2'];
handler.group = true;

export default handler;