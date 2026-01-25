let currentMode = 'standard';
let selectedOuts = 0;
let currentInnings = 9; // Default to Standard Baseball

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('results').style.display = 'none';

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${mode}`).classList.add('active');

    document.getElementById('mode-standard').style.display = mode === 'standard' ? 'block' : 'none';
    document.getElementById('mode-reverse').style.display = mode === 'reverse' ? 'block' : 'none';
}

function setOuts(val) {
    selectedOuts = val;
    document.getElementById('selectedOuts').value = val;

    document.querySelectorAll('.btn-out').forEach(b => b.classList.remove('active'));
    document.getElementById(`out${val}`).classList.add('active');
}

// NEW FUNCTION: Segmented Control Logic
function setInnings(val) {
    currentInnings = val;
    
    // Update Button Visuals
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btnInning${val}`).classList.add('active');

    // Auto-recalculate if results are currently visible
    if (document.getElementById('results').style.display === 'block') {
        if (currentMode === 'standard') calculateStandardERA();
        else calculateReverseERA();
    }
}

function clearTool() {
    document.querySelectorAll('input').forEach(i => i.value = '');
    setOuts(0);
    document.getElementById('results').style.display = 'none';
    document.querySelectorAll('.input-wrapper').forEach(w => w.classList.remove('input-error'));
}

function calculateStandardERA() {
    const erInput   = parseFloat(document.getElementById('earnedRuns').value);
    const ipFullInput = parseFloat(document.getElementById('ipFull').value);

    if (isNaN(erInput)   || erInput   < 0) return showError('wrap-er');
    if (isNaN(ipFullInput) || ipFullInput < 0) return showError('wrap-ip');

    const decimalIP = ipFullInput + (selectedOuts / 3);
    const totalOuts = (ipFullInput * 3) + selectedOuts;

    if (decimalIP === 0) {
        updateResultUI("Result", "INF", "Infinite ERA (0 outs)", "badge-poor", "N/A",
                       "Earned Runs", erInput, "Total Innings", 0, "Total Outs", 0, "");
        return;
    }

    // FORMULA UPDATED: Use currentInnings (9 or 7)
    const era = (erInput * currentInnings) / decimalIP;
    const eraFixed = era.toFixed(2);

    const ratingData = getRating(era);
    const legendNote = getHistoricalContext(era);

    updateResultUI(
        "Earned Run Average",
        eraFixed,
        `Allows ~${Math.round(era)} runs per ${currentInnings} innings`,
        ratingData.badge,
        ratingData.text,
        "Earned Runs", erInput,
        "Total Innings", decimalIP.toFixed(2),
        "Total Outs", totalOuts,
        legendNote
    );
}

function calculateReverseERA() {
    const currEra = parseFloat(document.getElementById('currentEra').value);
    const currIp  = parseFloat(document.getElementById('currentIp').value);
    const target  = parseFloat(document.getElementById('targetEra').value);

    if (isNaN(currEra) || currEra < 0) return showError('wrap-curr-era');
    if (isNaN(currIp)  || currIp  < 0) return showError('wrap-curr-ip');
    if (isNaN(target)  || target <= 0) return showError('wrap-target-era');

    // FORMULA UPDATED: Use currentInnings logic
    const currentER     = (currEra * currIp) / currentInnings;
    const totalIpNeeded = (currentInnings * currentER) / target;
    let   neededIp      = totalIpNeeded - currIp;

    if (neededIp < 0) {
        if (currEra <= target) {
            updateResultUI("Scoreless Innings Needed", "0.0", "You are already below your target!",
                           "badge-excellent", "Success",
                           "Current ER (Est)", currentER.toFixed(1),
                           "Target Total IP", currIp,
                           "Target ERA", target, "");
            document.getElementById('legendBox').style.display = "none";
        } else {
            alert("Your current ERA is already impacted by runs. To lower it significantly, you need positive innings.");
        }
        return;
    }

    const neededFixed = neededIp.toFixed(1);

    updateResultUI(
        "Scoreless Innings Needed",
        neededFixed,
        `Pitch ${neededFixed} shutout innings to hit ${target}`,
        "badge-avg",
        "Target Plan",
        "Current ER (Est)", Math.round(currentER),
        "Target Total IP", totalIpNeeded.toFixed(1),
        "Target ERA", target,
        "Strategy: If you allow 0 runs for the next " + Math.ceil(neededIp) + " innings, you will reach your goal."
    );
}

function showError(id) {
    document.getElementById(id).classList.add('input-error');
    alert("Please check your inputs.");
}

function getRating(era) {
    if (era < 3.00) return { text: "Excellent", badge: "badge-excellent" };
    if (era < 4.00) return { text: "Good",      badge: "badge-good"      };
    if (era < 5.00) return { text: "Average",   badge: "badge-avg"       };
    return                 { text: "Poor",      badge: "badge-poor"      };
}

function getHistoricalContext(era) {
    if (era < 1.50) return "<strong>Legendary:</strong> This rivals Bob Gibson's 1968 record (1.12).";
    if (era < 2.50) return "<strong>Ace Material:</strong> Comparable to 1990s Maddux or Pedro.";
    if (era > 2.90 && era < 3.10) return "<strong>Historical Avg:</strong> Similar to the League Average in 1968 (2.98).";
    if (era > 4.10 && era < 4.50) return "<strong>Modern Average:</strong> Right around the 2025 MLB League Average (~4.30).";
    if (era > 5.50) return "<strong>High:</strong> This would be considered 'replacement level' in most eras.";
    return "<strong>Analysis:</strong> Keep tracking your stats to see trends over time.";
}

function updateResultUI(mainLabel, bigNum, subText, badgeClass, badgeText, r1L, r1V, r2L, r2V, r3L, r3V, legendHtml) {
    document.getElementById("results").style.display = "block";

    document.getElementById("resLabel").innerText   = mainLabel;
    document.getElementById("resMain").innerText    = bigNum;
    document.getElementById("resSummary").innerText = subText;

    const badge = document.getElementById("resBadge");
    badge.className = "result-badge " + badgeClass;
    badge.innerText = badgeText;

    document.getElementById("row1Label").innerText = r1L;
    document.getElementById("row1Val").innerText   = r1V;
    document.getElementById("row2Label").innerText = r2L;
    document.getElementById("row2Val").innerText   = r2V;
    document.getElementById("row3Label").innerText = r3L;
    document.getElementById("row3Val").innerText   = r3V;

    const legBox = document.getElementById("legendBox");
    if (legendHtml) {
        legBox.style.display = "block";
        document.getElementById("legendText").innerHTML = legendHtml;
    } else {
        legBox.style.display = "none";
    }

    if (window.innerWidth < 900) {
        const topPos = document.getElementById("results").offsetTop;
        window.scrollTo({ top: topPos + 100, behavior: 'smooth' });
    }
}
