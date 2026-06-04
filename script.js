// ================= BANCO DE DADOS INICIAL MOCKADO =================
const defaultSpaces = [
    {
        id: 1,
        title: "Sala de Reuniões Executiva",
        category: "Laboral",
        capacity: 8,
        price: 80.00,
        type: "hora",
        location: "Centro",
        ownerEmail: "owner@test.com"
    },
    {
        id: 2,
        title: "Galpão Industrial",
        category: "Armazenamento",
        capacity: 50,
        price: 300.00,
        type: "diária",
        location: "Distrito Industrial",
        ownerEmail: "owner@test.com"
    },
    {
        id: 3,
        title: "Salão de Festas com Piscina",
        category: "Eventos",
        capacity: 100,
        price: 800.00,
        type: "diária",
        location: "Zona Sul",
        ownerEmail: "owner@test.com"
    },
    {
        id: 4,
        title: "Quarto Aconchegante",
        category: "Residencial",
        capacity: 2,
        price: 150.00,
        type: "diária",
        location: "Boa Viagem",
        ownerEmail: "owner@test.com"
    }
];

const defaultUsers = [
    {
        name: "Lucas Cliente",
        email: "client@test.com",
        password: "123456",
        role: "cliente"
    },
    {
        name: "Mariana Proprietária",
        email: "owner@test.com",
        password: "123456",
        role: "proprietario"
    }
];

// ================= GESTÃO DE ESTADO (LOCALSTORAGE) =================
function getSpaces() {
    if (!localStorage.getItem('spacematch_spaces')) {
        localStorage.setItem('spacematch_spaces', JSON.stringify(defaultSpaces));
    }
    return JSON.parse(localStorage.getItem('spacematch_spaces'));
}

function saveSpaces(spaces) {
    localStorage.setItem('spacematch_spaces', JSON.stringify(spaces));
}

function getUsers() {
    if (!localStorage.getItem('spacematch_users')) {
        localStorage.setItem('spacematch_users', JSON.stringify(defaultUsers));
    }
    return JSON.parse(localStorage.getItem('spacematch_users'));
}

function saveUsers(users) {
    localStorage.setItem('spacematch_users', JSON.stringify(users));
}

function getBookings() {
    if (!localStorage.getItem('spacematch_bookings')) {
        localStorage.setItem('spacematch_bookings', JSON.stringify([]));
    }
    return JSON.parse(localStorage.getItem('spacematch_bookings'));
}

function saveBookings(bookings) {
    localStorage.setItem('spacematch_bookings', JSON.stringify(bookings));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('spacematch_current_user')) || null;
}

function setCurrentUser(user) {
    localStorage.setItem('spacematch_current_user', JSON.stringify(user));
}

// ================= TOAST NOTIFICATIONS SYSTEM =================
const SwalToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
});

function showToast(message, type = 'info') {
    SwalToast.fire({ icon: type, title: message });
}

// ================= MODAL CONTROLLERS =================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Fechar modais ao clicar fora do conteúdo
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// ================= RENDERIZAR ANÚNCIOS (GRID PRINCIPAL) =================
function renderSpaces(spaces) {
    const grid = document.getElementById('spacesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (spaces.length === 0) {
        grid.innerHTML = `
            <div class="empty-message" style="grid-column: 1/-1; padding: 4rem 1rem;">
                <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                    Nenhum espaço encontrado com estes critérios.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">
                    Tente alterar os termos da busca ou selecionar outra categoria.
                </p>
            </div>
        `;
        return;
    }

    spaces.forEach(space => {
        const card = document.createElement('div');
        card.className = 'space-card';
        card.innerHTML = `
            <span class="space-tag">${space.category}</span>
            <h3>${space.title}</h3>
            <ul class="space-details-list">
                <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span><strong>Local:</strong> ${space.location}</span>
                </li>
                <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span><strong>Capacidade:</strong> Até ${space.capacity} pessoas</span>
                </li>
            </ul>
            <p class="space-price">R$ ${space.price.toFixed(2)} <span>/ ${space.type}</span></p>
            <button class="btn-login btn-request-booking" data-id="${space.id}" style="width: 100%; margin-top: 1.25rem;">Solicitar Reserva</button>
        `;
        grid.appendChild(card);
    });

    // Event listeners para os botões de reserva gerados dinamicamente
    const bookingButtons = grid.querySelectorAll('.btn-request-booking');
    bookingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const spaceId = parseInt(btn.getAttribute('data-id'));
            handleRequestBookingClick(spaceId);
        });
    });
}

