let steps = [];
let currentStepIndex = -1;
let autoPlayInterval = null;

function cleanNum(num) {
    return parseFloat(num.toFixed(10));
}

// FIX 1: Updated class name to match optimized CSS (.dys-mode)
function toggleDyscalculia() {
    const isChecked = document.getElementById('dyscalculiaToggle').checked;
    const container = document.getElementById('solverArea');
    if(isChecked) {
        container.classList.add('dys-mode');
    } else {
        container.classList.remove('dys-mode');
    }
    if(steps.length > 0) renderStep(currentStepIndex);
}

function startSolver() {
    const dividendInput = document.getElementById('dividend').value;
    const divisorInput = document.getElementById('divisor').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;

    if (!dividendInput || !divisorInput) return;
    const dividend = Math.abs(parseFloat(dividendInput)); 
    const divisor = Math.abs(parseFloat(divisorInput));

    if (divisor === 0) {
        alert("Cannot divide by zero!");
        return;
    }

    steps = generateDetailedSteps(dividend, divisor, mode === 'decimal');
    currentStepIndex = 0;

    renderStep(0);
    document.getElementById('solverArea').style.display = 'block';
    // Scroll to the solver
    document.getElementById('solverArea').scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateNavButtons();
}

function generateDetailedSteps(dividend, divisor, useDecimals) {
    const stepsLog = [];
    const dividendStr = dividend.toString();
    
    let digits = [];
    let originalDecimalPos = -1;

    if (dividendStr.includes('.')) {
        const parts = dividendStr.split('.');
        digits = (parts[0] + parts[1]).split('').map(Number);
        originalDecimalPos = parts[0].length; 
    } else {
        digits = dividendStr.split('').map(Number);
    }

    let currentRemainder = 0;
    let quotientStr = ""; 
    let visualRows = []; 
    let decimalAdded = false;

    stepsLog.push({
        expl: `Setup: We will divide ${dividend} by ${divisor}.`,
        q: "",
        rows: [],
        isDone: false
    });

    const maxDecimalPlaces = 3; 
    let infiniteGuard = 0;
    let i = 0;

    while (true) {
        if (i >= digits.length) {
            if (currentRemainder === 0) break; 
            if (!useDecimals) break; 
            if (decimalAdded && (quotientStr.split('.')[1] || "").length >= maxDecimalPlaces) break; 

            digits.push(0); 
            if (!decimalAdded) {
                quotientStr += ".";
                decimalAdded = true;
            }
        }
        
        if (originalDecimalPos !== -1 && i === originalDecimalPos && !decimalAdded) {
            quotientStr += ".";
            decimalAdded = true;
        }

        const digit = digits[i];
        let currentVal = cleanNum((currentRemainder * 10) + digit);

        if (i > 0) {
            let rowsAfterBringDown = JSON.parse(JSON.stringify(visualRows));
            rowsAfterBringDown.pop(); 
            rowsAfterBringDown.push({ val: currentVal, indent: i, type: 'res' });

            stepsLog.push({
                expl: `Bring down ${digit}. New target: ${currentVal}.`,
                q: quotientStr,
                rows: rowsAfterBringDown,
                isDone: false
            });
            visualRows = rowsAfterBringDown;
        }

        const count = Math.floor(cleanNum(currentVal / divisor));
        quotientStr += count; 
        
        stepsLog.push({
            expl: `${divisor} goes into ${currentVal} (${count}) times.`,
            q: quotientStr,
            rows: JSON.parse(JSON.stringify(visualRows)),
            isDone: false
        });

        const product = cleanNum(count * divisor);
        let rowsAfterMult = JSON.parse(JSON.stringify(visualRows));
        rowsAfterMult.push({ val: product, indent: i, type: 'sub' });
        
        stepsLog.push({
            expl: `Multiply: ${count} × ${divisor} = ${product}.`,
            q: quotientStr,
            rows: rowsAfterMult,
            isDone: false
        });
        visualRows = rowsAfterMult; 

        const nextRemainder = cleanNum(currentVal - product);
        let rowsAfterSub = JSON.parse(JSON.stringify(visualRows));
        rowsAfterSub.push({ val: nextRemainder, indent: i, type: 'res' });

        stepsLog.push({
            expl: `Subtract: ${currentVal} - ${product} = ${nextRemainder}.`,
            q: quotientStr,
            rows: rowsAfterSub,
            isDone: false
        });
        visualRows = rowsAfterSub; 

        currentRemainder = nextRemainder;
        i++;
        infiniteGuard++;
        if(infiniteGuard > 60) break; 
    }

    let finalQ = quotientStr;
    if (!finalQ.startsWith('0.')) finalQ = finalQ.replace(/^0+/, '') || '0';

    stepsLog.push({
        expl: `Done! Answer: ${finalQ} ${(!decimalAdded && currentRemainder > 0) ? 'R ' + currentRemainder : ''}.`,
        q: quotientStr,
        rows: visualRows,
        isDone: true
    });

    return stepsLog;
}

