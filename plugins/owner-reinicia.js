import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

function run(cmd, cwd = ROOT) {
  return new Promise((resolve, reject) => {
    const child = exec(cmd, { cwd, windowsHide: true, maxBuffer: 1024 * 1024 * 8 }, (err, stdout, stderr) => {
      if (err) return reject(Object.assign(err, { stdout, stderr }))
      resolve({ stdout, stderr })
    })
  })
}

async function hasGit() {
  try { await run('git --version'); return true } catch { return false }
}

function isGitRepo() {
  try { return fs.existsSync(path.join(ROOT, '.git')) } catch { return false }
}

// Guardar información del chat para el mensaje de reconexión
function saveRestartInfo(chatId) {
  const restartFile = path.join(ROOT, 'temp', 'restart_info.json')
  const info = {
    chatId: chatId,
    timestamp: Date.now(),
    type: 'restart'
  }

  // Asegurarse de que la carpeta temp existe
  const tempDir = path.join(ROOT, 'temp')
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  fs.writeFileSync(restartFile, JSON.stringify(info, null, 2))
}

let handler = async (m, { conn, usedPrefix, command, isOwner, isROwner }) => {
  // Solo owner/root owner
  if (!(isOwner || isROwner)) return

  // Guardar información para el mensaje de reconexión
  saveRestartInfo(m.chat)

  // Emoji de espera
  await m.react('🕑')

  let logs = []
  const pushLog = (title, data) => {
    if (!data) return
    const body = [data.stdout, data.stderr].filter(Boolean).join('\n').trim()
    const trimmed = body.length > 1500 ? body.slice(-1500) : body
    logs.push(`> ${title}:\n\`\`\`${trimmed || '(sin salida)'}\`\`\``)
  }

  // 1) git pull si aplica
  try {
    if (isGitRepo() && (await hasGit())) {
      const res = await run('git --no-pager pull --rebase --autostash')
      pushLog('🎄 Actualización Git', res)
    } else {
      logs.push('> 🎄 Actualización Git: omitido (no es repo o no hay git)')
    }
  } catch (e) {
    pushLog('🎄 Actualización Git (ERROR)', e)
  }

  // 2) npm install
  try {
    const res = await run('npm install --no-audit --no-fund')
    pushLog('📦 Instalación de Dependencias', res)
  } catch (e) {
    pushLog('📦 Instalación de Dependencias (ERROR)', e)
  }

  // Emoji de éxito antes de reiniciar
  await m.react('✅')

  // Resumen navideño al chat
  try {
    await conn.reply(
      m.chat,
      `> 🤖 *BOT EN LÍNEANUEVAMENTE SISTEM ONLINE 🍃*

> 🌐 *Estado del servidor:* Conectado
> ⚡ *Servicios:* Activos
> 🎯 *Funciones:* Operativas
> ⚙️ ${logs.join('\n\n')}
> 📊 *Información del sistema:*
> 🕑 Tiempo de reconexión: ${Date.now() - info.timestamp}ms
> 🔰 Estado: ✅ Conectado al servidor
> 💾 Servicios: 🟢 Todos operativos

> 🌾 *¡Nilou V2 está listo para ayudarte de nuevo!*
> 🌾 *¡2025-2026!* ☘️`.slice(0, 3500),
      m
    )
  } catch {}

  // Pequeño delay y salir
  setTimeout(() => {
    try { process.exit(0) } catch {}
  }, 3000)
}

// Función para enviar mensaje de reconexión (se debe llamar cuando el bot se conecte)
export async function sendReconnectionMessage(conn) {
  const restartFile = path.join(ROOT, 'temp', 'restart_info.json')
  
  if (fs.existsSync(restartFile)) {
    try {
      const info = JSON.parse(fs.readFileSync(restartFile, 'utf8'))
      
      // Limpiar archivo temporal
      fs.unlinkSync(restartFile)

    } catch (error) {
      console.error('❌ Error leyendo información de reinicio:', error)
    }
  }
}

handler.help = ['reiniciar', 'restart']
handler.tags = ['owner']
handler.command = /^(fix|reiniciar)$/i
handler.rowner = true

export default handler