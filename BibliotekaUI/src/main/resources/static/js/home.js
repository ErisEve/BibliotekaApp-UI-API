// ========================================
// GLOBALS
// ========================================
const booksGridElement = document.getElementById('booksgrid');
let globalBooksData = [];
let globalLoansData = [];

// ========================================
// BOOK DETAIL MODAL
// ========================================
function openBookDetailModal(book) {
    console.log('Opening book detail modal for:', book.title);

    const modal = document.getElementById('bookDetailModal');
    const titleEl = document.getElementById('bookDetailTitle');
    const detailTitle = document.getElementById('detailTitle');
    const detailAuthor = document.getElementById('detailAuthor');
    const detailIsbn = document.getElementById('detailIsbn');
    const detailYear = document.getElementById('detailYear');
    const detailDescription = document.getElementById('detailDescription');
    const detailStatus = document.getElementById('detailStatus');
    const coverContainer = document.getElementById('bookDetailCover');

    if (!modal) {
        console.error('Modal not found');
        return;
    }

    titleEl.innerHTML = `<i class="fas fa-book-open"></i> ${book.title || 'Book Details'}`;
    detailTitle.textContent = book.title || 'Unknown Title';
    detailAuthor.textContent = book.author || 'Unknown Author';
    detailIsbn.textContent = book.isbn || 'N/A';
    detailYear.textContent = book.publishedYear || book.year || 'N/A';
    detailDescription.textContent = book.description || 'No description available.';

    const isAvailable = book.available !== undefined ? book.available : true;
    const statusText = isAvailable ? 'Available' : 'Borrowed';
    const statusClass = isAvailable ? 'available' : 'borrowed';
    detailStatus.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;

    let coverUrl = book.coverUrl || book.cover_url || book.cover || null;
    if (coverUrl && typeof coverUrl === 'object') {
        coverUrl = coverUrl.medium || coverUrl.small || coverUrl.large || null;
    }

    if (coverContainer) {
        if (coverUrl) {
            coverContainer.innerHTML = `
                <img src="${coverUrl}" alt="${book.title || 'Book'} cover" 
                     style="width: 100%; height: auto; border-radius: 12px; object-fit: cover;" 
                     onerror="this.parentElement.innerHTML = '<i class=\\'fas fa-book\\' style=\\'font-size: 3rem; color: #3c5270;\\'></i>'" />
            `;
        } else {
            coverContainer.innerHTML = `<i class="fas fa-book" style="font-size: 3rem; color: #3c5270;"></i>`;
        }
    }

    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        loanForm.dataset.bookId = book.id || book.bookId || '';
    }

    const loanUserEmail = document.getElementById('loanUserEmail');
    if (loanUserEmail) loanUserEmail.value = '';

    const loanDays = document.getElementById('loanDays');
    if (loanDays) loanDays.value = '14';

    const loanFormToast = document.getElementById('loanFormToast');
    if (loanFormToast) {
        loanFormToast.className = 'toast-message';
        loanFormToast.style.display = 'none';
    }

    modal.classList.add('open');
}

function closeBookDetailModal() {
    const modal = document.getElementById('bookDetailModal');
    if (modal) modal.classList.remove('open');

    const toast = document.getElementById('loanFormToast');
    if (toast) {
        toast.className = 'toast-message';
        toast.style.display = 'none';
    }
}

