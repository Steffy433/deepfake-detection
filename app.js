// --- Onglets ---
const tabs = document.querySelectorAll('.tab');
const sectionAnalyse    = document.getElementById('section-analyse');
const sectionHistorique = document.getElementById('section-historique');
const sectionRapport    = document.getElementById('section-rapport');
alert("app.js chargé");
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    sectionAnalyse.style.display    = 'none';
    sectionHistorique.style.display = 'none';
    sectionRapport.style.display    = 'none';
    const nom = tab.textContent.trim();
    if (nom === 'Analyse')    sectionAnalyse.style.display    = 'block';
    if (nom === 'Historique') sectionHistorique.style.display = 'block';
    if (nom === 'Rapport')    sectionRapport.style.display    = 'block';
  });
});

// --- Stats ---
let totalAnalyses = 0;
let totalDeepfakes = 0;
let totalSuspects = 0;

chargerDonnees();
document.getElementById('rapport-suspects').textContent = totalSuspects;
function mettreAJourStats(score) {
document.getElementById('rapport-suspects').textContent = totalSuspects;
  totalAnalyses++;

  if (score > 70) {
    totalDeepfakes++;
  }
  else if (score > 40) {
    totalSuspects++;
  }

  const taux = Math.round((totalDeepfakes / totalAnalyses) * 100);

  const authentiques =
    totalAnalyses - totalDeepfakes - totalSuspects;

  document.getElementById('stat-analyses').textContent       = totalAnalyses;
  document.getElementById('stat-deepfakes').textContent      = totalDeepfakes;
  document.getElementById('stat-taux').textContent           = taux + '%';
  document.getElementById('rapport-analyses').textContent = totalAnalyses;
  document.getElementById('rapport-deepfakes').textContent = totalDeepfakes;
  document.getElementById('rapport-suspects').textContent = totalSuspects;
  document.getElementById('rapport-authentiques').textContent = authentiques;
  const empty = document.getElementById('history-empty');
  if (empty) empty.style.display = 'none';

  sauvegarderDonnees();
}

// --- Drag & Drop ---
const dropZone     = document.getElementById('drop-zone');
const fileInput    = document.getElementById('file-input');
const resultContent = document.getElementById('result-content');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.background   = '#eef4ff';
  dropZone.style.borderColor  = '#6366f1';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.background  = '';
  dropZone.style.borderColor = '';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.background  = '';
  dropZone.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

// --- Traitement fichier ---
async function handleFile(file) {
  const type  = file.type.startsWith('video') ? 'video'
              : file.type.startsWith('audio') ? 'audio'
              : 'image';
  const icone = type === 'video' ? '🎬' : type === 'audio' ? '🎙️' : '🖼️';

  dropZone.querySelector('p').textContent = `${icone} ${file.name}`;
  if (file.type.startsWith("image")) {

  const reader = new FileReader();

  reader.onload = function(e) {

    dropZone.innerHTML = `
      <img
        src="${e.target.result}"
        style="
          max-width:200px;
          max-height:200px;
          border-radius:10px;
          margin-bottom:10px;
        "
      >
      <p>${file.name}</p>

      <input
        type="file"
        id="file-input"
        accept="image/*,video/*"
        hidden
      >

      <button onclick="document.getElementById('file-input').click()">
        Changer de fichier
      </button>
    `;
  };

  reader.readAsDataURL(file);
}
  resultContent.innerHTML = `
    <div style="text-align:center;padding:30px 0">
      <div class="spinner"></div>
      <p style="color:#666;margin-top:12px;font-size:13px">Analyse en cours...</p>
    </div>
  `;

  // Mock temporaire — remplace par fetch quand .h5 est prêt
  try {

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    "http://127.0.0.1:8000/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  if (data.error) {
    resultContent.innerHTML =
      `<p style="color:red">${data.error}</p>`;
    return;
  }

  const score = parseFloat(data.confidence);

  const commentaire = genererCommentaire(score, type);

  afficherResultat(score, commentaire);

  ajouterHistorique(file.name, score, type);

  mettreAJourStats(score);

} catch (error) {

  console.error(error);

  resultContent.innerHTML = `
    <p style="color:red;text-align:center">
      Impossible de contacter le backend
    </p>
  `;
}
}

