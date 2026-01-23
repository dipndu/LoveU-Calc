document.addEventListener('DOMContentLoaded', () => {

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

    const menuBtn = document.getElementById('menuBtn');
    const searchBtn = document.getElementById('searchBtn'); 
    const closeMenu = document.getElementById('closeMenu');
    const closeSearch = document.getElementById('closeSearch');
    
    const menuOverlay = document.getElementById('menuOverlay');
    const searchOverlay = document.getElementById('searchOverlay');
    
    const globalInput = document.getElementById('globalSearchInput'); 
    const globalResults = document.getElementById('searchResults');   
    
    const heroInput = document.getElementById('heroSearchInput');     
    const heroResults = document.getElementById('heroSearchResults'); 

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
        const searchBarEl = searchOverlay.querySelector('.search-bar'); 

        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            
            searchOverlay.style.cssText = 'background-color: rgba(255, 255, 255, 0.5) !important; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); overflow-y: hidden !important;';

            if(globalInput) {
                globalInput.value = ''; 
                if(globalResults) {
                    globalResults.innerHTML = '';
                    
                    const barHeight = searchBarEl ? searchBarEl.offsetHeight : 80;
                    globalResults.style.marginTop = `${barHeight}px`; 
                    
                    globalResults.style.backgroundColor = '#ffffff';
                    globalResults.style.maxHeight = '60vh'; 
                    globalResults.style.overflowY = 'auto'; 
                    globalResults.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; 
                    globalResults.style.borderBottomLeftRadius = '12px';
                    globalResults.style.borderBottomRightRadius = '12px';
                }

                setTimeout(() => {
                    globalInput.focus();
                }, 350); 
            }
            document.body.style.overflow = 'hidden';
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
                    }
                }, 300);
                if(globalInput) globalInput.blur();
            }
        });
    }
    
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