// ================= FILTROS DE BUSCA =================
function filterSpaces() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const categoryTerm = document.getElementById('categoryFilter').value;
    const allSpaces = getSpaces();

    const filtered = allSpaces.filter(space => {
        const matchCategory = categoryTerm === "Todos" || space.category === categoryTerm;
        const matchSearch = space.title.toLowerCase().includes(searchTerm) ||
                            space.location.toLowerCase().includes(searchTerm);
        return matchCategory && matchSearch;
    });

    renderSpaces(filtered);
}

// ================= FLUXO DE AUTENTICAÇÃO =================
function updateNavbar() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    const user = getCurrentUser();

    if (user) {
        navLinks.innerHTML = `
            <span class="user-welcome-nav">Olá, <strong>${user.name}</strong></span>
            <button class="btn-nav-outline" id="btnDashboardTrigger">Painel</button>
            <button class="btn-logout" id="btnLogout">Sair</button>
        `;

        document.getElementById('btnDashboardTrigger').addEventListener('click', () => openDashboard());
        document.getElementById('btnLogout').addEventListener('click', handleLogout);
    } else {
        navLinks.innerHTML = `
            <button class="btn-login" id="btnAuthTrigger">Entrar / Cadastrar</button>
        `;
        document.getElementById('btnAuthTrigger').addEventListener('click', () => {
            resetAuthModal();
            openModal('authModal');
        });
    }
}

function resetAuthModal() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    switchToLoginTab();
}

function switchToLoginTab() {
    document.getElementById('tabLoginBtn').classList.add('active');
    document.getElementById('tabRegisterBtn').classList.remove('active');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function switchToRegisterTab() {
    document.getElementById('tabRegisterBtn').classList.add('active');
    document.getElementById('tabLoginBtn').classList.remove('active');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        setCurrentUser(user);
        updateNavbar();
        closeModal('authModal');
        showToast(`Bem-vindo de volta, ${user.name}!`, 'success');

        // Se havia uma reserva em andamento na memória, abre a reserva novamente
        const pendingBookingSpaceId = sessionStorage.getItem('pending_booking_id');
        if (pendingBookingSpaceId) {
            sessionStorage.removeItem('pending_booking_id');
            handleRequestBookingClick(parseInt(pendingBookingSpaceId));
        }
    } else {
        showToast('E-mail ou senha incorretos.', 'error');
    }
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    const role = document.querySelector('input[name="userRole"]:checked').value;

    const users = getUsers();
    const emailExists = users.some(u => u.email === email);

    if (emailExists) {
        showToast('Este endereço de e-mail já está cadastrado.', 'error');
        return;
    }

    const newUser = { name, email, password, role };
    users.push(newUser);
    saveUsers(users);

    setCurrentUser(newUser);
    updateNavbar();
    closeModal('authModal');
    showToast(`Conta criada com sucesso! Bem-vindo, ${name}!`, 'success');

    // Se havia reserva em andamento
    const pendingBookingSpaceId = sessionStorage.getItem('pending_booking_id');
    if (pendingBookingSpaceId) {
        sessionStorage.removeItem('pending_booking_id');
        handleRequestBookingClick(parseInt(pendingBookingSpaceId));
    }
}

function handleLogout() {
    const user = getCurrentUser();
    setCurrentUser(null);
    updateNavbar();
    showToast(`Até logo, ${user ? user.name : 'usuário'}!`, 'info');
    renderSpaces(getSpaces());
}

// ================= SISTEMA DE RESERVAS =================
function handleRequestBookingClick(spaceId) {
    const user = getCurrentUser();

    if (!user) {
        sessionStorage.setItem('pending_booking_id', spaceId);
        showToast('Por favor, acesse sua conta ou cadastre-se para reservar.', 'warning');
        resetAuthModal();
        openModal('authModal');
        return;
    }

    const spaces = getSpaces();
    const space = spaces.find(s => s.id === spaceId);

    if (!space) {
        showToast('Espaço não encontrado.', 'error');
        return;
    }

    // Preenche o modal de reserva
    document.getElementById('bookingSpaceId').value = space.id;
    document.getElementById('bookingSpaceTitle').textContent = `Solicitar Reserva: ${space.title}`;
    document.getElementById('bookingSpaceDetails').innerHTML = `
        <p><strong>Categoria:</strong> ${space.category}</p>
        <p><strong>Local:</strong> ${space.location}</p>
        <p><strong>Capacidade:</strong> Até ${space.capacity} pessoas</p>
        <p><strong>Preço:</strong> R$ ${space.price.toFixed(2)} por ${space.type}</p>
    `;

    const labelDuration = document.getElementById('labelDuration');
    const inputDuration = document.getElementById('bookingDuration');

    if (space.type === 'hora') {
        labelDuration.textContent = 'Duração (em horas)';
        inputDuration.placeholder = 'Ex: 4';
    } else {
        labelDuration.textContent = 'Duração (em dias)';
        inputDuration.placeholder = 'Ex: 2';
    }

    // Limpa inputs
    document.getElementById('bookingDate').value = '';
    inputDuration.value = '';
    document.getElementById('bookingTotalPrice').textContent = 'R$ 0,00';

    // Configura data mínima para hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);

    // Salva o preço e tipo no dataset do input para cálculo
    inputDuration.dataset.price = space.price;

    openModal('bookingModal');
}

