import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

var handler = m => m
handler.all = async function (m) { 
global.canalIdM = [
  "120363424677971125@newsletter",
  "120363424677971125@newsletter",
  "120363424677971125@newsletter",
  "120363424677971125@newsletter"
]

global.canalNombreM = [
  "꒰ 🌾 NILOUV2-CHANNEL☃️🍃 ꒱", 
  "𝆺𝅥 𝆭 ִ ֗ 🌼 NILOUV2-CHANNEL  ☘️ ˚₊‧",
  "💫 NILOUV2-CHANNEL💭",
  "GABXZ » 𝐔𝐩𝐝𝐚𝐭𝐞 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 💫"
]

global.channelRD = await getRandomChannel()

global.d = new Date(new Date + 3600000)
global.locale = 'es'
global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
global.mes = d.toLocaleDateString('es', {month: 'long'})
global.año = d.toLocaleDateString('es', {year: 'numeric'})
global.tiempo = d.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true})

global.nombre = m.pushName || 'User-MD'
global.packsticker = ``

global.iconos = [
  'https://iili.io/qY3xHen.jpg',
  'https://iili.io/qY3R972.jpg',
  'https://iili.io/qY3uwns.jpg',
  'https://iili.io/qY3utSV.jpg',
  'https://iili.io/qY3ABRI.jpg',
  'https://iili.io/qY3R972.jpg'
]
global.icono = global.iconos[Math.floor(Math.random() * global.iconos.length)]

global.wm = '© IAM | GABXZ'
global.wm3 = '⫹⫺ 𝙈𝙪𝙡𝙩𝙞-𝘿𝙚𝙫𝙞𝙘𝙚 💻'
global.author = '🍃 MADE BY LEO 🍃'
global.dev = '© owner-gabxz ☘️'
global.textbot = 'Nilou|IAV3 Gabxz'
global.etiqueta = '@Gabxz'
global.gt = '© 𝐂𝐫𝐞𝐚𝐝𝐨 𝐏𝐨𝐫 Gabxz Nilou-𝐂𝐡𝐚𝐧 𝐓𝐡𝐞 𝐁𝐞𝐬𝐭 𝐁𝐨𝐭𝐬 𝐎𝐟 𝐖𝐡𝐚𝐭𝐬𝐚𝐩𝐩 🤖👑'
global.me = '🌨️ NILOU NEW 2026 🌾'

global.fkontak = { 
  key: { 
    participants: "0@s.whatsapp.net", 
    remoteJid: "status@broadcast", 
    fromMe: false, 
    id: "Halo" 
  }, 
  message: { 
    contactMessage: { 
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
    }
  }, 
  participant: "0@s.whatsapp.net" 
}

global.rcanal = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: channelRD.id, 
      serverMessageId: '', 
      newsletterName: channelRD.name 
    }, 
    externalAdReply: { 
      title: global.botname, 
      body: global.dev, 
      mediaUrl: null, 
      description: null, 
      previewType: "PHOTO", 
      thumbnailUrl: global.icono,
      sourceUrl: '', 
      mediaType: 1, 
      renderLargerThumbnail: false 
    }, 
    mentionedJid: null 
  }
}

global.listo = '*Aqui tiene*'
global.moneda = 'Yenes'
global.prefix = ['.', '!', '/', '#', '%']
}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * global.canalIdM.length)
let id = global.canalIdM[randomIndex]
let name = global.canalNombreM[randomIndex]
return { id, name }
}

if (!Array.prototype.getRandom) {
Array.prototype.getRandom = function() {
return this[Math.floor(Math.random() * this.length)]
}
}