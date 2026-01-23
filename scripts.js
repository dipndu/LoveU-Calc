document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HARDCODED DATABASE (Works instantly) ---
    const toolsDB = [
        { 
            name: "Long Division Solver", 
            url: "/long-division-calculator", 
            tags: "long division solver math school homework arithmetic remainder" 
        },
        { 
            name: "Asphalt Calculator", 
            url: "/asphalt-calculator", 
            tags: "asphalt calculator road driveway paving blacktop ton construction" 
        },
        { 
            name: "Negative Marking Calc", 
            url: "/negative-marking-calculator", 
            tags: "negative marking calculator exam test jee neet upsc score" 
        },
        { 
            name: "Construction Tools", 
            url: "/categories/construction-materials", 
            tags: "construction materials tools cubic yard concrete" 
        },
        { 
            name: "Education Tools", 
            url: "/categories/education-academics", 
            tags: "education academics math student teacher" 
        }
    ];

    console.log("Tools Database Loaded:", toolsDB);

    // --- 2. HERO SEARCH FUNCTIONALITY ---
    const heroInput = document.getElementById('heroSearchInput');     
    const heroResults = document.getElementById('heroSearchResults'); 

    // Verify if elements exist
    if (!heroInput) console.error("CRITICAL ERROR: <input id='heroSearchInput'> is missing in HTML!");
    if (!heroResults) console.error("CRITICAL ERROR: <div id='heroSearchResults'> is missing in HTML!");

    if(heroInput && heroResults) {
        
        // Listen for typing
        heroInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            // Clear previous results
            heroResults.innerHTML = ''; 

            if(query.length === 0) {
                heroResults.style.display = 'none';
                return; 
            }

            // Find matches
            const matches = toolsDB.filter(tool => {
                return tool.tags.includes(query);
            });

            // Display results
            if(matches.length > 0) {
                heroResults.style.display = 'block';
                matches.forEach(tool => {
                    const link = document.createElement('a');
                    link.href = tool.url;
                    
                    // Style the link
                    Object.assign(link.style, {
                        display: 'block',
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '1.05rem',
                        color: '#334155',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        backgroundColor: '#fff' // Ensure it's not transparent
                    });

                    // Hover effects
                    link.addEventListener('mouseenter', () => link.style.background = '#f8fafc');
                    link.addEventListener('mouseleave', () => link.style.background = '#fff');

                    link.textContent = tool.name;
                    heroResults.appendChild(link);
                });
            } else {
                heroResults.style.display = 'block';
                const noResult = document.createElement('div');
                Object.assign(noResult.style, { padding: '12px 16px', color: '#94a3b8', backgroundColor: '#fff' });
                noResult.textContent = 'No tools found.';
                heroResults.appendChild(noResult);
            }
        });

        // Hide results when clicking away
        document.addEventListener('click', (e) => {
            if (!heroInput.contains(e.target) && !heroResults.contains(e.target)) {
                heroResults.style.display = 'none';
            }
        });
    }

    // --- 3. MENU & HEADER LOGIC ---
    const menuBtn = document.getElementById('menuBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenu = document.getElementById('closeMenu');

    if(menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        const closeMenuFunc = () => {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };
        closeMenu.addEventListener('click', closeMenuFunc);
        menuOverlay.addEventListener('click', (e) => {
            if(e.target === menuOverlay) closeMenuFunc();
        });
    }
});
