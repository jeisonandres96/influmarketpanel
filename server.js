const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const PANEL_API_URL = 'https://mazsocialmarket.com/api/v2';
const API_KEY = '263c3041af21a8dc1249ba001235c504';

app.post('/api/followers', async (req, res) => {
    const { text, current_followers } = req.body;

    console.log('📥 Cuerpo completo de la solicitud:', JSON.stringify(req.body));
    console.log('📥 Texto recibido (sin procesar):', JSON.stringify(text));

    try {
        // Validar que text sea una cadena válida
        if (!text || typeof text !== 'string') {
            console.log('❌ Error: El campo text es inválido o no está presente');
            return res.json({ error: 'El campo text debe ser una cadena no vacía.' });
        }

        // Normalizar texto: eliminar espacios extra y caracteres invisibles
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        console.log('📝 Texto normalizado:', JSON.stringify(normalizedText));

        // CASO 1: SOLO ID (cualquier número entero)
        const idOnlyMatch = normalizedText.match(/^\d+$/);
        if (idOnlyMatch) {
            const order_id = idOnlyMatch[0];
            console.log('✅ Extraído - ID:', order_id);

            // Simulación para ID 1162530
            if (order_id === '1162530') {
                console.log('📦 Simulando respuesta para ID:', order_id);
                const panelData = {
                    start_count: 385,
                    status: 'Completed',
                    remains: 0,
                    username: 'urregodn_09'
                };

                const start_count = parseInt(panelData.start_count);
                const status = panelData.status;
                const username = panelData.username || null;
                const previous_followers = start_count;

                console.log('✅ Seguidores iniciales:', start_count);
                console.log('✅ Seguidores iniciales totales:', previous_followers);
                console.log('✅ Estado:', status);
                if (username) console.log('✅ Username:', username);

                let followers_difference = null;
                if (current_followers !== undefined && current_followers !== null && !isNaN(current_followers)) {
                    followers_difference = parseInt(current_followers) - previous_followers;
                    console.log('✅ Diferencia de seguidores:', followers_difference);
                }

                return res.json({
                    username,
                    order_id,
                    start_count,
                    previous_followers,
                    status,
                    followers_difference,
                    queried_at: new Date().toISOString()
                });
            }

            // Consultar API real
            console.log('📦 Consultando Mazsocialmarket API:', order_id);
            const panelResponse = await fetch(`${PANEL_API_URL}?key=${API_KEY}&action=status&order=${order_id}`);
            const panelData = await panelResponse.json();

            console.log('📄 API Respuesta:', panelData);

            if (panelData.error || !panelData.start_count || !panelData.status) {
                console.log('❌ Error en API: No se encontró el pedido, start_count o status.', panelData);
                return res.json({ error: 'No se encontró el pedido, start_count o status.' });
            }

            const start_count = parseInt(panelData.start_count);
            const status = panelData.status;
            const username = panelData.username || null;
            const previous_followers = start_count;

            console.log('✅ Seguidores iniciales:', start_count);
            console.log('✅ Seguidores iniciales totales:', previous_followers);
            console.log('✅ Estado:', status);
            if (username) console.log('✅ Username:', username);

            let followers_difference = null;
            if (current_followers !== undefined && current_followers !== null && !isNaN(current_followers)) {
                followers_difference = parseInt(current_followers) - previous_followers;
                console.log('✅ Diferencia de seguidores:', followers_difference);
            }

            return res.json({
                username,
                order_id,
                start_count,
                previous_followers,
                status,
                followers_difference,
                queried_at: new Date().toISOString()
            });
        }

        // CASO 2: CANTIDAD (ej. "Cantidad 400")
        const quantityOnlyMatch = normalizedText.match(/^Cantidad:?\s*(\d+)$/i);
        if (quantityOnlyMatch) {
            const quantity = parseInt(quantityOnlyMatch[1]);
            console.log('✅ Extraído - Cantidad:', quantity);

            return res.json({
                charge: quantity,
                queried_at: new Date().toISOString(),
                error: 'Solo se proporcionó la cantidad. Ingresa un ID para consultar la API.'
            });
        }

        // CASO 3: ID Y CANTIDAD (ej. "1162530 Cantidad 400")
        const idAndQuantityMatch = normalizedText.match(/^(\d+)\s+Cantidad:?\s*(\d+)$/i);
        if (idAndQuantityMatch) {
            const order_id = idAndQuantityMatch[1];
            const quantity = parseInt(idAndQuantityMatch[2]);
            console.log('✅ Extraído - ID:', order_id, 'Cantidad:', quantity);

            // Simulación para ID 1162530
            if (order_id === '1162530') {
                console.log('📦 Simulando respuesta para ID:', order_id);
                const panelData = {
                    start_count: 385,
                    status: 'Completed',
                    remains: 0,
                    username: 'urregodn_09'
                };

                const start_count = parseInt(panelData.start_count);
                const status = panelData.status;
                const charge = quantity;
                const username = panelData.username || null;
                const previous_followers = start_count + charge;

                console.log('✅ Seguidores iniciales:', start_count);
                console.log('✅ Cantidad comprada (texto):', charge);
                console.log('✅ Seguidores iniciales totales:', previous_followers);
                console.log('✅ Estado:', status);
                if (username) console.log('✅ Username:', username);

                let followers_difference = null;
                if (current_followers !== undefined && current_followers !== null && !isNaN(current_followers)) {
                    followers_difference = parseInt(current_followers) - previous_followers;
                    console.log('✅ Diferencia de seguidores:', followers_difference);
                }

                return res.json({
                    username,
                    order_id,
                    start_count,
                    charge,
                    previous_followers,
                    status,
                    followers_difference,
                    queried_at: new Date().toISOString()
                });
            }

            // Consultar API real
            console.log('📦 Consultando Mazsocialmarket API:', order_id);
            const panelResponse = await fetch(`${PANEL_API_URL}?key=${API_KEY}&action=status&order=${order_id}`);
            const panelData = await panelResponse.json();

            console.log('📄 API Respuesta:', panelData);

            if (panelData.error || !panelData.start_count || !panelData.status) {
                console.log('❌ Error en API: No se encontró el pedido, start_count o status.', panelData);
                return res.json({ error: 'No se encontró el pedido, start_count o status.' });
            }

            const start_count = parseInt(panelData.start_count);
            const status = panelData.status;
            const charge = quantity;
            const username = panelData.username || null;
            const previous_followers = start_count + charge;

            console.log('✅ Seguidores iniciales:', start_count);
            console.log('✅ Cantidad comprada (texto):', charge);
            console.log('✅ Seguidores iniciales totales:', previous_followers);
            console.log('✅ Estado:', status);
            if (username) console.log('✅ Username:', username);

            let followers_difference = null;
            if (current_followers !== undefined && current_followers !== null && !isNaN(current_followers)) {
                followers_difference = parseInt(current_followers) - previous_followers;
                console.log('✅ Diferencia de seguidores:', followers_difference);
            }

            return res.json({
                username,
                order_id,
                start_count,
                charge,
                previous_followers,
                status,
                followers_difference,
                queried_at: new Date().toISOString()
            });
        }

        // CASO 4: ID Y LINK
        const idAndLinkMatch = normalizedText.match(/(\d+)\s+(https:\/\/(www\.|vm\.)?(instagram|tiktok)\.com\/[@a-zA-Z0-9._-]+(?:\?[^ ]*)?)/i);
        if (idAndLinkMatch) {
            const order_id = idAndLinkMatch[1];
            const manual_url = idAndLinkMatch[2].split('?')[0];
            const platform = idAndLinkMatch[3].toLowerCase() === 'tiktok' ? 'TikTok' : 'Instagram';
            console.log('✅ Extraído - ID:', order_id, 'URL:', manual_url, 'Plataforma:', platform);

            // Consultar API
            console.log('📦 Consultando Mazsocialmarket API:', order_id);
            const panelResponse = await fetch(`${PANEL_API_URL}?key=${API_KEY}&action=status&order=${order_id}`);
            const panelData = await panelResponse.json();

            console.log('📄 API Respuesta:', panelData);

            if (panelData.error || !panelData.start_count || !panelData.status) {
                console.log('❌ Error en API: No se encontró el pedido, start_count o status.', panelData);
                return res.json({ error: 'No se encontró el pedido, start_count o status.' });
            }

            const start_count = parseInt(panelData.start_count);
            const status = panelData.status;
            const username = panelData.username || (manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/) ? manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/)[2] : null);
            const previous_followers = start_count;

            console.log('✅ Seguidores iniciales:', start_count);
            console.log('✅ Seguidores iniciales totales:', previous_followers);
            console.log('✅ Estado:', status);
            if (username) console.log('✅ Username:', username);

            let followers_difference = null;
            if (current_followers !== undefined && current_followers !== null && !isNaN(current_followers)) {
                followers_difference = parseInt(current_followers) - previous_followers;
                console.log('✅ Diferencia de seguidores:', followers_difference);
            }

            return res.json({
                username,
                order_id,
                start_count,
                previous_followers,
                status,
                followers_difference,
                queried_at: new Date().toISOString()
            });
        }

        // CASO 5: SOLO LINK
        const isLinkOnly = normalizedText.match(/^https:\/\/(www\.|vm\.)?(instagram|tiktok)\.com\/[@a-zA-Z0-9._-]+(?:\?[^ ]*)?$/i);
        if (isLinkOnly) {
            const manual_url = isLinkOnly[0].split('?')[0];
            const platform = isLinkOnly[2].toLowerCase() === 'tiktok' ? 'TikTok' : 'Instagram';
            console.log('📊 Solo link - URL:', manual_url, 'Plataforma:', platform);
            const username = manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/) ? manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/)[2] : null;
            if (!username) {
                console.log('❌ No se pudo extraer username del enlace:', manual_url);
                return res.json({ error: 'No se pudo extraer el username del enlace.' });
            }
            const previous_followers = current_followers && !isNaN(current_followers) ? parseInt(current_followers) : 0;

            return res.json({
                username,
                previous_followers,
                queried_at: new Date().toISOString()
            });
        }

        // CASO 6: TEXTO COMPLETO (con líneas adicionales o formato simplificado)
        if (text) {
            // Procesar texto línea por línea
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            console.log('🔍 Líneas procesadas:', lines);
            let order_id = null;
            let manual_url = null;
            let quantity = null;
            let platform = 'Instagram';

            for (const line of lines) {
                console.log('🔍 Procesando línea:', JSON.stringify(line));
                const idMatch = line.match(/^(?:ID:)?\s*(\d+)/i);
                const urlMatch = line.match(/^(?:Enlace:)?\s*(https:\/\/(www\.|vm\.)?(instagram|tiktok)\.com\/[@a-zA-Z0-9._-]+(?:\?[^ ]*)?)/i);
                const quantityMatch = line.match(/^Cantidad:?\s*(\d+)/i);

                if (idMatch && !order_id) {
                    order_id = idMatch[1];
                    console.log('🔍 ID extraído:', order_id);
                }
                if (urlMatch && !manual_url) {
                    manual_url = urlMatch[1].split('?')[0];
                    platform = urlMatch[3].toLowerCase() === 'tiktok' ? 'TikTok' : 'Instagram';
                    console.log('🔍 URL extraída:', manual_url, 'Plataforma:', platform);
                }
                if (quantityMatch && !quantity) {
                    quantity = parseInt(quantityMatch[1]);
                    console.log('🔍 Cantidad extraída:', quantity);
                }
            }

            console.log('🔍 Resultado extracción - ID:', order_id, 'URL:', manual_url, 'Cantidad:', quantity, 'Plataforma:', platform);

            if (order_id && manual_url && quantity) {
                console.log('✅ Extraído - ID:', order_id, 'URL:', manual_url, 'Cantidad (texto):', quantity, 'Plataforma:', platform);

                // Simulación para ID 1162530
                if (order_id === '1162530') {
                    console.log('📦 Simulando respuesta para ID:', order_id);
                    const panelData = {
                        start_count: 385,
                        status: 'Completed',
                        remains: 0,
                        username: 'urregodn_09'
                    };

                    const start_count = parseInt(panelData.start_count);
                    const status = panelData.status;
                    const charge = quantity;
                    const username = panelData.username || (manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/) ? manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/)[2] : null);

                    const previous_followers = start_count + charge;

                    console.log('✅ Seguidores iniciales:', start_count);
                    console.log('✅ Cantidad comprada (texto):', charge);
                    console.log('✅ Seguidores iniciales totales:', previous_followers);
                    console.log('✅ Estado:', status);
                    if (username) console.log('✅ Username:', username);

                    let followers_difference = null;
                    if (current_followers !== undefined && current_followers !== null && !isNaN(current_followers)) {
                        followers_difference = parseInt(current_followers) - previous_followers;
                        console.log('✅ Diferencia de seguidores:', followers_difference);
                    }

                    return res.json({
                        username,
                        order_id,
                        start_count,
                        charge,
                        previous_followers,
                        status,
                        followers_difference,
                        queried_at: new Date().toISOString()
                    });
                }

                // Consultar API real
                console.log('📦 Consultando Mazsocialmarket API:', order_id);
                const panelResponse = await fetch(`${PANEL_API_URL}?key=${API_KEY}&action=status&order=${order_id}`);
                const panelData = await panelResponse.json();

                console.log('📄 API Respuesta:', panelData);

                if (panelData.error || !panelData.start_count || !panelData.status) {
                    console.log('❌ Error en API: No se encontró el pedido, start_count o status.', panelData);
                    return res.json({
                        username: manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/) ? manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/)[2] : null,
                        order_id,
                        start_count: 0,
                        charge: quantity,
                        previous_followers: quantity,
                        status: 'Pendiente',
                        followers_difference: current_followers && !isNaN(current_followers) ? parseInt(current_followers) - quantity : null,
                        queried_at: new Date().toISOString(),
                        error: 'No se encontró el pedido en la API.'
                    });
                }

                const start_count = parseInt(panelData.start_count);
                const status = panelData.status;
                const charge = quantity;
                const username = panelData.username || (manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/) ? manual_url.match(/(instagram|tiktok)\.com\/([^/?]+)/)[2] : null);

                const previous_followers = start_count + charge;

                console.log('✅ Seguidores iniciales:', start_count);
                console.log('✅ Cantidad comprada (texto):', charge);
                console.log('✅ Seguidores iniciales totales:', previous_followers);
                console.log('✅ Estado:', status);
                if (username) console.log('✅ Username:', username);

                let followers_difference = null;
                if (current_followers !== undefined && current_followers !== null && !isNaN(current_followers)) {
                    followers_difference = parseInt(current_followers) - previous_followers;
                    console.log('✅ Diferencia de seguidores:', followers_difference);
                }

                return res.json({
                    username,
                    order_id,
                    start_count,
                    charge,
                    previous_followers,
                    status,
                    followers_difference,
                    queried_at: new Date().toISOString()
                });
            }
        }

        console.log('❌ Ningún formato válido detectado para el texto:', normalizedText);
        return res.json({ error: 'Ingresa un texto válido, un enlace, un ID numérico, un ID con cantidad, un ID con enlace, o un texto completo con ID, enlace y cantidad.' });
    } catch (error) {
        console.error('💥 ERROR:', error.message);
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

app.listen(3000, () => console.log('✅ http://localhost:3000 - Soporte para TikTok e Instagram'));