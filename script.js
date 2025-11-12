
const links = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
    const fromTop = window.scrollY;

    links.forEach(link => {
        const section = document.querySelector(link.hash);
        if (
            section.offsetTop <= fromTop + 100 &&
            section.offsetTop + section.offsetHeight > fromTop + 100
        ) {
            link.style.color = "#FF4081";
        } else {
            link.style.color = "#E6E6E6";
        }
    });
});

//parte Danilo
// MAPA LEAFLET 
document.addEventListener("DOMContentLoaded", function () {
    // Inicializa o mapa
    const map = L.map('map').setView([-24.7135, -53.7433], 13);

    // Camada base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    

    // Ícone 
    const iconeLixeira = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
    });

    // Lista inicial de pontos
    const pontosColeta = [
        { lat: -24.7148, lng: -53.7435, nome: "" },
        { lat: -24.7197, lng: -53.7560, nome: "" },
        { lat: -24.7197, lng: -53.7536, nome: "" },
        { lat: -24.7201, lng: -53.7330, nome: "" },
        { lat: -24.7197, lng: -53.7442, nome: "" },
    ];

    const marcadores = [];

    // Adiciona os pontos iniciais
    pontosColeta.forEach(ponto => {
        const marker = L.marker([ponto.lat, ponto.lng], { icon: iconeLixeira })
            .addTo(map)
            .bindPopup(`<b>${ponto.nome}</b>`);
        marcadores.push(marker);
    });

    // variaveis para adicionar e remover pontos
    let modoAdicionar = false;
    let modoRemover = false;

    const addBtn = document.getElementById("addPoint");
    const removeBtn = document.getElementById("removePoint");

    // Modo adicionar
    addBtn.addEventListener("click", () => {
        modoAdicionar = true;
        modoRemover = false;
        alert("Clique em um ponto do mapa para adicionar uma caçamba.");
    });

    // Modo remover
    removeBtn.addEventListener("click", () => {
        modoRemover = true;
        modoAdicionar = false;
        alert("Clique em uma caçamba para removê-la.");
    });

    // Adicionar ponto com um clique
    map.on("click", function (e) {
        if (modoAdicionar) {
            const novo = L.marker(e.latlng, { icon: iconeLixeira })
                .addTo(map)
                .bindPopup("<b>Ponto reciclavel</b>");
            marcadores.push(novo);
            modoAdicionar = false; // desativa modo
        }
    });

    // Remover ponto com um clique
    map.on("layeradd", function (e) {
        if (e.layer instanceof L.Marker) {
            e.layer.on("click", function () {
                if (modoRemover) {
                    map.removeLayer(e.layer);
                    modoRemover = false; // desativa modo
                }
            });
        }
    });
});