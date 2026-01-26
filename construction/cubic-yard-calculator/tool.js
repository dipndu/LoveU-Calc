/**
 * LoveU Calc - Cubic Yard Logic
 */

let currentShape = 'rect'; // rect, circle, triangle

document.addEventListener('DOMContentLoaded', () => {
    // Enable Enter key for all inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                calculateYardage();
            }
        });
    });

    // Initialize state
    setShape('rect');
});

function setShape(shape) {
    currentShape = shape;
    
    // Toggle active tab buttons
    document.querySelectorAll('.btn-sec').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById('tab-' + shape);
    if(activeTab) activeTab.classList.add('active');

    // Toggle input groups
    document.querySelectorAll('.shape-group').forEach(el => el.classList.add('hidden'));

    if (shape === 'rect') {
        document.getElementById('group-rect').classList.remove('hidden');
    } else if (shape === 'circle') {
        document.getElementById('group-circle').classList.remove('hidden');
    } else if (shape === 'triangle') {
        document.getElementById('group-triangle').classList.remove('hidden');
    }
}

function toFeet(val, unit) {
    if (!val) return 0;
    if (unit === 'ft') return val;
    if (unit === 'yd') return val * 3;
    if (unit === 'in') return val / 12;
    if (unit === 'cm') return val / 30.48;
    if (unit === 'm') return val * 3.28084;
    return val;
}