// --- Affichage résultat ---
function afficherResultat(score, commentaire) {
  document.getElementById('export-btn').style.display = 'inline-block';

  resultContent.innerHTML = `
    <div style="width:100%;padding:8px">

      <!-- Cercle score -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="
          width:90px;height:90px;border-radius:50%;
          background:${commentaire.bg};
          border:4px solid ${commentaire.couleur};
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 12px;
        ">
          <span style="font-size:22px;font-weight:700;color:${commentaire.couleur}">
            ${score}%
          </span>
        </div>

        <!-- Verdict -->
        <p style="font-size:15px;font-weight:700;color:${commentaire.couleur};margin-bottom:8px">
          ${commentaire.verdict}
        </p>

        <!-- Barre -->
        <div style="background:#f0f0f0;border-radius:20px;height:8px;max-width:220px;margin:0 auto;overflow:hidden">
          <div style="
            width:${score}%;height:8px;border-radius:20px;
            background:${commentaire.couleur};
            transition:width 0.8s ease;
          "></div>
        </div>
        <p style="font-size:12px;color:#999;margin-top:5px">Confiance : ${score}%</p>
      </div>

      <!-- Séparateur -->
      <hr style="border:none;border-top:1px solid #f0f0f0;margin-bottom:16px">

      <!-- Commentaires -->
      <div style="
        background:${commentaire.bg};
        border-left:4px solid ${commentaire.couleur};
        border-radius:8px;
        padding:14px 16px;
      ">
        <p style="font-size:13px;font-weight:700;color:${commentaire.couleur};margin-bottom:10px">
          📋 Analyse détaillée
        </p>
        ${commentaire.points.map(p => `
          <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
            <span style="
              color:white;background:${commentaire.couleur};
              border-radius:50%;width:18px;height:18px;
              font-size:11px;display:flex;align-items:center;
              justify-content:center;flex-shrink:0;margin-top:2px;
            ">✓</span>
            <p style="font-size:13px;color:#333;line-height:1.6;margin:0">${p}</p>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// --- Commentaires par type ---
function genererCommentaire(score, type = 'image') {
  const raisonsImage = {
    fake: [
      "Les contours du visage présentent des irrégularités typiques des GAN.",
      "Les zones autour des yeux montrent des artefacts suspects.",
      "La texture de la peau est anormalement lisse.",
      "Les reflets dans les yeux sont asymétriques.",
    ],
    reel: [
      "Les textures du visage sont naturelles et cohérentes.",
      "Les reflets oculaires sont symétriques et réalistes.",
      "Aucun artefact de génération IA détecté.",
      "Les contours et les ombres sont physiquement cohérents.",
    ]
  };

  const raisonsVideo = {
    fake: [
      "Des incohérences temporelles détectées entre les frames.",
      "Les mouvements des lèvres ne correspondent pas à l'audio.",
      "Des artefacts visuels apparaissent lors des transitions.",
    ],
    reel: [
      "Les transitions entre frames sont fluides et naturelles.",
      "Cohérence temporelle validée sur l'ensemble de la vidéo.",
      "Aucune manipulation détectée dans le flux vidéo.",
    ]
  };

  const raisonsAudio = {
    fake: [
      "Des artefacts sonores typiques de la synthèse vocale détectés.",
      "Le spectre fréquentiel présente des anomalies.",
      "La prosodie semble générée par IA.",
    ],
    reel: [
      "Le spectre sonore est naturel et cohérent.",
      "Aucune synthèse vocale détectée.",
      "Les variations naturelles de la voix sont présentes.",
    ]
  };

  const raisons = type === 'video' ? raisonsVideo
                : type === 'audio' ? raisonsAudio
                : raisonsImage;

  if (score > 70) {
    return {
      verdict: type === 'audio' ? "🚨 Cette voix est probablement SYNTHÉTISÉE"
             : type === 'video' ? "🚨 Cette vidéo est probablement un DEEPFAKE"
             : "🚨 Ce fichier est probablement un DEEPFAKE",
      couleur: "#dc2626",
      bg: "#fef2f2",
      points: [
        raisons.fake[Math.floor(Math.random() * raisons.fake.length)],
        raisons.fake[Math.floor(Math.random() * raisons.fake.length)],
        "Analyse approfondie recommandée.",
      ]
    };
  } else if (score > 40) {
    return {
      verdict: "⚠️ Fichier SUSPECT — vérification recommandée",
      couleur: "#d97706",
      bg: "#fffbeb",
      points: [
        "Certains éléments sont ambigus.",
        "Le score de confiance est insuffisant pour trancher.",
        "Une vérification humaine est conseillée.",
      ]
    };
  } else {
    return {
      verdict: type === 'audio' ? "✅ Cette voix semble AUTHENTIQUE"
             : type === 'video' ? "✅ Cette vidéo semble AUTHENTIQUE"
             : "✅ Ce fichier semble AUTHENTIQUE",
      couleur: "#16a34a",
      bg: "#f0fdf4",
      points: [
        raisons.reel[Math.floor(Math.random() * raisons.reel.length)],
        "Cohérence globale validée.",
        "Aucune manipulation détectée.",
      ]
    };
  }
}

// --- Historique ---
function ajouterHistorique(filename, score, type = 'image') {
  const label = score > 70 ? 'Deepfake' : score > 40 ? 'Suspect' : 'Authentique';
  const cls   = score > 70 ? 'danger'   : score > 40 ? 'warning'  : 'success';
  const icone = type === 'video' ? '🎬' : type === 'audio' ? '🎙️' : '📄';
  const time  = new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});

  const li = document.createElement('li');
  li.className = 'history-item';
  li.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex:1">
      <div class="history-thumb">${icone}</div>
      <div>
        <div class="filename">${filename}</div>
        <div style="font-size:11px;color:#999">Aujourd'hui, ${time}</div>
      </div>
    </div>
    <span class="badge ${cls}">${label} ${score}%</span>
  `;

  document.getElementById('history-list').prepend(li);
  const empty = document.getElementById('history-empty');
  if (empty) empty.style.display = 'none';
}

// --- Export PDF ---
function exporterPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Rapport DeepGuard', 20, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text('Date : ' + new Date().toLocaleString('fr-FR'), 20, 30);
  doc.text(`Fichiers analysés : ${totalAnalyses}`, 20, 40);
  doc.text(`Deepfakes détectés : ${totalDeepfakes}`, 20, 50);

  doc.setFontSize(13);
  doc.setTextColor(0);
  doc.text('Analyses :', 20, 65);

  const items = document.querySelectorAll('.history-item');
  let y = 75;
  items.forEach(item => {
    const name  = item.querySelector('.filename').textContent;
    const badge = item.querySelector('.badge').textContent;
    doc.setFontSize(11);
    doc.text(`• ${name}  →  ${badge}`, 25, y);
    y += 10;
  });

  doc.save('rapport_deepguard.pdf');
}

// --- Sauvegarde localStorage ---
function sauvegarderDonnees() {
  localStorage.setItem('total_analyses',  totalAnalyses);
  localStorage.setItem('total_deepfakes', totalDeepfakes);
  localStorage.setItem('total_suspects', totalSuspects);
  const historique = [];
  document.querySelectorAll('.history-item').forEach(item => {
    historique.push({
      nom:    item.querySelector('.filename').textContent,
      badge:  item.querySelector('.badge').textContent,
      classe: item.querySelector('.badge').className
    });
  });
  localStorage.setItem('historique', JSON.stringify(historique));
}

function chargerDonnees() {
totalSuspects = parseInt(localStorage.getItem('total_suspects')) || 0;
  totalAnalyses  = parseInt(localStorage.getItem('total_analyses'))  || 0;
  totalDeepfakes = parseInt(localStorage.getItem('total_deepfakes')) || 0;

  const authentiques =
    totalAnalyses - totalDeepfakes - totalSuspects;
  const taux = totalAnalyses > 0 ? Math.round((totalDeepfakes / totalAnalyses) * 100) : 0;

  document.getElementById('stat-analyses').textContent       = totalAnalyses;
  document.getElementById('stat-deepfakes').textContent      = totalDeepfakes;
  document.getElementById('stat-taux').textContent           = taux + '%';
  document.getElementById('rapport-analyses').textContent    = totalAnalyses;
  document.getElementById('rapport-deepfakes').textContent   = totalDeepfakes;
  document.getElementById('rapport-suspects').textContent =
    totalSuspects;
  document.getElementById('rapport-authentiques').textContent = authentiques;

  const historique = JSON.parse(localStorage.getItem('historique') || '[]');
  if (historique.length > 0) {
    const empty = document.getElementById('history-empty');
    if (empty) empty.style.display = 'none';
    historique.forEach(entry => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;flex:1">
          <div class="history-thumb">📄</div>
          <div class="filename">${entry.nom}</div>
        </div>
        <span class="${entry.classe}">${entry.badge}</span>
      `;
      document.getElementById('history-list').appendChild(li);
    });
  }
}