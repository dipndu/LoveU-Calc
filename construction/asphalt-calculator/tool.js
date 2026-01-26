function toggleSubBase() {
    const section = document.getElementById('subBaseSection');
    section.style.display = document.getElementById('subBaseCheck').checked ? 'block' : 'none';
}

function toggleAdvanced() {
    const section = document.getElementById('advSection');
    const btn = document.getElementById('advToggle');
    if (section.style.display === 'block') {
        section.style.display = 'none';
        btn.innerText = 'Show Advanced (Compaction, Labor & Cost) ▼';
    } else {
        section.style.display = 'block';
        btn.innerText = 'Hide Advanced ▲';
    }
}

// Convert any unit to FEET
function getFeet(val, unit) {
    if(!val) return 0;
    switch(unit) {
        case 'ft': return val;
        case 'm': return val * 3.28084;
        case 'yd': return val * 3;
        case 'in': return val / 12;
        case 'cm': return val / 30.48;
        default: return val;
    }
}

function calculateAsphalt() {
    // 1. Get Inputs
    const lenRaw = parseFloat(document.getElementById('length').value);
    const lenUnit = document.getElementById('lengthUnit').value;
    const widRaw = parseFloat(document.getElementById('width').value);
    const widUnit = document.getElementById('widthUnit').value;
    const depRaw = parseFloat(document.getElementById('depth').value);
    const depUnit = document.getElementById('depthUnit').value;
    
    // Advanced Inputs
    const density = parseFloat(document.getElementById('density').value) || 145; 
    const waste = parseFloat(document.getElementById('waste').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const laborRate = parseFloat(document.getElementById('laborPrice').value) || 0;
    const compaction = parseFloat(document.getElementById('compaction').value) || 1.0;

    if(!lenRaw || !widRaw || !depRaw) {
        alert("Please fill in Length, Width, and Thickness.");
        return;
    }

    // 2. Calculations
    const lenFt = getFeet(lenRaw, lenUnit);
    const widFt = getFeet(widRaw, widUnit);
    const areaSqFt = lenFt * widFt;
    
    // Depth conversion logic
    const depFt = getFeet(depRaw, depUnit);

    // Volume & Tonnage
    const volCuFt = areaSqFt * depFt;
    // Formula: Vol * Density * Compaction
    let totalLbs = volCuFt * density * compaction; 
    let totalTons = totalLbs / 2000;

    // Add Waste Margin
    totalTons = totalTons * (1 + waste);

    // 3. Sub-Base
    let baseTons = 0;
    const includeBase = document.getElementById('subBaseCheck').checked;
    if(includeBase) {
        const baseDepthRaw = parseFloat(document.getElementById('baseDepth').value) || 0;
        const baseDepthUnit = document.getElementById('baseDepthUnit').value;
        const baseDepthFt = getFeet(baseDepthRaw, baseDepthUnit); // Fixed Unit Conversion
        const baseVol = areaSqFt * baseDepthFt;
        const baseDensity = parseFloat(document.getElementById('baseDensity').value) || 110; 
        baseTons = (baseVol * baseDensity) / 2000;
        baseTons = baseTons * (1 + waste); 
    }

    // 4. Cost Calculation
    let materialCost = 0;
    let laborCost = 0;
    
    if(price > 0) materialCost = totalTons * price;
    if(laborRate > 0) laborCost = areaSqFt * laborRate;
    
    const totalCost = materialCost + laborCost;

    // 5. Update UI
    document.getElementById('resTons').innerText = totalTons.toFixed(2);
    document.getElementById('resArea').innerText = areaSqFt.toFixed(0);
    
    // Sub Base UI
    const baseBox = document.getElementById('baseResultBox');
    if(includeBase && baseTons > 0) {
        baseBox.style.display = 'block';
        document.getElementById('resBaseTons').innerText = baseTons.toFixed(2);
    } else {
        baseBox.style.display = 'none';
    }

    // Cost UI & Visual Bar
    const costBox = document.getElementById('costResultBox');
    if(totalCost > 0) {
        costBox.style.display = 'block';
        document.getElementById('resTotalCost').innerText = '$' + totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        // Update Bar Chart
        const matPercent = (materialCost / totalCost) * 100;
        const labPercent = (laborCost / totalCost) * 100;
        
        document.getElementById('barMat').style.width = matPercent + '%';
        document.getElementById('barLab').style.width = labPercent + '%';
        
        document.getElementById('txtMat').innerText = '($' + materialCost.toLocaleString(undefined, {maximumFractionDigits:0}) + ')';
        document.getElementById('txtLab').innerText = '($' + laborCost.toLocaleString(undefined, {maximumFractionDigits:0}) + ')';
        
    } else {
        costBox.style.display = 'none';
    }

    // Show Results
    const resBox = document.getElementById('resultBox');
    resBox.style.display = 'block';
    resBox.classList.add('visible');
    resBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    doc.text("Asphalt Job Estimate", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Date: " + new Date().toLocaleDateString(), 20, 35);

    const tons = document.getElementById('resTons').innerText;
    const area = document.getElementById('resArea').innerText;
    const cost = document.getElementById('resTotalCost').innerText;
    
    doc.text(`Estimated Asphalt: ${tons} Tons`, 20, 50);
    doc.text(`Total Area: ${area} Sq. Ft.`, 20, 60);
    
    if(cost !== '$0.00') {
        doc.text(`Total Estimated Cost: ${cost}`, 20, 70);
        doc.setFontSize(10);
        doc.text(`(Includes Material & Labor)`, 20, 76);
        doc.setFontSize(12);
    }

    if(document.getElementById('subBaseCheck').checked) {
        const base = document.getElementById('resBaseTons').innerText;
        doc.text(`Sub-Base Gravel: ${base} Tons`, 20, 90);
    }

    doc.setFontSize(10);
    doc.text("Generated by LoveU Calc", 105, 280, null, null, "center");
    
    doc.save("Asphalt-Estimate.pdf");
}
