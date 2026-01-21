document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. THE TOOL DATABASE ---
    // Add all your tools here. This is what the search engine looks through.
    const toolsDB = [
        { name: "Asphalt Calculator", url: "/asphalt-calculator/", tags: "construction road driveway blacktop" },
        { name: "CGPA Calculator", url: "/cgpa-calculator/", tags: "education grade marks college" },
        { name: "SGPA Calculator", url: "/sgpa-calculator/", tags: "education semester grade" },
        { name: "Salary Hike Calculator", url: "/salary-hike-calculator/", tags: "finance money pay raise" },
        { name: "Mortgage Payoff", url: "/mortgage-payoff-calculator/", tags: "finance loan house interest" },
        { name: "Cubic Yard Calculator", url: "/cubic-yard-calculator/", tags: "construction dirt concrete volume" },
        { name: "Age Calculator", url: "/age-calculator/", tags: "general lifestyle birthday" },
        // Add more tools here as you build them...
    ];

    // --- 2. ELEMENTS ---
    const menuBtn = document.getElementById('menuBtn');
    const searchBtn = document.getElementById('searchBtn');
    const closeMenu = document.getElementById('closeMenu');
    const closeSearch = document.getElementById('closeSearch');
    
    const menuOverlay = document.getElementById('menuOverlay');
    const searchOverlay = document.getElementById('searchOverlay');
    
    const searchInput = document.getElementById('globalSearchInput');
    const resultsContainer = document.getElementById('searchResults');

    // --- 3. MENU LOGIC ---
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

    // --- 4. SEARCH OPEN/CLOSE LOGIC ---
    if(searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            if(searchInput) {
                searchInput.value = ''; // Clear previous search
                searchInput.focus(); // Focus cursor automatically
                if(resultsContainer) resultsContainer.innerHTML = ''; // Clear previous results
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

    // --- 5. REAL SEARCH FUNCTIONALITY ---
    if(searchInput && resultsContainer) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            resultsContainer.innerHTML = ''; // Clear current list

            if(query.length === 0) return; // Don't show anything if empty

            // Filter the DB
            const matches = toolsDB.filter(tool => {
                return tool.name.toLowerCase().includes(query) || 
                       tool.tags.toLowerCase().includes(query);
            });

            // Display Results
            if(matches.length > 0) {
                matches.forEach(tool => {
                    const link = document.createElement('a');
                    link.href = tool.url;
                    link.className = 'search-result-item';
                    link.textContent = tool.name;
                    resultsContainer.appendChild(link);
                });
            } else {
                const noResult = document.createElement('div');
                noResult.className = 'no-results';
                noResult.textContent = 'No tools found matching "' + query + '"';
                resultsContainer.appendChild(noResult);
            }
        });
    }
});
