// auth.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const loginBtn = document.getElementById('loginBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validate
        if (!email || !password) {
            showError('Please enter both email and password.');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        loadingSpinner.style.display = 'block';
        hideError();

        // Call login API
        loginUser(email, password);
    });

    function loginUser(email, password) {
        const API_URL = 'http://localhost:8080';
        localStorage.setItem('userEmail', email);
        fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Invalid email or password');
                }
                return response.json();
            })
            .then(data => {
                console.log('📋 Full response:', JSON.stringify(data, null, 2));
                console.log('📋 Keys in response:', Object.keys(data));
                console.log('📋 userId value:', data.userId);
                console.log('📋 typeof userId:', typeof data.userId);
                if (data.token) {
                    // Save token
                    localStorage.setItem('jwtToken', data.token);
                    console.log('Login successful!');
                    // Redirect to dashboard

                } else {
                    throw new Error('No token received');
                }
                if(data.role){
                    localStorage.setItem('role', data.role);
                    console.log('Role update successful');
                }else {
                    throw new Error('No role received');
                }
                if(data.userId){
                    localStorage.setItem('userId', data.userId);
                    console.log('Id update successful');
                }else {
                    throw new Error('No id received');
                }
                window.location.href = '/dashboard';
            })
            .catch(error => {
                console.error('Login error:', error);
                showError(error.message || 'Invalid email or password');
            })
            .finally(() => {
                // Reset button state
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                loadingSpinner.style.display = 'none';
            });
    }

    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

});