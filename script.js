// 1. DADOS: Array simulando as informações que viriam de um banco de dados
const espacos = [
  {
    id: 1,
    emoji: '🏢',
    titulo: 'Sala Comercial Premium',
    cidade: 'Recife, PE',
    preco: 80,
    tipo: 'Por hora'
  },
  {
    id: 2,
    emoji: '🎉',
    titulo: 'Salão de Festas',
    cidade: 'Olinda, PE',
    preco: 600,
    tipo: 'Por diária'
  },
  {
    id: 3,
    emoji: '🎤',
    titulo: 'Auditório Corporativo',
    cidade: 'Recife, PE',
    preco: 250,
    tipo: 'Por hora'
  }
];

// 2. FUNÇÃO DE RENDERIZAÇÃO
function carregarEspacos() {
  const container = document.getElementById('lista-espacos');
  let conteudoHTML = '';

  espacos.forEach(espaco => {
    conteudoHTML += `
      <div class="card">
        <div style="font-size: 2.5rem;">${espaco.emoji}</div>
        <h3>${espaco.titulo}</h3>
        <p>📍 ${espaco.cidade}</p>
        <p style="color: var(--gold); margin-top: 10px;">
          <strong>R$ ${espaco.preco}</strong> / ${espaco.tipo}
        </p>
        <button class="btn btn-gold card-btn" onclick="solicitarReserva(${espaco.id})">Alugar</button>
      </div>
    `;
  });

  container.innerHTML = conteudoHTML;
}

// 3. FUNÇÕES DE MODAL
function abrirModal(idDoModal) {
  document.getElementById(idDoModal).classList.add('open');
}

function fecharModal(idDoModal) {
  document.getElementById(idDoModal).classList.remove('open');
}

function alternarFormAuth(modo) {
  const loginSection = document.getElementById('auth-login-section');
  const cadastroSection = document.getElementById('auth-cadastro-section');

  if (modo === 'cadastro') {
    loginSection.style.display = 'none';
    cadastroSection.style.display = 'block';
    document.getElementById('form-cadastro').reset();
  } else {
    loginSection.style.display = 'block';
    cadastroSection.style.display = 'none';
    document.getElementById('form-login').reset();
  }
}

// 4. PERSISTÊNCIA & DADOS DE USUÁRIO
function obterUsuarioLogado() {
  const userStr = localStorage.getItem('usuarioLogado');
  return userStr ? JSON.parse(userStr) : null;
}

function obterUsuariosCadastrados() {
  const usersStr = localStorage.getItem('usuarios');
  return usersStr ? JSON.parse(usersStr) : [];
}

function atualizarInterface() {
  const navAuthContainer = document.getElementById('nav-auth-container');
  const usuario = obterUsuarioLogado();

  if (usuario) {
    navAuthContainer.innerHTML = `
      <span>Olá, <strong>${usuario.nome}</strong></span>
      <button class="btn btn-outline" onclick="abrirMinhasReservas()">Minhas Reservas</button>
      <button class="btn btn-outline" onclick="fazerLogout()">Sair</button>
    `;
  } else {
    navAuthContainer.innerHTML = `
      <button class="btn btn-gold" onclick="abrirModal('authModal')">Entrar</button>
    `;
  }
}

// 5. CADASTRO, LOGIN E LOGOUT
function processarCadastro() {
  const nome = document.getElementById('cadastro-nome').value.trim();
  const email = document.getElementById('cadastro-email').value.trim().toLowerCase();
  const senha = document.getElementById('cadastro-senha').value;
  const confirmarSenha = document.getElementById('cadastro-confirmar-senha').value;

  if (!nome || !email || !senha || !confirmarSenha) {
    exibirToast('Por favor, preencha todos os campos!', 'error');
    return;
  }

  if (senha.length < 6) {
    exibirToast('A senha precisa ter pelo menos 6 caracteres!', 'error');
    return;
  }

  if (senha !== confirmarSenha) {
    exibirToast('As senhas não coincidem!', 'error');
    return;
  }

  const usuarios = obterUsuariosCadastrados();
  const usuarioExiste = usuarios.find(u => u.email === email);
  if (usuarioExiste) {
    exibirToast('Este email já está cadastrado!', 'error');
    return;
  }

  usuarios.push({ nome, email, senha });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  exibirToast('Cadastro realizado com sucesso! Faça login.', 'success');
  alternarFormAuth('login');
  document.getElementById('login-email').value = email;
}

function processarLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;

  if (!email || !senha) {
    exibirToast('Por favor, preencha todos os campos!', 'error');
    return;
  }

  const usuarios = obterUsuariosCadastrados();
  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    exibirToast('Email ou senha incorretos!', 'error');
    return;
  }

  localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  exibirToast(`Bem-vindo, ${usuario.nome}!`, 'success');
  fecharModal('authModal');
  atualizarInterface();
}

function fazerLogout() {
  localStorage.removeItem('usuarioLogado');
  exibirToast('Você saiu da sua conta.', 'success');
  atualizarInterface();
}

