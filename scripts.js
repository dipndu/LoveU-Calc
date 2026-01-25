document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------------------------------
    // 0. DYNAMIC MENU INJECTION (With Title)
    // ---------------------------------------------------------
    const navContainer = document.querySelector('.drawer .nav-lnk');
    
    if (navContainer) {
        // 1. Define the new links you want (You can add more here easily)
        const categories = [
            { name: 'Construction', url: '/categories/construction-materials' },
            { name: 'Education', url: '/categories/education-academics' },
            { name: 'Sports', url: '/categories/sports' }
        ];

        // 2. Create and append the "Categories" Title
        const titleDiv = document.createElement('div');
        titleDiv.textContent = 'Categories';
        // Styling the title to look good (Bold, slightly smaller, uppercase)
        titleDiv.style.cssText = 'padding: 16px 0 8px 0; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;';
        navContainer.appendChild(titleDiv);

        // 3. Loop through the list and create links
        categories.forEach(cat => {
            const link = document.createElement('a');
            link.href = cat.url;
            link.textContent = cat.name;
            // The CSS (.nav-lnk a) will automatically style these!
            navContainer.appendChild(link);
        });
    }


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
    const searchBtn = document.getElementById('searchBtn'); 
    const closeMenu = document.getElementById('closeMenu');
    const closeSearch = document.getElementById('closeSearch');
    
    const menuOverlay = document.getElementById('menuOverlay');
    const searchOverlay = document.getElementById('searchOverlay');
    
    // -- Input Elements --
    const globalInput = document.getElementById('globalSearchInput'); 
    const globalResults = document.getElementById('searchResults');   
    
    const heroInput = document.getElementById('heroSearchInput');     
    const heroResults = document.getElementById('heroSearchResults'); 

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
        const searchBarEl = searchOverlay.querySelector('.search-bar'); 

        searchBtn.addEventListener('click', () => {
            // 1. PREPARE LAYOUT FIRST (Prevents "Jump")
            const barHeight = searchBarEl ? searchBarEl.offsetHeight : 80;
            
            if(globalResults) {
                globalResults.style.marginTop = `${barHeight}px`; 
                globalResults.innerHTML = ''; 
                
                // Style the dropdown
                globalResults.style.backgroundColor = '#ffffff';
                globalResults.style.maxHeight = '60vh'; 
                globalResults.style.overflowY = 'auto'; 
                globalResults.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; 
                globalResults.style.borderBottomLeftRadius = '12px';
                globalResults.style.borderBottomRightRadius = '12px';
                globalResults.style.display = 'none'; 
            }

            if(globalInput) globalInput.value = ''; 

            // 2. APPLY STYLES
            searchOverlay.style.cssText = 'background-color: rgba(255, 255, 255, 0.5) !important; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); overflow-y: hidden !important;';

            // 3. ACTIVATE ANIMATION
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // 4. FOCUS INPUT
            setTimeout(() => {
                if(globalInput) globalInput.focus();
            }, 350); 
        });

        closeSearch.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            setTimeout(() => { 
                searchOverlay.style.cssText = ''; 
                if(globalResults) {
                    globalResults.style.backgroundColor = '';
                    globalResults.style.maxHeight = '';
                    globalResults.style.boxShadow = '';
                    globalResults.style.marginTop = '';
                }
            }, 300);
            
            if(globalInput) globalInput.blur();
        });

        searchOverlay.addEventListener('click', (e) => {
            if(e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
                setTimeout(() => { 
                    searchOverlay.style.cssText = '';
                    if(globalResults) {
                        globalResults.style.backgroundColor = '';
                        globalResults.style.maxHeight = '';
                        globalResults.style.boxShadow = '';
                        globalResults.style.marginTop = '';
                    }
                }, 300);
                if(globalInput) globalInput.blur();
            }
        });
    }
    
    // ---------------------------------------------------------
    // 3. UNIVERSAL SEARCH FUNCTION
    // ---------------------------------------------------------
    function performSearch(query, container) {
        container.innerHTML = ''; 
        
        if(query.length === 0) {
            container.style.display = 'none'; 
            return; 
        }

        container.style.display = 'block'; 

        const matches = toolsDB.filter(tool => {
            return tool.name.toLowerCase().includes(query) || 
                   tool.tags.includes(query);
        });

        if(matches.length > 0) {
            matches.forEach(tool => {
                const link = document.createElement('a');
                link.href = tool.url;
                
                link.style.display = 'block';
                link.style.padding = '12px 16px';
                link.style.borderBottom = '1px solid #f1f5f9';
                link.style.fontSize = '1.05rem';
                link.style.fontWeight = '500';
                link.style.color = '#334155';
                link.style.textDecoration = 'none';
                link.style.transition = 'background 0.2s';
                
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
    
    if(globalInput && globalResults) {
        globalInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            performSearch(query, globalResults);
        });
    }

    if(heroInput && heroResults) {
        heroInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            performSearch(query, heroResults);
        });

        document.addEventListener('click', (e) => {
            if (!heroInput.contains(e.target) && !heroResults.contains(e.target)) {
                heroResults.style.display = 'none';
            }
        });
    }
});