function calculateBookingPrice() {
    const durationInput = document.getElementById('bookingDuration');
    const price = parseFloat(durationInput.dataset.price || 0);
    const duration = parseInt(durationInput.value || 0);
    const total = price * duration;

    document.getElementById('bookingTotalPrice').textContent = `R$ ${total.toFixed(2)}`;
}

function handleBookingSubmit(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
        showToast('Sessão expirada. Faça login novamente.', 'error');
        closeModal('bookingModal');
        return;
    }

    const spaceId = parseInt(document.getElementById('bookingSpaceId').value);
    const bookingDate = document.getElementById('bookingDate').value;
    const duration = parseInt(document.getElementById('bookingDuration').value);

    const spaces = getSpaces();
    const space = spaces.find(s => s.id === spaceId);

    if (!space) {
        showToast('Erro ao processar reserva: Espaço não existe.', 'error');
        return;
    }

    const totalPrice = space.price * duration;
    const bookings = getBookings();

    const newBooking = {
        id: Date.now(),
        spaceId: space.id,
        spaceTitle: space.title,
        spaceLocation: space.location,
        spaceType: space.type,
        spacePrice: space.price,
        date: bookingDate,
        duration: duration,
        totalPrice: totalPrice,
        userEmail: user.email,
        userName: user.name,
        ownerEmail: space.ownerEmail || 'system',
        status: 'Pendente'
    };

    bookings.push(newBooking);
    saveBookings(bookings);

    closeModal('bookingModal');
    showToast('Sua solicitação de reserva foi enviada com sucesso!', 'success');
}

// ================= PAINEL DE CONTROLE (DASHBOARD) =================
function openDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('dashboardWelcome').innerHTML = `
        Olá, <strong>${user.name}</strong>! Logado como <strong>${user.role === 'proprietario' ? 'Proprietário' : 'Cliente'}</strong>.
    `;

    const hostSpacesTabBtn = document.getElementById('hostSpacesTabBtn');
    const hostBookingsTabBtn = document.getElementById('hostBookingsTabBtn');

    if (user.role === 'proprietario') {
        hostSpacesTabBtn.classList.remove('hidden');
        hostBookingsTabBtn.classList.remove('hidden');
    } else {
        hostSpacesTabBtn.classList.add('hidden');
        hostBookingsTabBtn.classList.add('hidden');
        switchDashboardTab('myBookingsTab');
    }

    renderDashboardData();
    openModal('dashboardModal');
}