// ========================================
// SEARCH BOOKS
// ========================================
function searchBooks() {
    const keyword = document.getElementById('keyword').value.trim();

    if (!keyword) {
        console.warn('⚠️ Please enter a search keyword');
        fetchAllBooks().then(() => fetchLoanedBooks());
        return;
    }

    const token = localStorage.getItem('jwtToken');
    const searchApiUrl = `http://localhost:8080/api/books/search?keyword=${encodeURIComponent(keyword)}`;

    console.log('🔍 Searching for:', keyword);

    if (!booksGridElement) return;

    booksGridElement.innerHTML = '<div class="loading-text">🔍 Searching...</div>';

    fetch(searchApiUrl, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                window.location.href = '/login';
                throw new Error('Unauthorized');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Search results:', data);

            let results;
            if (Array.isArray(data)) {
                results = data;
            } else if (data.content && Array.isArray(data.content)) {
                results = data.content;
            } else if (data.books && Array.isArray(data.books)) {
                results = data.books;
            } else if (data.data && Array.isArray(data.data)) {
                results = data.data;
            } else {
                results = [];
            }

            if (results.length === 0) {
                booksGridElement.innerHTML = `<div class="loading-text">🔍 No results found for "${escapeHtml(keyword)}"</div>`;
                return;
            }

            // Filter out loaned books
            const loanedIds = globalLoansData.map(l => l.bookId || l.book?.id || l.id).filter(id => id);
            const available = results.filter(book => !loanedIds.includes(book.id));
            renderBooksGrid1(available);
        })
        .catch(error => {
            console.error('Search error:', error);
            booksGridElement.innerHTML = `<div class="error-text">❌ Search failed: ${error.message}</div>`;
        });
}

function renderBooksGrid1(booksData) {
    console.log('📊 Rendering books, count:', booksData ? booksData.length : 0);

    if (!booksGridElement) {
        console.error('❌ booksGridElement is null');
        return;
    }

    if (!booksData || !Array.isArray(booksData) || booksData.length === 0) {
        booksGridElement.innerHTML = '<div class="loading-text">📚 No books available</div>';
        return;
    }

    let htmlEl = '';

    booksData.forEach((book, index) => {
        const title = book.title || book.bookTitle || 'Unknown Title';
        const author = book.author || book.bookAuthor || 'Unknown Author';
        const isbn = book.isbn || book.bookIsbn || 'N/A';
        const availability = book.available !== undefined ?
            (book.available ? 'available' : 'borrowed') :
            (book.status || 'available');

        let coverUrl = book.coverUrl || book.cover_url || book.cover || null;

        if (coverUrl && typeof coverUrl === 'object') {
            coverUrl = coverUrl.medium || coverUrl.small || coverUrl.large || null;
        }

        const coverHtml = coverUrl
            ? `<img src="${coverUrl}" alt="${escapeHtml(title)} cover" class="book-cover-img" />`
            : `<i class="fas fa-book-open"></i>`;

        htmlEl += `
                <div class="book-card" data-index="${index}" style="cursor: pointer;">
                    <div class="book-cover">
                        ${coverHtml}
                    </div>
                    <h4>${escapeHtml(title)}</h4>
                    <div class="author">${escapeHtml(author)}</div>
                    <div class="book-meta">
                        <span><i class="fas fa-hashtag"></i> ${escapeHtml(isbn)}</span>
                        <span class="status-badge ${availability}">${availability}</span>
                    </div>
                </div>
            `;
    });

    booksGridElement.innerHTML = htmlEl;
    console.log('✅ Books rendered successfully');
}

