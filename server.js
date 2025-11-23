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

    if (!text || typeof text !== 'string') {
        return res.json({ error: 'Falta el texto del pedido' });
    }

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    let order_id = null;
    let link = null;
    let quantity = 0;
    let username = null;
    let panel = 'Mazsocialmarket';

    if (text.toLowerCase().includes('marketfollowers') || 
        text.toLowerCase().includes('mf') || 
        text.includes('Tu pedido ha sido recibido')) {
        panel = 'MarketFollowers';
    }

    for (const line of lines) {
        const idMatch = line.match(/ID[\s:]*(\d+)/i);
        if (idMatch) order_id = idMatch[1];

        const linkMatch = line.match(/https?:\/\/[^\s]+/);
        if (linkMatch && !link) {
            link = linkMatch[0].split('?')[0];
            const userMatch = link.match(/instagram\.com\/([a-zA-Z0-9._]+)/) || 
                            link.match(/tiktok\.com\/@([a-zA-Z0-9._]+)/);
            if (userMatch) username = '@' + (userMatch[1] || userMatch[2]);
        }

        const qtyMatch = line.match(/Cantidad[\s:]*(\d+)/i);
        if (qtyMatch) quantity = parseInt(qtyMatch[1]);
    }

    if (!order_id || !link) {
        return res.json({ error: 'No se encontró ID o enlace válido' });
    }

    let start_count = 0;
    let status = 'Pendiente';

    const config = panel === 'MarketFollowers' ? PANEL_MF : PANEL_MAZ;

    try {
        const apiUrl = `${config.url}?key=${config.key}&action=status&order=${order_id}`;
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Panel activo - Soporte Maz + MarketFollowers`));