function switchDashboardTab(targetTabId) {
    const tabs = document.querySelectorAll('.dashboard-tab-content');
    const tabButtons = document.querySelectorAll('.dash-tab-btn');

    tabs.forEach(tab => {
        if (tab.id === targetTabId) {
            tab.classList.remove('hidden');
        } else {
            tab.classList.add('hidden');
        }
    });

    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === targetTabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function renderDashboardData() {
    const user = getCurrentUser();
    if (!user) return;

    const bookings = getBookings();
    const spaces = getSpaces();

    // 1. Minhas Reservas
    const myBookingsList = document.getElementById('myBookingsList');
    const myBookings = bookings.filter(b => b.userEmail === user.email);

    myBookingsList.innerHTML = '';
    if (myBookings.length === 0) {
        myBookingsList.innerHTML = '<p class="empty-message">Você ainda não solicitou nenhuma reserva.</p>';
    } else {
        myBookings.sort((a, b) => b.id - a.id).forEach(b => {
            const item = document.createElement('div');
            item.className = 'dash-item';

            let actionBtn = '';
            if (b.status === 'Pendente' || b.status === 'Confirmado') {
                actionBtn = `<button class="btn-danger" onclick="cancelBooking(${b.id})">Cancelar</button>`;
            }

            item.innerHTML = `
                <div class="dash-item-info">
                    <h4>${b.spaceTitle}</h4>
                    <div class="dash-item-meta">
                        <span>📅 <strong>Data:</strong> ${formatDate(b.date)}</span>
                        <span>⏱️ <strong>Duração:</strong> ${b.duration} ${b.spaceType === 'hora' ? 'h' : 'dia(s)'}</span>
                        <span>💵 <strong>Total:</strong> R$ ${b.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div class="dash-actions" style="align-items: center; display: flex; gap: 15px;">
                    <span class="dash-status status-${b.status.toLowerCase()}">${b.status}</span>
                    ${actionBtn}
                </div>
            `;
            myBookingsList.appendChild(item);
        });
    }

    // Se for Proprietário
    if (user.role === 'proprietario') {
        // 2. Meus Espaços
        const mySpacesList = document.getElementById('mySpacesList');
        const mySpaces = spaces.filter(s => s.ownerEmail === user.email);

        mySpacesList.innerHTML = '';
        if (mySpaces.length === 0) {
            mySpacesList.innerHTML = '<p class="empty-message">Você não possui espaços cadastrados.</p>';
        } else {
            mySpaces.forEach(s => {
                const item = document.createElement('div');
                item.className = 'dash-item';
                item.innerHTML = `
                    <div class="dash-item-info">
                        <h4>${s.title}</h4>
                        <div class="dash-item-meta">
                            <span>🏷️ <strong>Categoria:</strong> ${s.category}</span>
                            <span>📍 <strong>Local:</strong> ${s.location}</span>
                            <span>👥 <strong>Capacidade:</strong> ${s.capacity} pessoas</span>
                            <span>💵 <strong>Preço:</strong> R$ ${s.price.toFixed(2)} / ${s.type}</span>
                        </div>
                    </div>
                    <div class="dash-actions">
                        <button class="btn-danger" onclick="deleteSpace(${s.id})">Excluir Espaço</button>
                    </div>
                `;
                mySpacesList.appendChild(item);
            });
        }

        // 3. Reservas Recebidas
        const incomingBookingsList = document.getElementById('incomingBookingsList');
        const incomingBookings = bookings.filter(b => b.ownerEmail === user.email);

        incomingBookingsList.innerHTML = '';
        if (incomingBookings.length === 0) {
            incomingBookingsList.innerHTML = '<p class="empty-message">Nenhuma solicitação de reserva para seus espaços.</p>';
        } else {
            incomingBookings.sort((a, b) => b.id - a.id).forEach(b => {
                const item = document.createElement('div');
                item.className = 'dash-item';

                let actionButtons = '';
                if (b.status === 'Pendente') {
                    actionButtons = `
                        <button class="btn-success" onclick="updateBookingStatus(${b.id}, 'Confirmado')">Aceitar</button>
                        <button class="btn-danger" onclick="updateBookingStatus(${b.id}, 'Cancelado')">Recusar</button>
                    `;
                }

                item.innerHTML = `
                    <div class="dash-item-info">
                        <h4>${b.spaceTitle}</h4>
                        <div class="dash-item-meta">
                            <span>👤 <strong>Cliente:</strong> ${b.userName} (${b.userEmail})</span>
                            <span>📅 <strong>Data:</strong> ${formatDate(b.date)}</span>
                            <span>⏱️ <strong>Duração:</strong> ${b.duration} ${b.spaceType === 'hora' ? 'h' : 'dia(s)'}</span>
                            <span>💵 <strong>Valor:</strong> R$ ${b.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="dash-actions" style="align-items: center; display: flex; gap: 10px;">
                        <span class="dash-status status-${b.status.toLowerCase()}">${b.status}</span>
                        ${actionButtons}
                    </div>
                `;
                incomingBookingsList.appendChild(item);
            });
        }
    }
}

// ================= AÇÕES DO DASHBOARD =================
window.cancelBooking = async function(bookingId) {
    const result = await Swal.fire({
        title: 'Cancelar Reserva?',
        text: 'Deseja realmente cancelar esta solicitação de reserva?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Não',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#6c757d',
    });

    if (!result.isConfirmed) return;

    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index !== -1) {
        bookings[index].status = 'Cancelado';
        saveBookings(bookings);
        showToast('Reserva cancelada com sucesso.', 'info');
        renderDashboardData();
    }
};

