// Configuration
const API_BASE_URL = "http://localhost:8080/api/seats";
let seatsData = [];
let globalSeatsData = [];
let selectedSeatId = null;
let userId = localStorage.getItem('userId');

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toast notification
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle'
    };
    toast.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Hardcoded seat data for demonstration
const HARDCODED_SEATS = [
    { id: 1, seat_number: 'A1', user: null },
    { id: 2, seat_number: 'A2', user: { id: 2, email: 'john@example.com' } },
    { id: 3, seat_number: 'A3', user: null },
    { id: 4, seat_number: 'A4', user: null },
    { id: 5, seat_number: 'A5', user: { id: 5, email: 'jane@example.com' } },
    { id: 6, seat_number: 'A6', user: null },
    { id: 7, seat_number: 'A7', user: null },
    { id: 8, seat_number: 'A8', user: null },
    { id: 9, seat_number: 'B1', user: { id: 9, email: 'bob@example.com' } },
    { id: 10, seat_number: 'B2', user: null },
    { id: 11, seat_number: 'B3', user: null },
    { id: 12, seat_number: 'B4', user: { id: 12, email: 'alice@example.com' } },
    { id: 13, seat_number: 'B5', user: { id: 13, email: 'charlie@example.com' } },
    { id: 14, seat_number: 'B6', user: null },
    { id: 15, seat_number: 'B7', user: null },
    { id: 16, seat_number: 'B8', user: null },
    { id: 17, seat_number: 'C1', user: null },
    { id: 18, seat_number: 'C2', user: null },
    { id: 19, seat_number: 'C3', user: { id: 19, email: 'david@example.com' } },
    { id: 20, seat_number: 'C4', user: { id: 20, email: 'eve@example.com' } },
    { id: 21, seat_number: 'C5', user: null },
    { id: 22, seat_number: 'C6', user: null },
    { id: 23, seat_number: 'C7', user: null },
    { id: 24, seat_number: 'C8', user: null },
    { id: 25, seat_number: 'D1', user: null },
    { id: 26, seat_number: 'D2', user: { id: 26, email: 'frank@example.com' } },
    { id: 27, seat_number: 'D3', user: null },
    { id: 28, seat_number: 'D4', user: null },
    { id: 29, seat_number: 'D5', user: { id: 29, email: 'grace@example.com' } },
    { id: 30, seat_number: 'D6', user: null },
    { id: 31, seat_number: 'D7', user: null },
    { id: 32, seat_number: 'D8', user: null }
];

// Fetch seats from backend or use hardcoded data
async function fetchSeats() {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.warn('No token found, redirecting to login');
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Seats response status:', response.status);

        if (response.status === 401) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (response.status === 403) {
            console.error('Forbidden ');
            showToast('Nemas permisije da gledas sedista. ', 'error');
            // Still use hardcoded data for demo
            const seats = HARDCODED_SEATS.map(seat => ({
                ...seat,
                seatNumber: seat.seat_number,
                reservedBy: seat.user?.email || null,
                status: seat.user ? 'occupied' : 'available'
            }));
            globalSeatsData = seats;
            seatsData = seats;
            renderSeats(seats);
            updateStats(seats);
            return seats;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Seats raw data received:', data);

        let seats;
        if (Array.isArray(data)) {
            seats = data;
        } else if (data.content && Array.isArray(data.content)) {
            seats = data.content;
        } else if (data.seats && Array.isArray(data.seats)) {
            seats = data.seats;
        } else if (data.data && Array.isArray(data.data)) {
            seats = data.data;
        } else {
            const values = Object.values(data);
            seats = (values.length > 0 && Array.isArray(values[0])) ? values[0] : [];
        }

        // Normalize seat data
        seats = seats.map(seat => ({
            id: seat.id,
            seatNumber: seat.seat_number || seat.seatNumber || seat.number || 'N/A',
            seat_number: seat.seat_number || seat.seatNumber || seat.number || 'N/A',
            user: seat.user || null,
            reservedBy: seat.user?.email || seat.reservedBy || null,
            status: seat.user ? 'occupied' : 'available'
        }));

        globalSeatsData = seats;
        seatsData = seats;
        console.log('Processed seats:', seats.length);

        renderSeats(seats);
        updateStats(seats);
        showToast(`Loaded ${seats.length} seats from server`, 'success');
        return seats;

    } catch (error) {
        console.log('Backend not available or error:', error.message);
        // Use hardcoded data as fallback
        const seats = HARDCODED_SEATS.map(seat => ({
            ...seat,
            seatNumber: seat.seat_number,
            reservedBy: seat.user?.email || null,
            status: seat.user ? 'occupied' : 'available'
        }));
        globalSeatsData = seats;
        seatsData = seats;
        renderSeats(seats);
        updateStats(seats);
        showToast('Using demo data (backend not available)', 'info');
        return seats;
    }
}

