const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// === TUS DOS PANELES ===
const PANEL_MAZ = {
    url: 'https://mazsocialmarket.com/api/v2',
    key: '263c3041af21a8dc1249ba001235c504'
};

const PANEL_MF = {
    url: 'https://marketfollowers.com/api/v2',
    key: '1ecfe63ac560f68b88daa82e867a02b3'  // TU CLAVE REAL
};

app.post('/api/followers', async (req, res) => {
    const { text, current_followers } = req.body;

    console.log('Cuerpo completo de la solicitud:', JSON.stringify(req.body));
    console.log('Texto recibido (sin procesar):', JSON.stringify(text));

    try {
        if (!text || typeof text !== 'string') {
            return res.json({ error: 'El campo text debe ser una cadena no vacía.' });
        }

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        let order_id = null;
        let link = null;
        let quantity = 0;
        let username = null;
        let panel = 'Mazsocialmarket'; // por defecto

        // === DETECTAR SI ES MARKETFOLLOWERS ===
        if (text.toLowerCase().includes('marketfollowers') || 
            text.toLowerCase().includes('mf') || 
            text.includes('Tu pedido ha sido recibido')) {
            panel = 'MarketFollowers';
        }

        // === EXTRAER DATOS DEL TEXTO (igual que antes) ===
        for (const line of lines) {
            // ID
            const idMatch = line.match(/ID[\s:]*(\d+)/i);
            if (idMatch) order_id = idMatch[1];

            // Link
            const linkMatch = line.match(/https?:\/\/[^\s]+/);
            if (linkMatch && !link) {
                link = linkMatch[0].split('?')[0];
                const userMatch = link.match(/instagram\.com\/([a-zA-Z0-9._]+)/) || 
                                link.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/);
                if (userMatch) {
                    username = '@' + (userMatch[1] || userMatch[2]);
                }
            }

            // Cantidad
            const qtyMatch = line.match(/Cantidad[\s:]*(\d+)/i);
            if (qtyMatch) quantity = parseInt(qtyMatch[1]);
        }

        if (!order_id || !link) {
            return res.json({ error: 'No se encontró ID o enlace válido' });
        }

        let start_count = 0;
        let status = 'Pendiente';

        // === CONSULTAR LA API CORRECTA ===
        const config = panel === 'MarketFollowers' ? PANEL_MF : PANEL_MAZ;

        try {
            const apiUrl = `${config.url}?key=${config.key}&action=status&order=${order_id}`;
            console.log(`Consultando ${panel}: ${apiUrl}`);
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data && !data.error) {
                start_count = parseInt(data.start_count || data.start || 0);
                status = data.status || 'Pendiente';
                if (data.username) username = '@' + data.username;
            }
        } catch (e) {
            console.log(`Error consultando ${panel}:`, e.message);
        }

        const total_esperado = start_count + quantity;

        let followers_difference = null;
        if (current_followers !== undefined && !isNaN(current_followers)) {
            followers_difference = parseInt(current_followers) - total_esperado;
        }

        // === RESPUESTA FINAL (igual que antes) ===
        res.json({
            username: username || 'No detectado',
            order_id,
            start_count,
            charge: quantity,
            previous_followers: total_esperado,
            status,
            followers_difference,
            queried_at: new Date().toISOString(),
            panel_detected: panel
        });

    } catch (error) {
        console.error('ERROR:', error.message);
        return res.json({
            username: null,
            order_id: null,
            start_count: 0,
            charge: 0,
            previous_followers: 0,
            status: 'Pendiente',
            followers_difference: null,
            queried_at: new Date().toISOString(),
            error: 'Error de conexión: ' + error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Panel activo en puerto ${PORT} - Soporte Mazsocialmarket + MarketFollowers`));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Panel Influmarket Col activo en puerto ${PORT}`);
    console.log(`Soporte completo: Mazsocialmarket + MarketFollowers (cualquier servicio)`);
});