window.updateBookingStatus = function(bookingId, newStatus) {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index !== -1) {
        bookings[index].status = newStatus;
        saveBookings(bookings);
        showToast(`Reserva ${newStatus === 'Confirmado' ? 'aceita' : 'recusada'} com sucesso!`, newStatus === 'Confirmado' ? 'success' : 'info');
        renderDashboardData();
    }
};

window.deleteSpace = async function(spaceId) {
    const result = await Swal.fire({
        title: 'Excluir Espaço?',
        text: 'Excluir este espaço impedirá novas reservas. Esta ação não pode ser desfeita.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#6c757d',
    });

    if (!result.isConfirmed) return;

    const spaces = getSpaces();
    const updated = spaces.filter(s => s.id !== spaceId);
    saveSpaces(updated);

    showToast('Espaço excluído com sucesso.', 'success');
    renderDashboardData();
    renderSpaces(updated);
};

// ================= CADASTRO DE NOVO ESPAÇO =================
function handleNewSpaceSubmit(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user || user.role !== 'proprietario') {
        showToast('Apenas proprietários podem cadastrar espaços.', 'error');
        closeModal('newSpaceModal');
        return;
    }

    const title = document.getElementById('spaceTitle').value.trim();
    const category = document.getElementById('spaceCategory').value;
    const location = document.getElementById('spaceLocation').value.trim();
    const capacity = parseInt(document.getElementById('spaceCapacity').value);
    const price = parseFloat(document.getElementById('spacePrice').value);
    const type = document.querySelector('input[name="spaceType"]:checked').value;

    const validCategories = ["Laboral", "Residencial", "Armazenamento", "Eventos"];
    if (!validCategories.includes(category)) {
        showToast('Categoria de espaço inválida.', 'error');
        return;
    }

    const spaces = getSpaces();

    const newSpace = {
        id: Date.now(),
        title,
        category,
        location,
        capacity,
        price,
        type,
        ownerEmail: user.email
    };

    spaces.push(newSpace);
    saveSpaces(spaces);

    document.getElementById('newSpaceForm').reset();
    closeModal('newSpaceModal');

    showToast(`Espaço "${title}" cadastrado com sucesso!`, 'success');

    renderDashboardData();
    renderSpaces(getSpaces());
}

// ================= AUXILIARES =================
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// ================= INICIALIZAÇÃO E EVENT LISTENERS =================
window.onload = () => {
    const spaces = getSpaces();
    getUsers();
    renderSpaces(spaces);
    updateNavbar();

    // Logo reseta a busca
    const logoBtn = document.getElementById('logoBtn');
    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = 'Todos';
            renderSpaces(getSpaces());
        });
    }

    // Fechar Modais nos botões de fechar (x)
    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });

    // Abas do Modal de Autenticação
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    if (tabLoginBtn) tabLoginBtn.addEventListener('click', switchToLoginTab);
    if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', switchToRegisterTab);

    // Submissão dos Formulários de Autenticação
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
    if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);

    // Formulário de Reserva e cálculo em tempo real
    const bookingForm = document.getElementById('bookingForm');
    const durationInput = document.getElementById('bookingDuration');
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);
    if (durationInput) {
        durationInput.addEventListener('input', calculateBookingPrice);
        durationInput.addEventListener('change', calculateBookingPrice);
    }

    // Abas do Painel de Controle (Dashboard)
    const dashTabBtns = document.querySelectorAll('.dash-tab-btn');
    dashTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchDashboardTab(targetTab);
        });
    });

    // Abrir modal de novo espaço a partir do painel
    const btnAddSpaceTrigger = document.getElementById('btnAddSpaceTrigger');
    if (btnAddSpaceTrigger) {
        btnAddSpaceTrigger.addEventListener('click', () => {
            document.getElementById('newSpaceForm').reset();
            openModal('newSpaceModal');
        });
    }

    // Submit de criação de novo espaço
    const newSpaceForm = document.getElementById('newSpaceForm');
    if (newSpaceForm) newSpaceForm.addEventListener('submit', handleNewSpaceSubmit);

    // Event listener de busca
    const btnSearch = document.getElementById('btnSearch');
    if (btnSearch) btnSearch.addEventListener('click', filterSpaces);

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (searchInput) searchInput.addEventListener('input', filterSpaces);
    if (categoryFilter) categoryFilter.addEventListener('change', filterSpaces);
};