const docInput = document.getElementById('docInput');
const simplifyBtn = document.getElementById('simplifyBtn');
const resultBox = document.getElementById('resultBox');
const loading = document.getElementById('loading');

const BACKEND_URL = 'http://localhost:3000/api/simplify';

simplifyBtn.addEventListener('click', async () => {
    const text = docInput.value.trim();
    if (!text) return alert("Please paste some text first!");

    resultBox.classList.add('hidden');
    loading.classList.remove('hidden');
    simplifyBtn.disabled = true;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentationText: text })
        });

        const data = await response.json();

        if (response.ok) {
            resultBox.innerHTML = data.result.replace(/\n/g, '<br>');
            resultBox.classList.remove('hidden');
        } else {
            alert(data.error || "Something went wrong.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the backend. Is your server running?");
    } finally {
        loading.classList.add('hidden');
        simplifyBtn.disabled = false;
    }
});