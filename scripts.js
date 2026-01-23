document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------------------------------------------
    // 1. DYNAMIC TOOLS DATABASE
    // ---------------------------------------------------------
    let toolsDB = [];

    async function loadTools() {
        try {
            const response = await fetch('/sitemap.xml');
            
            if (response.ok) {
                const text = await response.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, "text/xml");
                const locs = xml.querySelectorAll("loc");

                toolsDB = Array.from(locs).map(node => {
                    const url = node.textContent;
                    const path = new URL(url).pathname; 

                    if (path === '/' || path === '/index.html') return null;

                    let name = path.replace(/^\/|\/$/g, '').replace(/-/g, ' ');
                    name = name.replace(/\b\w/g, char => char.toUpperCase());

                    const ignoreList = ['Contact', 'About', 'Privacy', 'Terms', 'Sitemap', 'Category', 'Author'];
                    if (ignoreList.some(ignore => name.includes(ignore))) return null;

                    return { name: name, url: url, tags: name.toLowerCase() };
                }).filter(item => item !== null);

            } else {
                console.warn("Sitemap.xml not found. Search will be empty.");
            }
        } catch (error) {
            console.error("Error auto-loading tools:", error);
        }
    }

    loadTools();


    // ---------------------------------------------------------
    // 2. UI HANDLERS (Menu & Overlay)
    // ---------------------------------------------------------
    const menuBtn = document.getElementById('menuBtn');
    const searchBtn = document.getElementById('searchBtn'); // The magnifying glass icon
    const closeMenu = document.getElementById('closeMenu');
    const closeSearch = document.getElementById('closeSearch');
    
    const menuOverlay = document.getElementById('menuOverlay');
    const searchOverlay = document.getElementById('searchOverlay');
    
    // -- Input Elements --
    const globalInput = document.getElementById('globalSearchInput'); // Overlay Input
    const globalResults = document.getElementById('searchResults');   // Overlay Results
    
    const heroInput = document.getElementById('heroSearchInput');     // Main Hero Input
    const heroResults = document.getElementById('heroSearchResults'); // Main Hero Results

    // Menu Logic
    if(menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        closeMenu.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        menuOverlay.addEventListener('click', (e) => {
            if(e.target === menuOverlay) {
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Search Overlay Logic (Magnifying Glass)
    if(searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            if(globalInput) {
                globalInput.value = ''; 
                globalInput.focus(); 
                if(globalResults) globalResults.innerHTML = ''; 
            }
            document.body.style.overflow = 'hidden';
        });

        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        searchOverlay.addEventListener('click', (e) => {
            if(e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ---------------------------------------------------------
    // 3. UNIVERSAL SEARCH FUNCTION
    // ---------------------------------------------------------
    function performSearch(query, container) {
        container.innerHTML = ''; // Clear previous results
        
        if(query.length === 0) {
            container.style.display = 'none'; // Hide if empty
            return; 
        }

        container.style.display = 'block'; // Show container

        const matches = toolsDB.filter(tool => {
            return tool.name.toLowerCase().includes(query) || 
                   tool.tags.includes(query);
        });

        if(matches.length > 0) {
            matches.forEach(tool => {
                const link = document.createElement('a');
                link.href = tool.url;
                
                // Styling for results
                link.style.display = 'block';
                link.style.padding = '12px 16px';
                link.style.borderBottom = '1px solid #f1f5f9';
                link.style.fontSize = '1.05rem';
                link.style.fontWeight = '500';
                link.style.color = '#334155';
                link.style.textDecoration = 'none';
                link.style.transition = 'background 0.2s';
                
                // Hover effect
                link.addEventListener('mouseenter', () => link.style.background = '#f8fafc');
                link.addEventListener('mouseleave', () => link.style.background = 'transparent');

                link.textContent = tool.name;
                container.appendChild(link);
            });
        } else {
            const noResult = document.createElement('div');
            noResult.style.padding = '12px 16px';
            noResult.style.color = '#94a3b8';
            noResult.textContent = 'No tools found matching "' + query + '"';
            container.appendChild(noResult);
        }
    }

    // ---------------------------------------------------------
    // 4. ATTACH LISTENERS TO INPUTS
    // ---------------------------------------------------------
    
    // Listener for Global Overlay Search
    if(globalInput && globalResults) {
        globalInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            performSearch(query, globalResults);
        });
    }

    // Listener for Hero Section Search
    if(heroInput && heroResults) {
        heroInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            performSearch(query, heroResults);
        });

        // Hide results if clicking outside
        document.addEventListener('click', (e) => {
            if (!heroInput.contains(e.target) && !heroResults.contains(e.target)) {
                heroResults.style.display = 'none';
            }
        });
    }
});