// ========================================
// WAIT FOR DOM TO LOAD
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Dashboard initialized');

    const booksApiUrl = 'http://localhost:8080/api/books/booksAll';
    const loansApiUrl = 'http://localhost:8080/api/lendings';
    const token = localStorage.getItem('jwtToken');

    // Check authentication
    if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        window.location.href = '/login';
        return;
    }

    // Set user name
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = localStorage.getItem('userEmail') || 'User';
    }

    const loanGridElement = document.getElementById('lendeditems');
    const refreshBtn = document.getElementById('refreshBtn');

    if (!booksGridElement) {
        console.error('❌ Element with id "booksgrid" not found!');
        return;
    }
    if (!loanGridElement) {
        console.error('❌ Element with id "lendeditems" not found!');
        return;
    }

    // Setup search
    const searchBtn = document.querySelector('.search-wrapper button');
    const searchInput = document.getElementById('keyword');

    if (searchBtn) {
        searchBtn.addEventListener('click', searchBooks);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBooks();
            }
        });
    }

    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            fetchAllBooks()
                .then(() => fetchLoanedBooks())
                .catch(error => console.error('Refresh error:', error));
        });
        console.log('✅ Refresh button found');
    }

    // Initial load - sequential
    fetchAllBooks()
        .then(() => fetchLoanedBooks())
        .catch(error => console.error('Initial load error:', error));

    // ========================================
    // FETCH ALL BOOKS
    // ========================================
    function fetchAllBooks() {
        console.log('📚 Fetching books...');

        if (!booksGridElement) {
            console.error('❌ booksGridElement is null');
            return Promise.reject('booksGridElement is null');

        }

        booksGridElement.innerHTML = '<div class="loading-text">⏳ Loading books...</div>';
        if (!token) {
            booksGridElement.innerHTML = '<div class="error-text">⚠️ Not authenticated. Please login.</div>';
            return Promise.reject('Not authenticated');
        }
        return fetch(booksApiUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                console.log('📡 Books response status:', response.status);

                if (response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    window.location.href = '/login';
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('📦 Books raw data received');

                let books;
                if (Array.isArray(data)) {
                    books = data;
                } else if (data.content && Array.isArray(data.content)) {
                    books = data.content;
                } else if (data.books && Array.isArray(data.books)) {
                    books = data.books;
                } else if (data.data && Array.isArray(data.data)) {
                    books = data.data;
                } else {
                    const values = Object.values(data);
                    books = (values.length > 0 && Array.isArray(values[0])) ? values[0] : [];
                }

                globalBooksData = books;
                console.log('📚 Processed books:', books.length);

                // Update stats
                const totalBooks = document.getElementById('totalBooks');
                if (totalBooks) totalBooks.textContent = books.length;

                const distinctAuthors = document.getElementById('distinctAuthors');
                if (distinctAuthors) {
                    distinctAuthors.textContent = [...new Set(books.map(book => book.author))].filter(Boolean).length;
                }

                if (!books || books.length === 0) {
                    booksGridElement.innerHTML = '<div class="loading-text">📚 No books found</div>';
                    return books;
                }

                return books;
            })
            .catch(error => {
                console.error('❌ Error fetching books:', error);
                if (booksGridElement) {
                    booksGridElement.innerHTML = `<div class="error-text">❌ Failed to load books: ${error.message}</div>`;
                }
                throw error;
            });
    }

    // ========================================
    // FETCH LOANED BOOKS
    // ========================================
    function fetchLoanedBooks() {
        console.log('📚 Fetching loaned books...');

        if (!loanGridElement) {
            console.warn('⚠️ loanGridElement not found');
            return Promise.reject('loanGridElement not found');
        }

        loanGridElement.innerHTML = '<div class="loading-text">⏳ Loading loans...</div>';

        if (!token) {
            loanGridElement.innerHTML = '<div class="error-text">⚠️ Not authenticated</div>';
            return Promise.reject('Not authenticated');
        }

        // If books aren't loaded yet, wait
        if (!globalBooksData || globalBooksData.length === 0) {
            console.warn('⏳ Waiting for books to load before fetching loans...');
            return new Promise(resolve => {
                const checkBooks = setInterval(() => {
                    if (globalBooksData && globalBooksData.length > 0) {
                        clearInterval(checkBooks);
                        resolve(fetchLoanedBooks());
                    }
                }, 200);
            });
        }

        return fetch(loansApiUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                console.log('📡 Loans response status:', response.status);

                if (response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    window.location.href = '/login';
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('📦 Loans raw data received');

                let loans;
                if (Array.isArray(data)) {
                    loans = data;
                } else if (data.content && Array.isArray(data.content)) {
                    loans = data.content;
                } else if (data.loans && Array.isArray(data.loans)) {
                    loans = data.loans;
                } else if (data.data && Array.isArray(data.data)) {
                    loans = data.data;
                } else {
                    const values = Object.values(data);
                    loans = (values.length > 0 && Array.isArray(values[0])) ? values[0] : [];
                }

                globalLoansData = loans;
                console.log('📚 Processed loans:', loans.length);

                const loansCount = document.getElementById('loansCount');
                if (loansCount) loansCount.textContent = loans.length;

                if (!loans || loans.length === 0) {
                    loanGridElement.innerHTML = '<div class="loading-text">📚 No active loans</div>';
                    renderBooksGrid(globalBooksData);
                    return loans;
                }

                // Get loaned book IDs
                const loanedBookIds = loans.map(loan => {
                    return loan.bookId || loan.book?.id || loan.id;
                }).filter(id => id !== undefined && id !== null);

                console.log('🔑 Loaned book IDs:', loanedBookIds);

                // Filter available books
                const availableBooks = globalBooksData.filter(book => {
                    return !loanedBookIds.includes(book.id);
                });

                console.log('✅ Available books:', availableBooks.length);

                renderLoansGrid(loans);
                renderBooksGrid(availableBooks);
                updateTopBorrowerDisplay(loans);

                return loans;
            })
            .catch(error => {
                console.error('❌ Error fetching loans:', error);
                if (loanGridElement) {
                    loanGridElement.innerHTML = `<div class="error-text">❌ Failed to load loans: ${error.message}</div>`;
                }
                // Show all books if loans fail
                renderBooksGrid(globalBooksData);
                throw error;
            });
    }

    // ========================================