// Render seats
function renderSeats(seats) {
    const seatsGridElement = document.getElementById('seatGrid');
    if (!seatsGridElement) {
        console.error('Seats grid element not found');
        return;
    }

    if (!seats || seats.length === 0) {
        seatsGridElement.innerHTML = '<div class="loading-text">No seats available</div>';
        return;
    }

    let htmlEl = '';

    seats.forEach((seat) => {
        const seatNumber = seat.seatNumber || seat.seat_number || seat.number || 'N/A';
        const status = seat.status || (seat.reservedBy ? 'occupied' : 'available');
        const isSelected = selectedSeatId === seat.id;
        const statusClass = isSelected ? 'selected' : status;
        const statusDisplay = isSelected ? 'selected' : status;

        const userEmail = seat.user?.email || seat.reservedBy || '';
        const displayName = userEmail ? userEmail.split('@')[0] : '';

        const icon = getSeatIcon(statusDisplay);

        htmlEl += `
            <div class="seat-item" data-seat-id="${seat.id}" style="cursor: pointer;">
                <div class="seat-icon ${statusClass}">
                    ${icon}
                </div>
                <div class="seat-label">${escapeHtml(seatNumber)}</div>
                <div class="seat-status-text ${statusClass}">${statusDisplay}${displayName ? ' (' + escapeHtml(displayName) + ')' : ''}</div>
            </div>
        `;
    });

    seatsGridElement.innerHTML = htmlEl;

    document.querySelectorAll('.seat-item').forEach(el => {
        el.addEventListener('click', function() {
            const seatId = parseInt(this.dataset.seatId);
            handleSeatClick(seatId);
        });
    });

    console.log('Seats rendered successfully');
}

// Get seat icon based on status
function getSeatIcon(status) {
    const icons = {
        'available': '🟢',
        'occupied': '🔴',
        'selected': '🔵',
        'maintenance': '🟡'
    };
    return icons[status] || '🪑';
}

// Update stats
function updateStats(seats) {
    if (!seats) return;

    const available = seats.filter(s => s.status === 'available' && selectedSeatId !== s.id).length;
    const occupied = seats.filter(s => s.status === 'occupied').length;
    const selected = seats.filter(s => selectedSeatId === s.id).length;

    const availableCount = document.getElementById('availableCount');
    const occupiedCount = document.getElementById('occupiedCount');
    const selectedCount = document.getElementById('selectedCount');
    const totalSeatsBadge = document.getElementById('totalSeatsBadge');
    const selectedSeatDisplay = document.getElementById('selectedSeatDisplay');

    if (availableCount) availableCount.textContent = available;
    if (occupiedCount) occupiedCount.textContent = occupied;
    if (selectedCount) selectedCount.textContent = selected;
    if (totalSeatsBadge) totalSeatsBadge.textContent = `${seats.length} seats`;
    if (selectedSeatDisplay) {
        if (selectedSeatId) {
            const seat = seats.find(s => s.id === selectedSeatId);
            selectedSeatDisplay.textContent = seat ? `Seat ${seat.seatNumber}` : 'None';
        } else {
            selectedSeatDisplay.textContent = 'None';
        }
    }
}

// Handle seat click
function handleSeatClick(seatId) {
    const seat = seatsData.find(s => s.id === seatId);
    if (!seat) return;

    if (seat.status === 'occupied') {
        showToast(`Seat ${seat.seatNumber} is already occupied. Cannot select it.`, 'error');
        return;
    }

    if (selectedSeatId === seatId) {
        clearSelection();
        return;
    }

    clearSelection(false);

    selectedSeatId = seatId;
    seat.status = 'selected';

    renderSeats(seatsData);
    updateStats(seatsData);

    const selectedSeatDisplay = document.getElementById('selectedSeatDisplay');
    const selectedSeatPreview = document.getElementById('selectedSeatPreview');
    const selectedSeatNumber = document.getElementById('selectedSeatNumber');
    const reserveBtn = document.getElementById('reserveBtn');

    if (selectedSeatDisplay) selectedSeatDisplay.textContent = `Seat ${seat.seatNumber}`;
    if (selectedSeatPreview) selectedSeatPreview.style.display = 'flex';
    if (selectedSeatNumber) selectedSeatNumber.textContent = `Seat ${seat.seatNumber}`;
    if (reserveBtn) reserveBtn.disabled = false;

    showToast(`Seat ${seat.seatNumber} selected! Click Reserve to confirm.`, 'info');
}

