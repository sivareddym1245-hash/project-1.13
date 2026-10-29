const docInput = document.getElementById('docInput');
const simplifyBtn = document.getElementById('simplifyBtn');
const resultSection = document.getElementById('resultSection');
const resultBox = document.getElementById('resultBox');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const characterCount = document.getElementById('characterCount');

const BACKEND_URL = 'https://project-1-13-ciea.onrender.com';
const MAX_DOCUMENTATION_LENGTH = 12000;

docInput.addEventListener('input', () => {
    characterCount.textContent = `${docInput.value.length.toLocaleString()} / ${MAX_DOCUMENTATION_LENGTH.toLocaleString()}`;
});

simplifyBtn.addEventListener('click', async () => {
    const text = docInput.value.trim();
    errorMessage.classList.add('hidden');
    resultSection.classList.add('hidden');

    if (!text) {
        errorMessage.textContent = 'Paste some documentation first, and I’ll simplify it for you.';
        errorMessage.classList.remove('hidden');
        docInput.focus();
        return;
    }

    if (text.length > MAX_DOCUMENTATION_LENGTH) {
        errorMessage.textContent = `Please keep your text under ${MAX_DOCUMENTATION_LENGTH.toLocaleString()} characters.`;
        errorMessage.classList.remove('hidden');
        return;
    }

    loading.classList.remove('hidden');
    simplifyBtn.disabled = true;

    try {
        const response = await fetch(`${BACKEND_URL}/api/simplify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentationText: text })
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'The explanation could not be generated. Please try again.');
        }
        if (typeof data.result !== 'string' || !data.result.trim()) {
            throw new Error('The server returned an empty explanation. Please try again.');
        }

        resultBox.textContent = data.result.trim();
        resultSection.classList.remove('hidden');
    } catch (error) {
        errorMessage.textContent = error instanceof TypeError
            ? 'Could not connect to Doc Decoder. Please try again in a moment.'
            : error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
        simplifyBtn.disabled = false;
    }
});
