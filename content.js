// ================= GLOBAL STATE =================
let selectedText = "";
let selectionRect;

// ================= INIT =================
console.log("✅ LexiAI Loaded");

// ================= SELECTION =================
document.addEventListener("mouseup", () => {
    let selection = window.getSelection();
    let text = selection.toString().trim();

    if (text.length > 0) {
        selectedText = text;
        selectionRect = selection.getRangeAt(0).getBoundingClientRect();

        setTimeout(() => {
            removeIcon();
        }, 100);
    }
});

// ================= KEYBOARD TRIGGER =================
document.addEventListener("keydown", (e) => {
    const tag = document.activeElement.tagName.toLowerCase();

    // Ignore typing fields
    if (tag === "input" || tag === "textarea") return;

    // Press T
    if (e.key.toLowerCase() === "t") {
        if (selectedText && selectionRect) {
            removeIcon();
            showIcon();
        } else {
            showToast("Select a word first");
        }
    }
});

// ================= SHOW ICON =================
function showIcon() {
    let rect = selectionRect;

    let icon = document.createElement("div");
    icon.id = "ai-icon";
    icon.textContent = "⚡";

    icon.style.position = "fixed";
    icon.style.top = `${rect.bottom + 10}px`;
    icon.style.left = `${rect.right + 10}px`;
    icon.style.background = "#6C63FF";
    icon.style.color = "white";
    icon.style.padding = "10px";
    icon.style.borderRadius = "50%";
    icon.style.cursor = "pointer";
    icon.style.zIndex = "999999";
    icon.style.boxShadow = "0 6px 18px rgba(0,0,0,0.3)";
    icon.style.transition = "transform 0.2s ease";

    icon.onmouseenter = () => icon.style.transform = "scale(1.1)";
    icon.onmouseleave = () => icon.style.transform = "scale(1)";

    icon.onclick = (e) => {
        e.stopPropagation();
        fetchAI();
        removeIcon();
    };

    document.body.appendChild(icon);
}

// ================= REMOVE ICON =================
function removeIcon() {
    document.getElementById("ai-icon")?.remove();
}

// ================= FETCH AI =================
async function fetchAI() {
    let word = selectedText;

    showTooltip(word, "Loading...");

    try {
        let res = await fetch("https://word-search-google-extension.onrender.com/meaning", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word })
        });

        let data = await res.json();

        showTooltip(word, data.result);

    } catch (err) {
        console.error("Fetch error:", err);
        showTooltip(word, "Error fetching meaning");
    }
}

// ================= PARSE AI =================
function parseAI(text) {
    if (!text || !text.includes("Meaning:")) {
        return {
            meaning: text || "No result",
            rewrite: "",
            tone: "",
            hindi: ""
        };
    }

    let lines = text.split("\n");

    return {
        meaning: lines[0]?.replace("Meaning:", "").trim(),
        rewrite: lines[1]?.replace("Rewrite:", "").trim(),
        tone: lines[2]?.replace("Tone:", "").trim(),
        hindi: lines[3]?.replace("Hindi:", "").trim()
    };
}

// ================= SPEAK =================
function speak(word) {
    let utter = new SpeechSynthesisUtterance(word);
    speechSynthesis.speak(utter);
}

// ================= COPY =================
function saveWord(word) {
    navigator.clipboard.writeText(word)
        .then(() => showToast("Copied!"))
        .catch(() => showToast("Copy failed"));
}

// ================= TOAST =================
function showToast(msg) {
    let toast = document.createElement("div");
    toast.innerText = msg;

    Object.assign(toast.style, {
        position: "fixed",
        bottom: "30px",
        right: "30px",
        background: "rgba(30,30,30,0.8)",
        backdropFilter: "blur(10px)",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "10px",
        fontSize: "14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        zIndex: "999999",
        opacity: "0",
        transform: "translateY(20px)",
        transition: "all 0.3s ease"
    });

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 300);
    }, 1500);
}

// ================= TOOLTIP =================
function showTooltip(word, text) {
    document.getElementById("tooltip")?.remove();

    let rect = selectionRect;
    let tooltip = document.createElement("div");
    tooltip.id = "tooltip";

    let { meaning, rewrite, tone, hindi } = parseAI(text);

    tooltip.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:16px;font-weight:600;">${word}</span>
            <div style="display:flex;gap:8px;">
                <span class="icon-btn" id="speak">🔊</span>
                <span class="icon-btn" id="save">💾</span>
                <span class="icon-btn" id="close">✖</span>
            </div>
        </div>

        <div class="section">
            <div class="title">Meaning</div>
            <div class="content">${meaning}</div>
        </div>

        ${rewrite ? `<div class="section"><div class="title">✍️ Rewrite</div><div class="content">${rewrite}</div></div>` : ""}
        ${tone ? `<div class="section"><div class="title">🎭 Tone</div><div class="badge">${tone}</div></div>` : ""}
        ${hindi ? `<div class="section"><div class="title">🌍 Hindi</div><div class="content">${hindi}</div></div>` : ""}
    `;

    Object.assign(tooltip.style, {
        position: "absolute",
        top: `${window.scrollY + rect.bottom + 12}px`,
        left: `${window.scrollX + rect.left}px`,
        width: "280px",
        padding: "14px",
        borderRadius: "12px",
        background: "rgba(30,30,30,0.75)",
        backdropFilter: "blur(12px)",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        fontSize: "13.5px",
        lineHeight: "1.5",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        zIndex: "999999",
        opacity: "0",
        transform: "translateY(10px)",
        transition: "all 0.25s ease"
    });

    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translateY(0)";
    }, 10);

    document.getElementById("close").onclick = () => tooltip.remove();
    document.getElementById("speak").onclick = () => speak(word);
    document.getElementById("save").onclick = () => saveWord(word);
}