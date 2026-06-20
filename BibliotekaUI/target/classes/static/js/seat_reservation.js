// Configuration
const API_BASE_URL = "http://localhost:8084/api/seats";
let seatsData = [];
let selectedSeatId = null;
let userId = 1;

// Hardcoded seat data for demonstration
// const HARDCODED_SEATS = [
//     // Row 1 - A1 to A8
//     { id: 1, seatNumber: 'A1', status: 'available' },
//     { id: 2, seatNumber: 'A2', status: 'occupied' },
//     { id: 3, seatNumber: 'A3', status: 'available' },
//     { id: 4, seatNumber: 'A4', status: 'available' },
//     { id: 5, seatNumber: 'A5', status: 'occupied' },
//     { id: 6, seatNumber: 'A6', status: 'maintenance' },
//     { id: 7, seatNumber: 'A7', status: 'available' },
//     { id: 8, seatNumber: 'A8', status: 'available' },
//
//     // Row 2 - B1 to B8
//     { id: 9, seatNumber: 'B1', status: 'occupied' },
//     { id: 10, seatNumber: 'B2', status: 'available' },
//     { id: 11, seatNumber: 'B3', status: 'available' },
//     { id: 12, seatNumber: 'B4', status: 'occupied' },
//     { id: 13, seatNumber: 'B5', status: 'occupied' },
//     { id: 14, seatNumber: 'B6', status: 'available' },
//     { id: 15, seatNumber: 'B7', status: 'available' },
//     { id: 16, seatNumber: 'B8', status: 'available' },
//
//     // Row 3 - C1 to C8
//     { id: 17, seatNumber: 'C1', status: 'available' },
//     { id: 18, seatNumber: 'C2', status: 'available' },
//     { id: 19, seatNumber: 'C3', status: 'occupied' },
//     { id: 20, seatNumber: 'C4', status: 'occupied' },
//     { id: 21, seatNumber: 'C5', status: 'available' },
//     { id: 22, seatNumber: 'C6', status: 'available' },
//     { id: 23, seatNumber: 'C7', status: 'maintenance' },
//     { id: 24, seatNumber: 'C8', status: 'available' },
//
//     // Row 4 - D1 to D8
//     { id: 25, seatNumber: 'D1', status: 'available' },
//     { id: 26, seatNumber: 'D2', status: 'occupied' },
//     { id: 27, seatNumber: 'D3', status: 'available' },
//     { id: 28, seatNumber: 'D4', status: 'available' },
//     { id: 29, seatNumber: 'D5', status: 'occupied' },
//     { id: 30, seatNumber: 'D6', status: 'available' },
//     { id: 31, seatNumber: 'D7', status: 'available' },
//     { id: 32, seatNumber: 'D8', status: 'available' }
// ];