function renderStep(idx) {
    const step = steps[idx];
    const explanationElem = document.getElementById('explanationText');
    if(explanationElem) explanationElem.innerText = step.expl;
    
    const board = document.getElementById('mathBoard');
    const notation = document.getElementById('notationSelect').value;
    
    const dividendRaw = document.getElementById('dividend').value;
    const divisor = document.getElementById('divisor').value;

    // FIX 2: Updated class names to match optimized CSS (.hl-d, .hl-q)
    const wrapDivisor = (v) => `<span class="hl-d">${v}</span>`;
    const wrapQuotient = (v) => `<span class="hl-q">${v}</span>`;
    
    let fullDividend = dividendRaw.toString();
    let maxIndent = 0;
    if (step.rows.length > 0) maxIndent = step.rows[step.rows.length - 1].indent;
    
    let originalLen = dividendRaw.replace('.', '').length;
    let extraZeros = (maxIndent + 1) - originalLen;
    
    if (extraZeros > 0) {
        if (!fullDividend.includes('.')) fullDividend += '.';
        fullDividend += '0'.repeat(extraZeros);
    }

    let outputHTML = "";
    let quotientStr = step.q.padEnd(1, " ");

    if (notation === 'us') {
        const prefixStr = divisor + ") "; 
        const prefixLen = prefixStr.length;

        outputHTML += " ".repeat(prefixLen) + wrapQuotient(quotientStr) + "<br>";
        outputHTML += " ".repeat(prefixLen) + "-".repeat(fullDividend.length) + "<br>";
        outputHTML += wrapDivisor(divisor) + ") " + fullDividend + "<br>";
        outputHTML += renderWorkRows(step.rows, fullDividend, prefixLen);

    } else if (notation === 'eu') {
        let header = fullDividend + " | " + wrapDivisor(divisor);
        outputHTML += header + "<br>";
        let spacing = fullDividend.length;
        outputHTML += " ".repeat(spacing) + " |" + "-".repeat(Math.max(divisor.toString().length, quotientStr.length)+1) + "<br>";
        outputHTML += " ".repeat(spacing) + " | " + wrapQuotient(quotientStr) + "<br>";
        outputHTML += renderWorkRows(step.rows, fullDividend, 0);

    } else if (notation === 'ger') {
        let header = fullDividend + " : " + wrapDivisor(divisor) + " = " + wrapQuotient(quotientStr);
        outputHTML += header + "<br><br>";
        outputHTML += renderWorkRows(step.rows, fullDividend, 0);
    }

    board.innerHTML = outputHTML;
}

function renderWorkRows(rows, fullDividend, leftPadding) {
    let html = "";
    rows.forEach(row => {
        let valStr = row.val.toString();
        let visualIndex = 0;
        let logicalCounter = 0;
        
        for (let k = 0; k < fullDividend.length; k++) {
            if (fullDividend[k] !== '.') {
                if (logicalCounter === row.indent) {
                    visualIndex = k;
                    break;
                }
                logicalCounter++;
            }
            if (k === fullDividend.length - 1) visualIndex = k;
        }

        let endPos = leftPadding + visualIndex;
        let spaces = endPos - (valStr.length - 1);
        if (spaces < 0) spaces = 0;

        // FIX 3: Updated class name to match optimized CSS (.hl-s)
        if (row.type === 'sub') {
            let line = " ".repeat(spaces) + `<span class="hl-s">${valStr}</span>`;
            if (spaces >= 2) line = " ".repeat(spaces - 2) + "- " + `<span class="hl-s">${valStr}</span>`;
            html += line + "<br>";
            html += " ".repeat(spaces) + "-".repeat(valStr.length) + "<br>"; 
        } else {
            html += " ".repeat(spaces) + valStr + "<br>";
        }
    });
    return html;
}

function nextStep() {
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        renderStep(currentStepIndex);
        updateNavButtons();
    }
}

function prevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(currentStepIndex);
        updateNavButtons();
    }
}

function updateNavButtons() {
    document.getElementById('btnPrev').disabled = (currentStepIndex <= 0);
    document.getElementById('btnNext').disabled = (currentStepIndex >= steps.length - 1);
    
    const box = document.querySelector('.expl-box');
    if (!box) return;

    if (steps[currentStepIndex] && steps[currentStepIndex].isDone) {
        box.style.borderColor = "#10b981"; 
        box.style.background = "#d1fae5";
    } else {
        // Reset to default style defined in CSS (.expl-box)
        box.style.borderColor = ""; 
        box.style.background = "";
    }
}

function toggleAutoPlay() {
    const btn = document.getElementById('btnPlay');
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        btn.innerHTML = 'Auto';
    } else {
        if (currentStepIndex === steps.length - 1) currentStepIndex = -1; 
        btn.innerHTML = 'Pause';
        nextStep(); 
        autoPlayInterval = setInterval(() => {
            if (currentStepIndex < steps.length - 1) {
                nextStep();
            } else {
                toggleAutoPlay(); 
            }
        }, 2000); 
    }
}

function resetTool() {
    clearInterval(autoPlayInterval);
    document.getElementById('calcForm').reset();
    document.getElementById('solverArea').style.display = 'none';
    document.getElementById('mathBoard').innerHTML = "";
    steps = [];
    currentStepIndex = -1;
}

/* --- LAZY LOAD PDF GENERATION --- */
async function generatePDF() {
    const btn = document.querySelector('.btn-sec');
    
    // 1. Check if loaded
    if (!window.jspdf) {
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Loading...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
                script.onload = resolve;
                script.onerror = () => reject(new Error("Failed to load PDF library"));
                document.head.appendChild(script);
            });
        } catch (error) {
            alert("Could not load PDF tool. Please check connection.");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
    }

    // 2. Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Long Division Worksheet", 105, 20, null, null, "center");
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Name: __________________________   Date: ____________", 105, 30, null, null, "center");
    doc.setFontSize(10);
    doc.text("Generated by LoveU Calc", 105, 280, null, null, "center");
    doc.setFontSize(12);
    
    let x = 30; let y = 50;
    for(let i=1; i<=10; i++) {
        let div = Math.floor(Math.random() * 9) + 2; 
        let num = Math.floor(Math.random() * 899) + 100; 
        doc.text(`${i})  ${num} ÷ ${div} = `, x, y);
        y += 40;
        if (i === 5) { x = 120; y = 50; }
    }
    doc.save("division-worksheet.pdf");
}
