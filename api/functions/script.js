const base_url='https://cataas.com'
const timeout = 5000; 

// --- Configuración Retry & Circuit Breaker ---
let failureCount = 0;
const MAX_FAILURES = 3; 
const CIRCUIT_RESET_TIME = 10000; // 10s
let nextTryTime = 0;

const MAX_RETRIES = 2; 
const RETRY_DELAY = 1500; 

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Internal Fetch with Timeout
async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Smart Fetch: Retry + Circuit Breaker
async function fetchSmart(url, options = {}, retries = MAX_RETRIES) {
    // 1. Check Circuit Breaker
    if (Date.now() < nextTryTime) {
        const remaining = Math.ceil((nextTryTime - Date.now()) / 1000);
        throw new Error(`Sistema inestable. Reintenta en ${remaining}s`);
    }

    try {
        const response = await fetchWithTimeout(url, options);
        
        // Success: Reset Breaker
        if (failureCount > 0) {
            failureCount = 0;
            nextTryTime = 0;
            console.log(" Conexión. Circuito cerrado.");
        }
        return response;

    } catch (error) {
        console.warn(`⚠️ Intento fallido (${MAX_RETRIES - retries + 1}/${MAX_RETRIES + 1}): ${error.message}`);
        
        failureCount++;
        
        if (failureCount >= MAX_FAILURES) {
            nextTryTime = Date.now() + CIRCUIT_RESET_TIME;
            console.error(`Circuit Breaker ACTIVADO. Pausa de ${CIRCUIT_RESET_TIME/1000}s`);
        }

        if (retries > 0 && Date.now() > nextTryTime) {
            await wait(RETRY_DELAY);
            return fetchSmart(url, options, retries - 1);
        }

        throw error;
    }
}

export async function getRandomCat() {
    const response = await fetchSmart(`${base_url}/cat?json=true`);
    const data = await response.json();
    return data;
}

export async function generateCatMeme(text){
    const response = await fetchSmart(`${base_url}/cat/says/${text}?json=true`);
    const data = await response.json();
    return data;
}

export async function getCatGIF(){
    const response = await fetchSmart(`${base_url}/cat/gif?json=true`);
    const data = await response.json();
    return data;
}


function init() {
    const modeSelect = document.getElementById('mode-select');
    if (!modeSelect) return; 

    const textInputContainer = document.getElementById('text-input-container');
    const placeholderText = document.getElementById('placeholder-text');
    const memeTextInput = document.getElementById('meme-text');
    const generateBtn = document.getElementById('generate-btn');
    const catImage = document.getElementById('cat-image');
    const emptyState = document.getElementById('empty-state');
    const loader = document.getElementById('loader');

    function toggleDisplay(element, show) {
        if (!element) return;
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }

    modeSelect.addEventListener('change', async (e) => {
        const mode = e.target.value;

        toggleDisplay(textInputContainer, false);
        toggleDisplay(placeholderText, false);

        if (mode === 'solo' || mode === 'gif') {
            toggleDisplay(placeholderText, true);
            placeholderText.textContent = mode === 'solo' 
                ? 'Presiona generar para un gato aleatorio' 
                : 'Presiona generar para un GIF aleatorio';
        } else if (mode === 'text') {
            toggleDisplay(textInputContainer, true);
        }
    });

    generateBtn.addEventListener('click', async () => {
        // 1. Verificar conexión a internet antes de empezar
        if (!navigator.onLine) {
            alert("⚠️ No tienes conexión a internet. Revisa tu red.");
            return;
        }

        const mode = modeSelect.value;
        
        toggleDisplay(loader, true);
        toggleDisplay(emptyState, false);
        toggleDisplay(catImage, false); 

        try {
            let data;
            
            if (mode === 'solo') {
                data = await getRandomCat();
            } else if (mode === 'text') {
                const text = memeTextInput.value.trim() || 'TEXTO';
                data = await generateCatMeme(text);
            } else if (mode === 'gif') {
                data = await getCatGIF();
            }

            console.log("Data received:", data);

            if (data && (data.id || data._id || data.url)) {
                renderImage(data);
            } else {
                    console.error('Invalid data received', data);
                        if (mode === 'solo') {
                            renderImage({ url: 'https://cataas.com/cat' });
                        } else {
                        alert('No se pudieron obtener los datos.');
                        toggleDisplay(loader, false);
                        }
            }
        } catch (error) {
            console.error(error);
            toggleDisplay(loader, false);
            
            // 2. Manejo de errores específicos (Timeout / Red / Circuit Breaker)
            if (error.message.includes('Circuito abierto')) {
                alert(error.message); // Muestra mensaje del Circuit Breaker
            } else if (error.name === 'AbortError') {
                 alert("⚠️ Tiempo de espera agotado (Timeout). Reintentando...");
            } else {
                 alert(`⚠️ Error: ${error.message || 'Problema de conexión'}`);
            }
        }
    });

    function renderImage(catData) {
        let imageUrl = '';
        
        if (catData.url) {
            imageUrl = catData.url;
            if (!imageUrl.startsWith('http')) {
                imageUrl = `https://cataas.com${imageUrl}`;
            }
        } else if (catData.id || catData._id) {
            const id = catData.id || catData._id;
            imageUrl = `https://cataas.com/cat/${id}`;
        } else {
                console.error("No valid image source found in", catData);
                return;
        }
        
        catImage.onload = () => {
            toggleDisplay(loader, false);
            toggleDisplay(catImage, true);
            setTimeout(() => catImage.classList.remove('opacity-0'), 50); // Fade in
        };

        catImage.onerror = () => {
            toggleDisplay(loader, false);
            alert("Error cargando la imagen");
        };

        catImage.classList.add('opacity-0');
        catImage.src = imageUrl;
    }
}

init();