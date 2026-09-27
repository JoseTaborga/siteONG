/* ============================================================
   INSTITUTO LUZ NA RUA — Scripts de interação e validação
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     0. TOAST — notificações flutuantes
     ========================================================== */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function exibirToast(mensagem, tipo = 'info', duracao = 4000) {
    if (!toastEl) return;

    if (toastTimer) clearTimeout(toastTimer);

    toastEl.textContent = mensagem;
    toastEl.className = 'toast';
    if (tipo !== 'info') toastEl.classList.add(`toast--${tipo}`);

    toastEl.hidden = false;
    requestAnimationFrame(() => {
      toastEl.classList.add('visivel');
    });

    toastTimer = setTimeout(() => {
      toastEl.classList.remove('visivel');
      setTimeout(() => { toastEl.hidden = true; }, 300);
    }, duracao);
  }

  window.exibirToast = exibirToast;

  /* ==========================================================
     1. MENU HAMBÚRGUER (todas as páginas)
     ========================================================== */

  const menuToggle = document.querySelector('.menu-toggle');
  const menuNav    = document.getElementById('menu-principal');

  if (menuToggle && menuNav) {
    // Abre / fecha o painel do menu
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const aberto = menuNav.classList.toggle('aberto');
      menuToggle.setAttribute('aria-expanded', aberto);
    });

    // Abre / fecha o submenu "Projetos"
    document.querySelectorAll('.navegacao__botao').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const submenu = btn.nextElementSibling;
        const aberto = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', !aberto);
        if (submenu) submenu.classList.toggle('aberto', !aberto);
      });
    });

    // Fecha tudo ao clicar fora do menu
    document.addEventListener('click', (e) => {
      if (!menuNav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuNav.classList.remove('aberto');
        menuToggle.setAttribute('aria-expanded', 'false');

        document.querySelectorAll('.submenu.aberto').forEach((s) => s.classList.remove('aberto'));
        document.querySelectorAll('.navegacao__botao[aria-expanded="true"]')
          .forEach((b) => b.setAttribute('aria-expanded', 'false'));
      }
    });

    // Fecha com a tecla Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        menuNav.classList.remove('aberto');
        menuToggle.setAttribute('aria-expanded', 'false');

        document.querySelectorAll('.submenu.aberto').forEach((s) => s.classList.remove('aberto'));
        document.querySelectorAll('.navegacao__botao[aria-expanded="true"]')
          .forEach((b) => b.setAttribute('aria-expanded', 'false'));
      }
    });
  }

  /* ==========================================================
     2. MODAIS (dialog nativo — todas as páginas)
     ========================================================== */

  // Abre modal
  document.querySelectorAll('[data-abrir-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.abrirModal);
      if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
      }
    });
  });

  // Fecha modal por botão interno
  document.querySelectorAll('[data-fechar-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) dialog.close();
    });
  });

  // Fecha modal ao clicar no backdrop (fora da caixa do dialog)
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  });

  /* ==========================================================
     3. MÁSCARAS DE ENTRADA (formulário)
     ========================================================== */

  const apenasDigitos = (v) => v.replace(/\D/g, '');

  /** Aplica máscara de CPF: 000.000.000-00 */
  function mascararCPF(valor) {
    const d = apenasDigitos(valor).slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  /** Aplica máscara de telefone: (00) 00000-0000 */
  function mascararTelefone(valor) {
    const d = apenasDigitos(valor).slice(0, 11);
    if (d.length <= 2)  return d.replace(/(\d{0,2})/, '($1');
    if (d.length <= 6)  return d.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  /** Aplica máscara de CEP: 00000-000 */
  function mascararCEP(valor) {
    const d = apenasDigitos(valor).slice(0, 8);
    return d.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
  }

  /** Vincula máscara a um input */
  function aplicarMascara(input, funcao) {
    if (!input) return;
    input.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      const antes = e.target.value.length;
      e.target.value = funcao(e.target.value);
      const depois = e.target.value.length;
      e.target.setSelectionRange(pos + (depois - antes), pos + (depois - antes));
      e.target.dispatchEvent(new Event('validar', { bubbles: true }));
    });
  }

  /* ==========================================================
     4. VALIDAÇÕES LÓGICAS
     ========================================================== */

  function validarCPF(cpf) {
    const d = apenasDigitos(cpf);
    if (d.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(d)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(d[i], 10) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(d[9], 10)) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(d[i], 10) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(d[10], 10)) return false;

    return true;
  }

  function validarTelefone(tel) {
    const d = apenasDigitos(tel);
    if (d.length < 10 || d.length > 11) return false;

    const ddd = parseInt(d.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99) return false;

    const primeiro = parseInt(d[2], 10);

    if (d.length === 11) return primeiro === 9;
    if (d.length === 10) return primeiro >= 2 && primeiro <= 5;

    return false;
  }

  function validarCEP(cep) {
    const d = apenasDigitos(cep);
    return d.length === 8 && !/^0{8}$/.test(d);
  }

  /* ==========================================================
     5. FEEDBACK VISUAL DE VALIDAÇÃO
     ========================================================== */

  function exibirErro(input, elementoErro, mensagem) {
    if (elementoErro) {
      elementoErro.textContent = mensagem;
      elementoErro.hidden = false;
    }
    input.setCustomValidity(mensagem);
    input.setAttribute('aria-invalid', 'true');
  }

  function limparErro(input, elementoErro) {
    if (elementoErro) {
      elementoErro.textContent = '';
      elementoErro.hidden = true;
    }
    input.setCustomValidity('');
    input.removeAttribute('aria-invalid');
  }

  /* ==========================================================
     6. INICIALIZAÇÃO DO FORMULÁRIO (apenas em cadastro.html)
     ========================================================== */

  const form = document.getElementById('form-cadastro');
  if (!form) return;

  const campoNome       = document.getElementById('nome');
  const campoCPF        = document.getElementById('cpf');
  const campoTelefone   = document.getElementById('telefone');
  const campoCEP        = document.getElementById('cep');
  const campoLogradouro = document.getElementById('logradouro');
  const campoBairro     = document.getElementById('bairro');
  const campoCidade     = document.getElementById('cidade');
  const campoUF         = document.getElementById('uf');
  const mensagemSucesso = document.getElementById('mensagem-sucesso');
  const statusCEP       = document.getElementById('status-cep');

  // Aplica máscaras
  aplicarMascara(campoCPF, mascararCPF);
  aplicarMascara(campoTelefone, mascararTelefone);
  aplicarMascara(campoCEP, mascararCEP);

  // Validação do CPF
  campoCPF.addEventListener('validar', () => {
    const erro = document.getElementById('erro-cpf');
    if (campoCPF.value.length === 0) {
      limparErro(campoCPF, erro);
      return;
    }
    if (campoCPF.value.length < 14) {
      exibirErro(campoCPF, erro, 'CPF incompleto.');
      return;
    }
    if (!validarCPF(campoCPF.value)) {
      exibirErro(campoCPF, erro, 'CPF inválido. Verifique os números digitados.');
      return;
    }
    limparErro(campoCPF, erro);
  });

  // Validação do Telefone
  campoTelefone.addEventListener('validar', () => {
    const erro = document.getElementById('erro-telefone');
    const d = apenasDigitos(campoTelefone.value);
    if (d.length === 0) {
      limparErro(campoTelefone, erro);
      return;
    }
    if (d.length < 10) {
      exibirErro(campoTelefone, erro, 'Telefone incompleto.');
      return;
    }
    if (!validarTelefone(campoTelefone.value)) {
      exibirErro(campoTelefone, erro, 'Telefone inválido. Verifique DDD e número.');
      return;
    }
    limparErro(campoTelefone, erro);
  });

  // Validação + autocompletar CEP (ViaCEP)
  let ultimoCEPConsultado = '';
  campoCEP.addEventListener('validar', async () => {
    const erro = document.getElementById('erro-cep');
    const d = apenasDigitos(campoCEP.value);

    if (d.length === 0) {
      limparErro(campoCEP, erro);
      if (statusCEP) statusCEP.textContent = 'Preenche o endereço automaticamente.';
      return;
    }

    if (d.length < 8) {
      exibirErro(campoCEP, erro, 'CEP incompleto.');
      return;
    }

    if (!validarCEP(campoCEP.value)) {
      exibirErro(campoCEP, erro, 'CEP inválido.');
      return;
    }

    limparErro(campoCEP, erro);

    if (d === ultimoCEPConsultado) return;
    ultimoCEPConsultado = d;

    if (statusCEP) statusCEP.textContent = 'Buscando endereço...';

    try {
      const resp = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const dados = await resp.json();

      if (dados.erro) {
        exibirErro(campoCEP, erro, 'CEP não encontrado.');
        if (statusCEP) statusCEP.textContent = 'CEP não encontrado.';
        return;
      }

      if (campoLogradouro && !campoLogradouro.value) campoLogradouro.value = dados.logradouro || '';
      if (campoBairro     && !campoBairro.value)     campoBairro.value     = dados.bairro     || '';
      if (campoCidade     && !campoCidade.value)     campoCidade.value     = dados.localidade || '';
      if (campoUF         && !campoUF.value)         campoUF.value         = dados.uf         || '';

      if (statusCEP) statusCEP.textContent = 'Endereço preenchido automaticamente.';
    } catch (e) {
      if (statusCEP) statusCEP.textContent = 'Não foi possível consultar o CEP agora. Preencha manualmente.';
    }
  });

  // Validação em blur para os campos obrigatórios
  [campoNome, campoCPF, campoTelefone, campoCEP].forEach((campo) => {
    if (!campo) return;
    campo.addEventListener('blur', () => {
      if (campo.value.length > 0) {
        campo.dispatchEvent(new Event('validar', { bubbles: true }));
      }
    });
  });

  // Pré-seleção pelo parâmetro ?perfil= da URL
  const params = new URLSearchParams(window.location.search);
  const perfilURL = params.get('perfil');
  if (perfilURL) {
    const radio = form.querySelector(`input[name="perfil"][value="${perfilURL}"]`);
    if (radio) radio.checked = true;
  }

  // Submissão do formulário
  form.addEventListener('submit', (evento) => {
    [campoCPF, campoTelefone, campoCEP].forEach((c) => {
      if (c) c.dispatchEvent(new Event('validar', { bubbles: true }));
    });

    if (!form.checkValidity()) {
      evento.preventDefault();
      const primeiroInvalido = form.querySelector(':invalid');
      if (primeiroInvalido) {
        primeiroInvalido.focus();
        primeiroInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    evento.preventDefault();
    form.hidden = true;
    if (mensagemSucesso) {
      mensagemSucesso.hidden = false;
      mensagemSucesso.scrollIntoView({ behavior: 'smooth', block: 'center' });
      mensagemSucesso.focus();
    }
  });

  // Reset do formulário
  form.addEventListener('reset', () => {
    ['erro-cpf', 'erro-telefone', 'erro-cep'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.hidden = true; }
    });
    if (statusCEP) statusCEP.textContent = 'Preenche o endereço automaticamente.';
    ultimoCEPConsultado = '';
    [campoCPF, campoTelefone, campoCEP].forEach((c) => {
      if (c) { c.setCustomValidity(''); c.removeAttribute('aria-invalid'); }
    });
  });

})();