// RENDER LOANS GRID - SORTED BY RETURN DATE
// ========================================
    function renderLoansGrid(loansData) {
        console.log('📊 Rendering loans, count:', loansData ? loansData.length : 0);

        if (!loanGridElement) {
            console.error('❌ loanGridElement is null');
            return;
        }

        if (!loansData || !Array.isArray(loansData) || loansData.length === 0) {
            loanGridElement.innerHTML = '<div class="loading-text">📚 Trenutno nema pozajmljenih knjiga!</div>';
            return;
        }

        // ✅ SORT BY RETURN DATE (closest to furthest)
        const sortedLoans = [...loansData].sort((a, b) => {
            const dateA = a.returnDate || a.returnedDate || a.returnedAt || '9999-12-31';
            const dateB = b.returnDate || b.returnedDate || b.returnedAt || '9999-12-31';

            // Handle 'N/A' values - put them at the end
            if (dateA === 'N/A' && dateB === 'N/A') return 0;
            if (dateA === 'N/A') return 1;
            if (dateB === 'N/A') return -1;

            return new Date(dateA) - new Date(dateB);
        });

        console.log('📊 Loans sorted by return date (closest first)');

        let htmlEl = '';

        sortedLoans.forEach(loan => {
            const bookTitle = loan.bookTitle || loan.book?.title || loan.title || 'Unknown Book';
            const userName = loan.userName || loan.user?.name || loan.borrower || 'Unknown User';
            const borrowDate = loan.borrowDate || loan.borrowedDate || loan.borrowedAt || 'N/A';
            const returnDate = loan.returnDate || loan.returnedDate || loan.returnedAt || 'N/A';
            const isOverdue = loan.overdue || loan.isOverdue || false;

            const coverUrl = loan.coverUrl || loan.cover_url || loan.book?.coverUrl || loan.book?.cover_url || null;

            const dateDisplay = returnDate && returnDate !== 'N/A' ?
                `<i class="far fa-calendar-alt"></i> Due: ${formatDate(returnDate)}` :
                `<i class="far fa-calendar-alt"></i> Borrowed: ${formatDate(borrowDate)}`;

            const overdueClass = isOverdue ? 'overdue' : '';

            const coverHtml = coverUrl
                ? `<img src="${coverUrl}" alt="${escapeHtml(bookTitle)} cover" class="lending-cover-img" />`
                : `<i class="fas fa-book"></i>`;

            htmlEl += `
            <div class="lending-item">
                <div class="lending-avatar">
                    ${coverHtml}
                </div>
                <div class="lending-info">
                    <div class="book-name">${escapeHtml(bookTitle)}</div>
                    <div class="user-name">Borrowed by ${escapeHtml(userName)}</div>
                </div>
                <div class="lending-date ${overdueClass}">
                    ${dateDisplay}
                    ${isOverdue ? ' <i class="fas fa-exclamation-circle"></i>' : ''}
                </div>
            </div>
        `;
        });

        loanGridElement.innerHTML = htmlEl;
        console.log('✅ Loans rendered successfully (sorted by return date)');
    }

    // ========================================
    // RENDER BOOKS GRID
    // ========================================
    function renderBooksGrid(booksData) {
        console.log('📊 Rendering books, count:', booksData ? booksData.length : 0);

        if (!booksGridElement) {
            console.error('❌ booksGridElement is null');
            return;
        }

        if (!booksData || !Array.isArray(booksData) || booksData.length === 0) {
            booksGridElement.innerHTML = '<div class="loading-text">📚 No books available</div>';
            return;
        }

        let htmlEl = '';

        booksData.forEach((book, index) => {
            const title = book.title || book.bookTitle || 'Unknown Title';
            const author = book.author || book.bookAuthor || 'Unknown Author';
            const isbn = book.isbn || book.bookIsbn || 'N/A';
            const availability = book.available !== undefined ?
                (book.available ? 'available' : 'borrowed') :
                (book.status || 'available');

            let coverUrl = book.coverUrl || book.cover_url || book.cover || null;

            if (coverUrl && typeof coverUrl === 'object') {
                coverUrl = coverUrl.medium || coverUrl.small || coverUrl.large || null;
            }

            const coverHtml = coverUrl
                ? `<img src="${coverUrl}" alt="${escapeHtml(title)} cover" class="book-cover-img" />`
                : `<i class="fas fa-book-open"></i>`;

            htmlEl += `
                <div class="book-card" data-index="${index}" style="cursor: pointer;">
                    <div class="book-cover">
                        ${coverHtml}
                    </div>
                    <h4>${escapeHtml(title)}</h4>
                    <div class="author">${escapeHtml(author)}</div>
                    <div class="book-meta">
                        <span><i class="fas fa-hashtag"></i> ${escapeHtml(isbn)}</span>
                        <span class="status-badge ${availability}">${availability}</span>
                    </div>
                </div>
            `;
        });

        booksGridElement.innerHTML = htmlEl;
        console.log('✅ Books rendered successfully');
    }

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toISOString().split('T')[0];
        } catch {
            return dateString;
        }
    }

    // ========================================
    // BOOK CLICK HANDLER
    // ========================================
    function setupBookClickHandler() {
        if (!booksGridElement) {
            console.warn('⚠️ booksgrid element not found');
            return;
        }

        booksGridElement.removeEventListener('click', handleBookCardClick);
        booksGridElement.addEventListener('click', handleBookCardClick);
        console.log('✅ Book click handler set up');
    }

    function handleBookCardClick(e) {
        const card = e.target.closest('.book-card');
        if (!card) return;

        const index = parseInt(card.dataset.index);
        if (isNaN(index)) {
            console.warn('⚠️ Invalid index on card');
            return;
        }

        if (!globalBooksData || !globalBooksData[index]) {
            console.warn('⚠️ Book not found at index:', index);
            return;
        }

        const book = globalBooksData[index];
        console.log('📖 Book clicked:', book.title || book);

        if (typeof openBookDetailModal === 'function') {
            openBookDetailModal(book);
        } else {
            console.warn('⚠️ openBookDetailModal function not found');
            alert(`Book: ${book.title}\nAuthor: ${book.author}\nISBN: ${book.isbn}`);
        }
    }

    setupBookClickHandler();
});