// Clear selection
function clearSelection(shouldRender = true) {
    if (selectedSeatId !== null) {
        const seat = seatsData.find(s => s.id === selectedSeatId);
        if (seat && seat.status === 'selected') {
            seat.status = 'available';
        }
        selectedSeatId = null;

        const selectedSeatPreview = document.getElementById('selectedSeatPreview');
        const reserveBtn = document.getElementById('reserveBtn');

        if (selectedSeatPreview) selectedSeatPreview.style.display = 'none';
        if (reserveBtn) reserveBtn.disabled = true;

        if (shouldRender) {
            renderSeats(seatsData);
            updateStats(seatsData);
        }
    }
}

// Reserve seat
async function reserveSeat() {
    if (selectedSeatId === null) {
        showToast('Please select a seat first!', 'error');
        return;
    }

    const seat = seatsData.find(s => s.id === selectedSeatId);
    if (!seat) {
        showToast('Seat not found!', 'error');
        return;
    }

    if (seat.status === 'occupied') {
        showToast(`Seat ${seat.seatNumber} is no longer available.`, 'error');
        clearSelection();
        await fetchSeats();
        return;
    }

    const token = localStorage.getItem('jwtToken');

    // const userId = localStorage.getItem('userId') || 1; // Fallback, but should be set during login
    const email = localStorage.getItem('userEmail');
    console.log('Reserving seat:', {
        seatId: selectedSeatId,
        userId: userId,
        email: email
    });

    try {
        const response = await fetch(`${API_BASE_URL}/reserve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                seatId: selectedSeatId,
                userId: userId,
                email:email
            })
        });

        console.log('Reserve response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reservation failed: ${errorText}`);
        }

        const result = await response.json();
        console.log('Reserve result:', result);

        showToast(`Seat ${seat.seatNumber} reserved successfully!`, 'success');

        await fetchSeats();

        // Clear selection
        selectedSeatId = null;
        const selectedSeatPreview = document.getElementById('selectedSeatPreview');
        const reserveBtn = document.getElementById('reserveBtn');
        if (selectedSeatPreview) selectedSeatPreview.style.display = 'none';
        if (reserveBtn) reserveBtn.disabled = true;

    } catch (error) {
        console.error('Error reserving seat:', error);
        showToast(`Failed to reserve seat: ${error.message}`, 'error');
    }
}
// Refresh seats
async function refreshSeats() {
    showToast('Refreshing seat data...', 'info');
    clearSelection();
    await fetchSeats();
    showToast('Seats updated!', 'success');
}

function checkTokenAndRole() {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('userEmail');

    console.log('🔍 Auth Debug:');
    console.log('  Token:', token ? token.substring(0, 30) + '...' : 'NOT FOUND');
    console.log('  Role:', role || 'NOT FOUND');
    console.log('  Email:', email || 'NOT FOUND');

    if (!token) {
        console.warn('⚠️ No token found!');
    }

    return { token, role, email };
}
// Initialize
async function init() {
    const { token, role, email } = checkTokenAndRole();

    if (!token) {
        console.warn('No token found, redirecting to login');
        window.location.href = '/login';
        return;
    }

    // If role is missing, try to get it from token (decode)
    if (!role) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Decoded token:', payload);
            const extractedRole = payload.role || payload.authorities || 'USER';
            localStorage.setItem('role', extractedRole);
        } catch (e) {
            console.error('Could not decode token:', e);
        }
    }

    // Continue with initialization
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (userNameDisplay) {
        userNameDisplay.textContent = (localStorage.getItem('userEmail') || 'User').split('@')[0];
    }

    await fetchSeats();

    const reserveBtn = document.getElementById('reserveBtn');
    if (reserveBtn) {
        reserveBtn.addEventListener('click', reserveSeat);
    }

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshSeats);
    }

    console.log('Library Seat Reservation System initialized');
    console.log('Backend API:', API_BASE_URL);
    console.log('User ID:', userId);
}

document.addEventListener('DOMContentLoaded', init);

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
                    toast.textContent = 'Profile updated successfully!';
                }

                // Close modal after success

            } catch (error) {
                // Error
                if (toast) {
                    toast.style.background = '#fce3df';
                    toast.style.color = '#b13a2e';
                    toast.textContent = `Error: ${error.message}`;
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
