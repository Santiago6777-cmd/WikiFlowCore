const { Client, GatewayIntentBits } = require('discord.js');
const { Redis } = require('@upstash/redis');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Usamos variables de entorno para Upstash por seguridad
const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const CHANNEL_ID = '1530781381569810564';

client.once('clientReady', () => {
  console.log(`¡Bot encendido y conectado como ${client.user.tag}!`);
});

app.post('/api/enviar-sugerencia', async (req, res) => {
  try {
    const { tipo, contenido, autor } = req.body;

    const canal = await client.channels.fetch(CHANNEL_ID);
    if (!canal) {
      return res.status(404).json({ error: 'No se encontró el canal en Discord' });
    }

    const mensajeFormateado = `**Nuevo ${tipo === 'reporte' ? '🚨 Reporte' : '💡 Sugerencia'}**\n` +
                              `> ${contenido}\n` +
                              `*Enviado por: ${autor || 'Anónimo'}*`;

    await canal.send(mensajeFormateado);

    res.json({ success: true, message: 'Enviado a Discord correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al enviar el mensaje' });
  }
});

// Render asigna el puerto automáticamente con process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor HTTP del bot escuchando en el puerto ${PORT}`);
});

// ¡Token protegido con variable de entorno!
client.login(process.env.DISCORD_TOKEN);