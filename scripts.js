document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------------------------------------------
    // 1. DYNAMIC TOOLS DATABASE (Starts empty, loads automatically)
    // ---------------------------------------------------------
    let toolsDB = [];

    async function loadTools() {
        try {
            // Attempt to fetch the sitemap
            const response = await fetch('/sitemap.xml');
            
            if (response.ok) {
                const text = await response.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, "text/xml");
                const locs = xml.querySelectorAll("loc");

                // Convert sitemap URLs into search results
                toolsDB = Array.from(locs).map(node => {
                    const url = node.textContent;
                    const path = new URL(url).pathname; 

                    // Skip homepage or index
                    if (path === '/' || path === '/index.html') return null;

                    // Clean string: remove slashes, replace dashes with spaces
                    let name = path.replace(/^\/|\/$/g, '').replace(/-/g, ' ');

                    // Capitalize Words for the display title
                    name = name.replace(/\b\w/g, char => char.toUpperCase());

                    // Filter out non-tool pages (Add pages you want to hide here)
                    const ignoreList = ['Contact', 'About', 'Privacy', 'Terms', 'Sitemap', 'Category', 'Author'];
                    if (ignoreList.some(ignore => name.includes(ignore))) return null;

                    return { 
                        name: name, 
                        url: url, 
                        // Auto-generate tags from the name for easier searching
                        tags: name.toLowerCase() 
                    };
                }).filter(item => item !== null); // Remove null entries

                console.log("Tools loaded:", toolsDB.length); // Debugging check

            } else {
                console.warn("Sitemap.xml not found. Search will be empty.");
            }
        } catch (error) {
            console.error("Error auto-loading tools:", error);
        }
    }

    // Run the loader immediately
    loadTools();


    // ---------------------------------------------------------
    // 2. EXISTING UI HANDLERS (Menu & Search Overlays)
    // ---------------------------------------------------------
    const menuBtn = document.getElementById('menuBtn');
    const searchBtn = document.getElementById('searchBtn');
    const closeMenu = document.getElementById('closeMenu');
    const closeSearch = document.getElementById('closeSearch');
    
    const menuOverlay = document.getElementById('menuOverlay');
    const searchOverlay = document.getElementById('searchOverlay');
    
    const searchInput = document.getElementById('globalSearchInput');
    const resultsContainer = document.getElementById('searchResults');

    
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

    
    if(searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            if(searchInput) {
                searchInput.value = ''; 
                searchInput.focus(); 
                if(resultsContainer) resultsContainer.innerHTML = ''; 
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
    // 3. SEARCH INPUT LOGIC
    // ---------------------------------------------------------
    if(searchInput && resultsContainer) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            resultsContainer.innerHTML = ''; 

            if(query.length === 0) return; 

            // Search the dynamically loaded toolsDB
            const matches = toolsDB.filter(tool => {
                return tool.name.toLowerCase().includes(query) || 
                       tool.tags.includes(query);
            });

            if(matches.length > 0) {
                matches.forEach(tool => {
                    const link = document.createElement('a');
                    link.href = tool.url;
                    link.className = 'search-result-item'; // Matches your CSS
                    
                    // Optional inline styling for results if CSS is missing
                    link.style.display = 'block';
                    link.style.padding = '12px 0';
                    link.style.borderBottom = '1px solid #eee';
                    link.style.fontSize = '1.1rem';
                    link.style.fontWeight = '500';
                    
                    link.textContent = tool.name;
                    resultsContainer.appendChild(link);
                });
            } else {
                const noResult = document.createElement('div');
                noResult.className = 'no-results';
                noResult.style.padding = '12px 0';
                noResult.style.color = '#64748b';
                noResult.textContent = 'No tools found matching "' + query + '"';
                resultsContainer.appendChild(noResult);
            }
        });
    }
});