// DOM Elements
const seatGrid = document.getElementById('seatGrid');
const availableCount = document.getElementById('availableCount');
const occupiedCount = document.getElementById('occupiedCount');
const selectedCount = document.getElementById('selectedCount');
const totalSeatsBadge = document.getElementById('totalSeatsBadge');
const selectedSeatDisplay = document.getElementById('selectedSeatDisplay');
const selectedSeatPreview = document.getElementById('selectedSeatPreview');
const selectedSeatNumber = document.getElementById('selectedSeatNumber');
const reserveBtn = document.getElementById('reserveBtn');

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
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Fetch seats from backend or use hardcoded data
async function fetchSeats() {
    try {
        // Try to fetch from backend first
        const response = await fetch(`${API_BASE_URL}/seats`, {
            // Short timeout to fail fast if backend is not running
            signal: AbortSignal.timeout(1000)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        seatsData = data;
        renderSeats(data);
        updateStats(data);
        showToast('✅ Connected to backend!', 'success');
        return data;
    } catch (error) {
        console.log('Backend not available, using hardcoded data:', error.message);
        // Use hardcoded data
        seatsData = HARDCODED_SEATS;
        renderSeats(seatsData);
        updateStats(seatsData);
        showToast('📚 Using demo data (backend not available)', 'info');
        return seatsData;
    }
}

// Render seats
function renderSeats(seats) {
    if (!seats || seats.length === 0) {
        seatGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #63738e;">
                        <div style="font-size: 2.5rem; margin-bottom: 12px;">
                            <i class="fas fa-chair"></i>
                        </div>
                        <p style="font-size: 0.95rem;">No seats available. Please add seats to the system.</p>
                    </div>
                `;
        return;
    }

    // Filter seats if search is active
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredSeats = seats.filter(seat =>
        seat.seatNumber.toLowerCase().includes(searchTerm)
    );

    if (filteredSeats.length === 0 && searchTerm) {
        seatGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #63738e;">
                        <div style="font-size: 2rem; margin-bottom: 12px;">
                            <i class="fas fa-search"></i>
                        </div>
                        <p style="font-size: 0.95rem;">No seats found matching "${searchTerm}"</p>
                    </div>
                `;
        return;
    }

    seatGrid.innerHTML = filteredSeats.map(seat => {
        const isSelected = selectedSeatId === seat.id;
        const statusClass = isSelected ? 'selected' : seat.status;

        return `
                    <div class="seat ${statusClass}" 
                         data-id="${seat.id}"
                         onclick="handleSeatClick(${seat.id})"
                         title="Seat ${seat.seatNumber} - ${seat.status.toUpperCase()}">
                        <div class="seat-icon">${getSeatIcon(seat.status)}</div>
                        <div class="seat-number">${seat.seatNumber}</div>
                        ${seat.status === 'occupied' ? '<div class="badge">occupied</div>' : ''}
                    </div>
                `;
    }).join('');
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

    const available = seats.filter(s => s.status === 'available').length;
    const occupied = seats.filter(s => s.status === 'occupied').length;
    const selected = seats.filter(s => s.status === 'selected' || selectedSeatId === s.id).length;

    availableCount.textContent = available;
    occupiedCount.textContent = occupied;
    selectedCount.textContent = selected;
    totalSeatsBadge.textContent = `${seats.length} seats`;
}

// Filter seats
function filterSeats() {
    renderSeats(seatsData);
}

// Handle seat click
function handleSeatClick(seatId) {
    const seat = seatsData.find(s => s.id === seatId);
    if (!seat) return;

    // Prevent selecting occupied or maintenance seats
    if (seat.status === 'occupied' || seat.status === 'maintenance') {
        showToast(`Seat ${seat.seatNumber} is ${seat.status}. Cannot select it.`, 'error');
        return;
    }

    // If clicking the already selected seat, deselect it
    if (selectedSeatId === seatId) {
        clearSelection();
        return;
    }

    // Clear previous selection
    if (selectedSeatId !== null) {
        const prevSelected = seatsData.find(s => s.id === selectedSeatId);
        if (prevSelected) {
            prevSelected.status = 'available';
        }
    }

    // Select new seat
    selectedSeatId = seatId;
    seat.status = 'selected';

    // Update UI
    renderSeats(seatsData);
    updateStats(seatsData);

    selectedSeatDisplay.textContent = `Seat ${seat.seatNumber}`;
    selectedSeatPreview.style.display = 'flex';
    selectedSeatNumber.textContent = `Seat ${seat.seatNumber}`;
    reserveBtn.disabled = false;

    showToast(`Seat ${seat.seatNumber} selected! Click Reserve to confirm.`, 'info');
}

// Clear selection
function clearSelection() {
    if (selectedSeatId !== null) {
        const seat = seatsData.find(s => s.id === selectedSeatId);
        if (seat) {
            seat.status = 'available';
        }
        selectedSeatId = null;
        renderSeats(seatsData);
        updateStats(seatsData);
        selectedSeatDisplay.textContent = 'None';
        selectedSeatPreview.style.display = 'none';
        reserveBtn.disabled = true;
    }
}

// Reserve seat
async function reserveSeat() {
    if (selectedSeatId === null) {
        showToast('Please select a seat first!', 'error');
        return;
    }

    const seat = seatsData.find(s => s.id === selectedSeatId);
    if (!seat) return;

    if (seat.status === 'occupied' || seat.status === 'maintenance') {
        showToast(`Seat ${seat.seatNumber} is no longer available.`, 'error');
        clearSelection();
        refreshSeats();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/seats/${selectedSeatId}/reserve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                seatId: selectedSeatId
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reservation failed: ${errorText}`);
        }

        const result = await response.json();
        showToast(`✅ Seat ${seat.seatNumber} reserved successfully!`, 'success');

        // Update the seat status in local data
        seat.status = 'occupied';
        selectedSeatId = null;
        renderSeats(seatsData);
        updateStats(seatsData);
        selectedSeatDisplay.textContent = 'None';
        selectedSeatPreview.style.display = 'none';
        reserveBtn.disabled = true;

    } catch (error) {
        console.error('Error reserving seat:', error);
        showToast(`❌ Failed to reserve seat: ${error.message}`, 'error');
        // If backend fails, still update locally for demo
        if (seat) {
            seat.status = 'occupied';
            selectedSeatId = null;
            renderSeats(seatsData);
            updateStats(seatsData);
            selectedSeatDisplay.textContent = 'None';
            selectedSeatPreview.style.display = 'none';
            reserveBtn.disabled = true;
            showToast('ℹ️ Seat updated locally (demo mode)', 'info');
        }
    }
}

// Refresh seats
async function refreshSeats() {
    showToast('🔄 Refreshing seat data...', 'info');
    clearSelection();
    await fetchSeats();
    if (seatsData === HARDCODED_SEATS) {
        showToast('📚 Using demo data', 'info');
    } else {
        showToast('✅ Seats updated!', 'success');
    }
}

// Initialize
async function init() {
    await fetchSeats();

    // Auto-refresh every 30 seconds (only if connected to backend)
    setInterval(async () => {
        // Only auto-refresh if we're not using hardcoded data
        if (seatsData !== HARDCODED_SEATS) {
            if (selectedSeatId === null) {
                await fetchSeats();
            } else {
                // If user has a selection, just update without clearing selection
                try {
                    const response = await fetch(`${API_BASE_URL}/seats`, {
                        signal: AbortSignal.timeout(2000)
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const selected = data.find(s => s.id === selectedSeatId);
                        if (selected && selected.status === 'available') {
                            selected.status = 'selected';
                        } else if (!selected || selected.status === 'occupied') {
                            showToast(`Seat ${selectedSeatId} is no longer available`, 'error');
                            clearSelection();
                        }
                        seatsData = data;
                        renderSeats(seatsData);
                        updateStats(seatsData);
                    }
                } catch (error) {
                    console.error('Auto-refresh failed:', error);
                }
            }
        }
    }, 30000);
}

// Start the app
init();

console.log('📚 Library Seat Reservation System');
console.log(`📍 Backend API: ${API_BASE_URL}`);
console.log('👤 User ID:', userId);
console.log('💡 Using hardcoded demo data if backend is not available');