function calculateYardage() {
    // 1. Get Common Options
    const dVal = parseFloat(document.getElementById('depth').value);
    const dUnit = document.getElementById('depthUnit').value;
    const density = parseFloat(document.getElementById('material').value); 
    const waste = parseFloat(document.getElementById('waste').value);
    const price = parseFloat(document.getElementById('price').value);
    const priceUnit = document.getElementById('priceUnit').value;

    if (isNaN(dVal) || dVal <= 0) {
        alert("Please enter a valid depth.");
        return;
    }

    const depthFt = toFeet(dVal, dUnit);
    let areaSqFt = 0;

    // 2. Shape Logic
    if (currentShape === 'rect') {
        const lVal = parseFloat(document.getElementById('length').value);
        const lUnit = document.getElementById('lengthUnit').value;
        const wVal = parseFloat(document.getElementById('width').value);
        const wUnit = document.getElementById('widthUnit').value;

        if (isNaN(lVal) || isNaN(wVal) || lVal <= 0 || wVal <= 0) {
            alert("Please enter valid length and width."); return;
        }
        areaSqFt = toFeet(lVal, lUnit) * toFeet(wVal, wUnit);

    } else if (currentShape === 'circle') {
        const diamVal = parseFloat(document.getElementById('diameter').value);
        const diamUnit = document.getElementById('diameterUnit').value;
        if (isNaN(diamVal) || diamVal <= 0) {
            alert("Please enter a valid diameter."); return;
        }
        const radiusFt = toFeet(diamVal, diamUnit) / 2;
        areaSqFt = Math.PI * Math.pow(radiusFt, 2);

    } else if (currentShape === 'triangle') {
        const bVal = parseFloat(document.getElementById('triBase').value);
        const bUnit = document.getElementById('triBaseUnit').value;
        const hVal = parseFloat(document.getElementById('triHeight').value);
        const hUnit = document.getElementById('triHeightUnit').value;
        if (isNaN(bVal) || isNaN(hVal) || bVal <= 0 || hVal <= 0) {
            alert("Please enter valid base and height."); return;
        }
        areaSqFt = 0.5 * toFeet(bVal, bUnit) * toFeet(hVal, hUnit);
    }

    // 3. Main Calculations
    const volCuFtRaw = areaSqFt * depthFt;
    const volCuFt = volCuFtRaw * (1 + waste); 
    const volCuYards = volCuFt / 27;
    const volCuMeters = volCuYards * 0.764555;

    // 4. Weight Calculation
    let totalLbs = 0, totalTons = 0, totalKg = 0, hasWeight = false;

    if (density > 0) {
        hasWeight = true;
        totalLbs = volCuYards * density;
        totalTons = totalLbs / 2000;
        totalKg = totalLbs * 0.453592;
    }

    // 5. Cost Calculation
    let totalCost = 0, showCost = false;

    if (!isNaN(price) && price > 0) {
        showCost = true;
        if (priceUnit === 'ton') {
            if (hasWeight) totalCost = totalTons * price;
            else showCost = false; 
        } else {
            totalCost = volCuYards * price;
        }
    }

    // 6. Logistics Calculation
    let truckLoads = 0;
    const truckVolCap = 2.0; 
    
    // SAFETY FIX: Lowered max weight to 1.0 Ton (2000 lbs) for standard pickups
    const truckWeightCap = 1.0; 

    if (hasWeight) {
        const loadsByVol = volCuYards / truckVolCap;
        const loadsByWeight = totalTons / truckWeightCap;
        truckLoads = Math.max(loadsByVol, loadsByWeight);
    } else {
        truckLoads = volCuYards / truckVolCap;
    }
    
    let bagCount = 0, bagLabel = "";
    if (density === 600) { 
        bagCount = volCuFt / 2; bagLabel = "(2 ft³)";
    } else if (density >= 3800) {
        if (hasWeight) bagCount = totalLbs / 80; else bagCount = volCuFt / 0.6;
        bagLabel = "(80lb)";
    } else {
        bagCount = volCuFt / 0.75; bagLabel = "(0.75 ft³)";
    }

    // 7. Update DOM / Results
    document.getElementById("results").style.display = "block";
    document.getElementById("resTotalYards").innerText = volCuYards.toFixed(2);
    
    const badge = document.getElementById("costBadge");
    if (showCost) {
        badge.style.display = "inline-block";
        badge.innerText = "Est. Cost: $" + totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    } else {
        badge.style.display = "none";
    }

    const logBar = document.getElementById("logisticsBar");
    if (volCuYards > 0) {
        logBar.style.display = "grid"; 
        document.getElementById("resTrucks").innerText = Math.ceil(truckLoads);
        document.getElementById("resBags").innerText = Math.ceil(bagCount);
        document.getElementById("resBagType").innerText = bagLabel;
    } else {
        logBar.style.display = "none";
    }

    document.getElementById("resFeet").innerText = volCuFt.toFixed(2) + " ft³";
    document.getElementById("resMeters").innerText = volCuMeters.toFixed(2) + " m³";
    document.getElementById("resArea").innerText = areaSqFt.toFixed(2) + " sq ft";
    document.getElementById("resWaste").innerText = (waste * 100).toFixed(0) + "%";

    const weightEl = document.getElementById("resWeight");
    const weightMetEl = document.getElementById("resWeightMetric");
    const warningEl = document.getElementById("weightWarning");

    if (hasWeight) {
        weightEl.innerText = totalTons.toFixed(2) + " Tons";
        weightMetEl.innerText = Math.round(totalKg).toLocaleString() + " kg";
        warningEl.style.display = "block";
    } else {
        weightEl.innerText = "N/A";
        weightMetEl.innerText = "N/A";
        warningEl.style.display = "none";
    }
    
    // Smooth scroll to results
    setTimeout(() => {
        document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
}

function clearTool() {
    document.querySelectorAll('input').forEach(i => i.value = '');
    
    const matSel = document.getElementById('material');
    if(matSel) matSel.value = '0';
    
    const wasteSel = document.getElementById('waste');
    if(wasteSel) wasteSel.value = '0.05';
    
    document.getElementById("results").style.display = "none";
    setShape('rect');
}

/* =========================================
   NEW FEATURE: Quick Converter (Accordion Style)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const matSelect = document.getElementById('material');
    const inputTons = document.getElementById('convTons');
    const inputYards = document.getElementById('convYards');
    
    // Toggle Logic
    const toggleBtn = document.getElementById('convToggleBtn');
    const panel = document.getElementById('converterPanel');

    if(toggleBtn && panel) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            // Change the +/- icon
            toggleBtn.lastElementChild.innerText = isHidden ? '-' : '+';
        });
    }

    // Helper to get current density
    function getDensity() {
        const d = parseFloat(matSelect.value);
        return isNaN(d) ? 0 : d;
    }

    // Update placeholders/state based on material selection
    function updateConverterState() {
        const density = getDensity();
        const isDisabled = density === 0;
        
        inputTons.disabled = isDisabled;
        inputYards.disabled = isDisabled;
        
        if (isDisabled) {
            inputTons.placeholder = "Select Material first";
            inputYards.placeholder = "Select Material first";
            inputTons.value = "";
            inputYards.value = "";
        } else {
            inputTons.placeholder = "Enter Tons...";
            inputYards.placeholder = "Enter Yards...";
            if (inputTons.value) inputTons.dispatchEvent(new Event('input'));
        }
    }

    // Event: Convert Tons -> Yards
    inputTons.addEventListener('input', () => {
        const density = getDensity();
        if (density === 0) return;

        const val = parseFloat(inputTons.value);
        if (!isNaN(val)) {
            // Formula: Yards = (Tons * 2000) / Density
            const yards = (val * 2000) / density;
            inputYards.value = yards.toFixed(2);
        } else {
            inputYards.value = '';
        }
    });

    // Event: Convert Yards -> Tons
    inputYards.addEventListener('input', () => {
        const density = getDensity();
        if (density === 0) return;

        const val = parseFloat(inputYards.value);
        if (!isNaN(val)) {
            // Formula: Tons = (Yards * Density) / 2000
            const tons = (val * density) / 2000;
            inputTons.value = tons.toFixed(2);
        } else {
            inputTons.value = '';
        }
    });

    // Listen for material changes
    matSelect.addEventListener('change', updateConverterState);
    updateConverterState();
});