// ========================================
// USER PROFILE CONTEXT MENU
// ========================================
(function() {
    const userProfile = document.getElementById('userProfile');
    const contextMenu = document.getElementById('contextMenu');
    const chevronIcon = document.getElementById('chevronIcon');
    let isMenuOpen = false;

    if (userProfile) {
        userProfile.addEventListener('click', toggleMenu);
    }

    function toggleMenu(e) {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        if (contextMenu) {
            contextMenu.classList.toggle('open', isMenuOpen);
        }
        if (chevronIcon) {
            chevronIcon.style.transform = isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    document.addEventListener('click', function(e) {
        if (isMenuOpen && userProfile && !userProfile.contains(e.target)) {
            if (contextMenu) contextMenu.classList.remove('open');
            isMenuOpen = false;
            if (chevronIcon) chevronIcon.style.transform = 'rotate(0deg)';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            if (contextMenu) contextMenu.classList.remove('open');
            isMenuOpen = false;
            if (chevronIcon) chevronIcon.style.transform = 'rotate(0deg)';
            if (userProfile) userProfile.focus();
        }
    });

    // ---- EDIT MODAL ----
    const modalOverlay = document.getElementById('editModal');
    const openModalBtn = document.getElementById('editUserBtn');
    const submitChangesBtn = document.getElementById('submitUserChanges');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const editForm = document.getElementById('editForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const confirmInput = document.getElementById('confirmPasswordInput');
    const toast = document.getElementById('formToast');

    if (openModalBtn && modalOverlay) {
        openModalBtn.addEventListener('click', openModal);
    }

    function openModal() {
        if (modalOverlay) modalOverlay.classList.add('open');
        if (toast) {
            toast.style.display = 'none';
            toast.textContent = 'Changes saved successfully!';
        }
        if (isMenuOpen && contextMenu) {
            contextMenu.classList.remove('open');
            isMenuOpen = false;
            if (chevronIcon) chevronIcon.style.transform = 'rotate(0deg)';
        }

        // Pre-fill current email if available
        if (emailInput) {
            const currentEmail = localStorage.getItem('userEmail');
            if (currentEmail) {
                emailInput.value = currentEmail;
            }
        }
        // Clear password fields
        if (passwordInput) passwordInput.value = '';
        if (confirmInput) confirmInput.value = '';
    }

    if (closeModalBtn && modalOverlay) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (cancelModalBtn && modalOverlay) {
        cancelModalBtn.addEventListener('click', closeModal);
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('open');
        if (editForm) {
            const wrappers = editForm.querySelectorAll('.input-wrapper');
            wrappers.forEach(el => el.style.borderColor = '');
        }
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });

    // ---- API CALL TO UPDATE USER ----
    async function updateUserApi(userData) {
        const token = localStorage.getItem('jwtToken');

        if (!token) {
            throw new Error('User not authenticated. Please login again.');
        }

        try {
            const response = await fetch('http://localhost:8080/api/users/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    throw new Error('Session expired. Please login again.');
                } else if (response.status === 409) {
                    throw new Error('Email already in use by another account.');
                } else {
                    throw new Error(errorData.message || 'Failed to update profile.');
                }
            }

            const data = await response.json();

            // Update stored token if it was refreshed
            if (data.newToken) {
                localStorage.setItem('jwtToken', data.newToken);
            }

            // Update stored email if changed
            if (userData.email) {
                localStorage.setItem('userEmail', userData.email);
            }

            return data;
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    // ---- EDIT FORM SUBMIT ----
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            let hasError = false;
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            const confirm = confirmInput ? confirmInput.value : '';

            if (editForm) {
                const wrappers = editForm.querySelectorAll('.input-wrapper');
                wrappers.forEach(el => el.style.borderColor = '');
            }

            if (!email || !email.includes('@')) {
                if (emailInput && emailInput.closest) {
                    emailInput.closest('.input-wrapper').style.borderColor = '#b13a2e';
                }
                hasError = true;
            }

            if (password.length > 0) {
                if (password.length < 6) {
                    if (passwordInput && passwordInput.closest) {
                        passwordInput.closest('.input-wrapper').style.borderColor = '#b13a2e';
                    }
                    hasError = true;
                }
                if (password !== confirm) {
                    if (confirmInput && confirmInput.closest) {
                        confirmInput.closest('.input-wrapper').style.borderColor = '#b13a2e';
                    }
                    hasError = true;
                }
            }

            if (toast) {
                if (hasError) {
                    toast.style.display = 'block';
                    toast.style.background = '#fce3df';
                    toast.style.color = '#b13a2e';
                    toast.textContent = 'Lose uneseni podaci.';
                    return;
                }

                // Show loading state
                toast.style.display = 'block';
                toast.style.background = '#4299e1';
                toast.style.color = 'white';
                toast.textContent = 'Azuriranje...';
            }

            try {
                // Prepare data for API
                const updateData = {
                    email: email
                };

                if (password && password.length >= 6) {
                    updateData.password = password;
                }

                // Call API
                const result = await updateUserApi(updateData);
                console.log(result);

                // Success
                if (toast) {
                    toast.style.background = '#def0e6';
                    toast.style.color = '#1a6e4a';
                    toast.textContent = '✅ Profile updated successfully!';
                }

                // Close modal after success
                // setTimeout(() => {
                //     closeModal();
                //     // Optionally refresh page or update UI
                //     // window.location.reload();
                // }, 1200);

            } catch (error) {
                // Error
                if (toast) {
                    toast.style.background = '#fce3df';
                    toast.style.color = '#b13a2e';
                    toast.textContent = `❌ ${error.message}`;
                }
                console.error('Update error:', error);
            }
        });
    }

    // ---- LOGOUT ----
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userEmail');
                window.location.href = '/login';
            }
            if (contextMenu) contextMenu.classList.remove('open');
            isMenuOpen = false;
            if (chevronIcon) chevronIcon.style.transform = 'rotate(0deg)';
        });
    }
})();

