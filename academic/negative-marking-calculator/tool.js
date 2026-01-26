function parsePenalty(val, marksPerQ) {
    val = val.toString().trim();
    if (val.includes('/')) {
        const parts = val.split('/');
        // If user enters 1/3, do they mean 1/3 of a mark or 1/3 of the Question Value?
        // Standard convention: 1/3 usually means 1/3rd of the marks assigned.
        return marksPerQ * (parseFloat(parts[0]) / parseFloat(parts[1]));
    }
    return parseFloat(val);
}

function calculateScore() {
    const totalQs = parseInt(document.getElementById('totalQs').value) || 0;
    const attempted = parseInt(document.getElementById('attempted').value) || 0;
    const correct = parseInt(document.getElementById('correct').value) || 0;
    const marksPerQ = parseFloat(document.getElementById('marksPerQ').value) || 0;
    const penaltyInput = document.getElementById('penalty').value;

    if (attempted > totalQs) {
        alert("Attempted questions cannot exceed Total Questions.");
        return;
    }
    if (correct > attempted) {
        alert("Correct answers cannot exceed Attempted questions.");
        return;
    }

    // Calculations
    const wrong = attempted - correct;
    const penaltyValue = parsePenalty(penaltyInput, marksPerQ);
    
    const rawScore = correct * marksPerQ;
    const negScore = wrong * penaltyValue;
    const netScore = rawScore - negScore;
    const totalPossible = totalQs * marksPerQ;
    
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    
    // Break Even: penalty / (marks + penalty)
    const breakEven = (penaltyValue / (marksPerQ + penaltyValue)) * 100;

    // Update UI
    document.getElementById('resNet').innerText = netScore.toFixed(2);
    document.getElementById('resTotalMarks').innerText = totalPossible;
    document.getElementById('resAcc').innerText = accuracy.toFixed(1) + '%';
    document.getElementById('resRaw').innerText = '+' + rawScore.toFixed(2);
    document.getElementById('resNeg').innerText = '-' + negScore.toFixed(2);
    
    document.getElementById('resBE').innerText = breakEven.toFixed(1) + '%';
    document.getElementById('resBENum').innerText = breakEven.toFixed(1);

    // Badge Logic
    const badge = document.getElementById('breakEvenBadge');
    if (accuracy >= breakEven) {
        badge.className = 'safe-badge is-safe';
        badge.innerText = 'Safe Strategy (Profitable)';
    } else {
        badge.className = 'safe-badge is-risky';
        badge.innerText = 'Risky Strategy (Losing Marks)';
    }

    // Reveal Box
    const resBox = document.getElementById('resultBox');
    resBox.style.display = 'block';
    resBox.classList.add('visible');
    resBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleStrategy() {
    const section = document.getElementById('stratSection');
    const btn = document.getElementById('advToggle');
    if (section.style.display === 'block') {
        section.style.display = 'none';
        btn.innerText = 'Show Strategy & Simulation ▼';
    } else {
        section.style.display = 'block';
        btn.innerText = 'Hide Strategy ▲';
    }
}

function runSimulation() {
    const tq = parseInt(document.getElementById('totalQs').value) || 0;
    const mpq = parseFloat(document.getElementById('marksPerQ').value) || 0;
    const ppw = parsePenalty(document.getElementById('penalty').value, mpq);
    
    const targetScore = parseFloat(document.getElementById('cutoff').value);
    const accPercent = parseFloat(document.getElementById('targetAcc').value);
    const container = document.getElementById('simResults');

    if (!tq || isNaN(targetScore) || isNaN(accPercent)) return;

    const simAcc = accPercent / 100;
    
    let html = `<table class="sim-table">
                <thead><tr><th>Attempted</th><th>Exp. Score</th><th>Result</th></tr></thead><tbody>`;
    
    // Simulate attempts at 100%, 90%, 80%, 70%
    [1.0, 0.9, 0.8, 0.7].forEach(lvl => {
        const sAtt = Math.floor(tq * lvl); 
        const sCorr = Math.floor(sAtt * simAcc);
        const sWrong = sAtt - sCorr;
        
        const expScore = (sCorr * mpq) - (sWrong * ppw);
        const passed = expScore >= targetScore;
        
        const color = passed ? '#059669' : '#dc2626';
        const label = passed ? 'CLEARED' : 'FAILED';
        
        html += `<tr>
                    <td>${Math.round(lvl*100)}% (${sAtt} Qs)</td>
                    <td>${expScore.toFixed(1)}</td>
                    <td style="color:${color}; font-weight:700;">${label}</td>
                 </tr>`;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function resetTool() {
    document.getElementById('calcForm').reset();
    document.getElementById('resultBox').style.display = 'none';
    document.getElementById('stratSection').style.display = 'none';
    document.getElementById('advToggle').innerText = 'Show Strategy & Simulation ▼';
}

/* --- LAZY PDF --- */
async function generatePDF() {
    const btn = document.querySelector('.btn-sec');
    if (!window.jspdf) {
        const origText = btn.innerText;
        btn.innerText = 'Loading PDF Engine...';
        btn.disabled = true;
        try {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        } catch(e) {
            alert("Error loading PDF engine.");
            btn.innerText = origText;
            btn.disabled = false;
            return;
        }
        btn.innerText = origText;
        btn.disabled = false;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Exam Strategy Report", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Generated: " + new Date().toLocaleDateString(), 20, 35);

    const net = document.getElementById('resNet').innerText;
    const acc = document.getElementById('resAcc').innerText;
    const raw = document.getElementById('resRaw').innerText;
    const neg = document.getElementById('resNeg').innerText;
    
    doc.text(`Final Net Score: ${net}`, 20, 50);
    doc.text(`Accuracy: ${acc}`, 20, 60);
    doc.text(`Raw Marks: ${raw}`, 20, 70);
    doc.text(`Penalty Deducted: ${neg}`, 20, 80);

    doc.setFontSize(10);
    doc.text("Tool by LoveU Calc", 105, 280, null, null, "center");
    
    doc.save("Exam-Strategy.pdf");
}
