
// Clean, single-version script for map markers with localStorage persistence
const links = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    const fromTop = window.scrollY;
    links.forEach(link => {
        const section = document.querySelector(link.hash);
        if (
            section &&
            section.offsetTop <= fromTop + 100 &&
            section.offsetTop + section.offsetHeight > fromTop + 100
        ) {
            link.style.color = '#FF4081';
        } else {
            link.style.color = '#E6E6E6';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o mapa
    const map = L.map('map').setView([-24.7135, -53.7433], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const iconeLixeira = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const STORAGE_KEY = 'cleanmap_pontos_v1';
    const marcadores = new Map();

    function gerarId() {
        return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    function getPontosIniciais() {
        return [
            { id: gerarId(), lat: -24.7148, lng: -53.7435, nome: 'Ponto 1' },
            { id: gerarId(), lat: -24.7197, lng: -53.7560, nome: 'Ponto 2' },
            { id: gerarId(), lat: -24.7197, lng: -53.7536, nome: 'Ponto 3' },
            { id: gerarId(), lat: -24.7201, lng: -53.7330, nome: 'Ponto 4' },
            { id: gerarId(), lat: -24.7197, lng: -53.7442, nome: 'Ponto 5' }
        ];
    }

    function carregarPontos() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getPontosIniciais();
        try {
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return [];
            return arr;
        } catch (err) {
            console.error('Erro ao parsear pontos do storage', err);
            return [];
        }
    }

    function salvarPontos(pontos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pontos));
        } catch (err) {
            console.error('Erro salvando pontos no storage', err);
            alert('Não foi possível salvar os pontos localmente.');
        }
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function stripHtml(html) {
        return String(html).replace(/<[^>]*>?/gm, '');
    }

    function renderizarPontos(pontos) {
        for (const [, marker] of marcadores) map.removeLayer(marker);
        marcadores.clear();

        pontos.forEach(ponto => {
            const marker = L.marker([ponto.lat, ponto.lng], { icon: iconeLixeira })
                .addTo(map)
                .bindPopup(`<b>${escapeHtml(ponto.nome || 'Ponto reciclável')}</b>`);
            marker.pontoId = ponto.id;
            marker.on('click', () => {
                if (modoRemover) {
                    removerPonto(ponto.id);
                } else {
                    const novoNome = prompt('Editar nome do ponto:', ponto.nome || '');
                    if (novoNome !== null) {
                        ponto.nome = novoNome.trim();
                        salvarERenderizar();
                    }
                }
            });
            marcadores.set(ponto.id, marker);
        });
    }

    function adicionarPonto(latlng, nome) {
        const pontos = carregarPontos();
        const novo = { id: gerarId(), lat: latlng.lat, lng: latlng.lng, nome: nome || 'Ponto reciclável' };
        pontos.push(novo);
        salvarPontos(pontos);
        renderizarPontos(pontos);
    }

    function removerPonto(id) {
        const pontos = carregarPontos().filter(p => p.id !== id);
        salvarPontos(pontos);
        renderizarPontos(pontos);
    }

    function salvarERenderizar() {
        const pontos = [];
        for (const [id, marker] of marcadores) {
            const latlng = marker.getLatLng();
            const nomeHtml = marker.getPopup() ? marker.getPopup().getContent() : '';
            pontos.push({ id, lat: latlng.lat, lng: latlng.lng, nome: stripHtml(nomeHtml) });
        }
        salvarPontos(pontos);
        renderizarPontos(pontos);
    }

    const pontosIniciais = carregarPontos();
    renderizarPontos(pontosIniciais);

    let modoAdicionar = false;
    let modoRemover = false;

    const addBtn = document.getElementById('addPoint');
    const removeBtn = document.getElementById('removePoint');
    const exportBtn = document.getElementById('exportPoints');
    const importBtn = document.getElementById('importPoints');

    addBtn.addEventListener('click', () => {
        modoAdicionar = true;
        modoRemover = false;
        alert('Clique em um ponto do mapa para adicionar uma caçamba.');
    });

    removeBtn.addEventListener('click', () => {
        modoRemover = true;
        modoAdicionar = false;
        alert('Clique em uma caçamba para removê-la.');
    });

    exportBtn.addEventListener('click', () => {
        const pontos = carregarPontos();
        const json = JSON.stringify(pontos, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(json).then(() => alert('Pontos copiados para a área de transferência (JSON).')).catch(() => prompt('Copie o JSON abaixo:', json));
        } else {
            prompt('Copie o JSON abaixo:', json);
        }
    });

    importBtn.addEventListener('click', () => {
        const entrada = prompt('Cole aqui o JSON dos pontos (substitui os pontos locais):');
        if (!entrada) return;
        try {
            const arr = JSON.parse(entrada);
            if (!Array.isArray(arr)) throw new Error('JSON precisa ser um array de pontos');
            const validados = arr.map(item => ({ id: item.id || gerarId(), lat: Number(item.lat), lng: Number(item.lng), nome: String(item.nome || 'Ponto reciclável') })).filter(i => Number.isFinite(i.lat) && Number.isFinite(i.lng));
            salvarPontos(validados);
            renderizarPontos(validados);
            alert('Pontos importados com sucesso.');
        } catch (err) {
            console.error('Erro importando pontos', err);
            alert('JSON inválido. Importação abortada.');
        }
    });

    map.on('click', function (e) {
        if (modoAdicionar) {
            const nome = prompt('Nome do ponto (opcional):', 'Ponto reciclável');
            adicionarPonto(e.latlng, nome);
            modoAdicionar = false;
        }
    });
});