// ========================================
// BOOK DETAIL MODAL CLOSE BUTTONS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Close modal buttons
    const closeDetailBtn = document.getElementById('closeBookDetailModal');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', closeBookDetailModal);
    }

    const cancelLoanBtn = document.getElementById('cancelLoanBtn');
    if (cancelLoanBtn) {
        cancelLoanBtn.addEventListener('click', closeBookDetailModal);
    }

    // Close on backdrop click
    const detailModal = document.getElementById('bookDetailModal');
    if (detailModal) {
        detailModal.addEventListener('click', function(e) {
            if (e.target === detailModal) {
                closeBookDetailModal();
            }
        });
    }

    // Escape key for detail modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('bookDetailModal');
            if (modal && modal.classList.contains('open')) {
                closeBookDetailModal();
            }
        }
    });
});

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// FIND USER WITH HIGHEST LOAN COUNT
// ========================================
function findTopBorrower(loansData) {
    if (!loansData || loansData.length === 0) {
        console.warn('⚠️ No loan data available');
        return null;
    }

    // Count loans per user
    const loanCounts = {};

    loansData.forEach(loan => {
        const userId = loan.userId || loan.user?.id || loan.user_id || null;
        const userName = loan.userName || loan.user?.name || loan.borrower || null;

        if (userId) {
            if (!loanCounts[userId]) {
                loanCounts[userId] = {
                    count: 0,
                    name: userName || 'Unknown User'
                };
            }
            loanCounts[userId].count++;
        }
    });

    console.log('📊 Loan counts per user:', loanCounts);

    // Find user with highest count
    let topUserId = null;
    let topCount = 0;
    let topName = '';

    for (const [userId, data] of Object.entries(loanCounts)) {
        if (data.count > topCount) {
            topCount = data.count;
            topUserId = userId;
            topName = data.name;
        }
    }

    if (topUserId) {
        return {
            userId: topUserId,
            name: topName,
            count: topCount
        };
    }

    return null;
}

// ========================================
// UPDATE TOP BORROWER DISPLAY
// ========================================
function updateTopBorrowerDisplay(loansData) {
    const topBorrower = findTopBorrower(loansData);

    const topBorrowerElement = document.getElementById('topBorrower');
    const topBorrowerCountElement = document.getElementById('topBorrowerCount');

    if (!topBorrowerElement) {
        console.warn('⚠️ Element with id "topBorrower" not found');
        return;
    }

    if (topBorrower) {
        topBorrowerElement.textContent = topBorrower.name || 'Unknown User';
        if (topBorrowerCountElement) {
            topBorrowerCountElement.textContent = topBorrower.count;
        }
        console.log(`🏆 Top borrower: ${topBorrower.name} with ${topBorrower.count} loans`);
    } else {
        topBorrowerElement.textContent = 'No data';
        if (topBorrowerCountElement) {
            topBorrowerCountElement.textContent = '0';
        }
        console.warn('⚠️ No borrower data available');
    }
}