// 6. ALUGUEL / RESERVAS
function solicitarReserva(idEspaco) {
  const usuario = obterUsuarioLogado();

  if (!usuario) {
    exibirToast('Você precisa fazer login para alugar uma sala!', 'error');
    alternarFormAuth('login');
    abrirModal('authModal');
    return;
  }

  const espaco = espacos.find(e => e.id === idEspaco);
  if (!espaco) return;

  document.getElementById('reserva-espaco-id').value = idEspaco;
  document.getElementById('reserva-espaco-info').innerHTML = `
    <div style="font-size: 1.5rem; margin-bottom: 5px;">${espaco.emoji} <strong>${espaco.titulo}</strong></div>
    <div style="color: var(--gold); font-weight: 600;">R$ ${espaco.preco} / ${espaco.tipo}</div>
    <div style="font-size: 0.85rem; margin-top: 5px; color: var(--text-muted);">Localização: ${espaco.cidade}</div>
  `;

  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('reserva-data').setAttribute('min', hoje);
  document.getElementById('reserva-data').value = hoje;

  abrirModal('reservaModal');
}

function processarReserva() {
  const idEspaco = parseInt(document.getElementById('reserva-espaco-id').value);
  const data = document.getElementById('reserva-data').value;
  const periodo = document.getElementById('reserva-periodo').value.trim();

  if (!data) {
    exibirToast('Por favor, informe a data da reserva.', 'error');
    return;
  }

  const espaco = espacos.find(e => e.id === idEspaco);
  if (!espaco) return;

  const usuario = obterUsuarioLogado();
  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');

  const novaReserva = {
    id: Date.now(),
    usuarioEmail: usuario.email,
    idEspaco: idEspaco,
    tituloEspaco: espaco.titulo,
    data: data,
    periodo: periodo || 'Período padrão',
    dataCriacao: new Date().toISOString()
  };

  reservas.push(novaReserva);
  localStorage.setItem('reservas', JSON.stringify(reservas));

  const dataFormatada = data.split('-').reverse().join('/');
  exibirToast(`Reserva do "${espaco.titulo}" efetuada com sucesso para ${dataFormatada}!`, 'success');

  fecharModal('reservaModal');
  document.getElementById('form-reserva').reset();
}

function abrirMinhasReservas() {
  const usuario = obterUsuarioLogado();
  if (!usuario) {
    exibirToast('Você precisa fazer login para ver suas reservas!', 'error');
    abrirModal('authModal');
    return;
  }

  atualizarListaReservas();
  abrirModal('minhasReservasModal');
}

function atualizarListaReservas() {
  const usuario = obterUsuarioLogado();
  if (!usuario) return;

  const container = document.getElementById('lista-reservas-usuario');
  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const minhasReservas = reservas.filter(r => r.usuarioEmail === usuario.email);

  if (minhasReservas.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; color: var(--text-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 10px;">📅</p>
        <p>Você ainda não alugou nenhuma sala.</p>
      </div>
    `;
    return;
  }

  let html = '';
  minhasReservas.sort((a, b) => b.id - a.id);

  minhasReservas.forEach(reserva => {
    const espaco = espacos.find(e => e.id === reserva.idEspaco);
    const emoji = espaco ? espaco.emoji : '🏢';
    const dataFormatada = reserva.data.split('-').reverse().join('/');

    html += `
      <div class="reserva-item">
        <div class="reserva-item-info">
          <h4>${emoji} ${reserva.tituloEspaco}</h4>
          <p>📅 Data: <strong>${dataFormatada}</strong></p>
          <p>⏱️ Período: <strong>${reserva.periodo}</strong></p>
          <span>R$ ${espaco ? espaco.preco : 0} / ${espaco ? espaco.tipo : ''}</span>
        </div>
        <button class="btn-cancelar" onclick="cancelarReserva(${reserva.id})">Cancelar</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

function cancelarReserva(idReserva) {
  const reservas = JSON.parse(localStorage.getItem('reservas') || '[]');
  const reserva = reservas.find(r => r.id === idReserva);
  if (!reserva) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  `;
  overlay.innerHTML = `
    <div style="background: var(--bg-card, #1e1e2e); border: 1px solid var(--gold, #c9a84c);
                border-radius: 12px; padding: 28px 32px; max-width: 340px; text-align: center;">
      <p style="margin-bottom: 20px; font-size: 1rem;">Deseja realmente cancelar esta reserva?</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="confirmar-cancelar" style="padding: 8px 20px; background: #c0392b; color: #fff;
          border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">Sim, cancelar</button>
        <button id="desistir-cancelar" style="padding: 8px 20px; background: transparent;
          border: 1px solid var(--gold, #c9a84c); color: var(--gold, #c9a84c);
          border-radius: 8px; cursor: pointer; font-size: 0.9rem;">Não</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('confirmar-cancelar').addEventListener('click', () => {
    const novaLista = reservas.filter(r => r.id !== idReserva);
    localStorage.setItem('reservas', JSON.stringify(novaLista));
    exibirToast('Reserva cancelada com sucesso.', 'success');
    atualizarListaReservas();
    overlay.remove();
  });

  document.getElementById('desistir-cancelar').addEventListener('click', () => {
    overlay.remove();
  });
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const eyeOpen = button.querySelector('.eye-open');
  const eyeClosed = button.querySelector('.eye-closed');

  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
  } else {
    input.type = 'password';
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
  }
}

// 7. NOTIFICAÇÕES (Toast)
function exibirToast(mensagem, tipo = 'success') {
  const container = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <span>${mensagem}</span>
    <button style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; line-height: 1;" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// 8. INICIALIZAÇÃO
carregarEspacos();
atualizarInterface();