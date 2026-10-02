//import Toastifyt from 'https://cdn.jsdelivr.net/npm/toastify-js';
const toastifyScript = document.createElement('script');
toastifyScript.src = 'https://cdn.jsdelivr.net/npm/toastify-js';
document.head.append(toastifyScript);


let currentUsername = "";

  function showTab(tabId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
  }
  async function loadData() {
    try {
      let response = await fetch('/api/accounts/my');
      if (response.status === 401 || response.status === 403) {
        window.Swal.fire({
          title: 'Внимание!',
          text: 'Сессия устарела!',
          icon: 'warning',
          iconColor:"orange",
          confirmButtonText: 'ОК',
          confirmButtonColor: '#3085d6',
          background:'#d6cb3089'
        });
        window.location.href = '/login.html';
        return;
      }
      let result = await response.json();
      let mannyRes = await fetch('/api/users/my-total-manny');
      let mannyData = await mannyRes.json();
      currentUsername = mannyData.username;
      const userDisplay = document.getElementById('user-display');
      if (userDisplay) userDisplay.innerText = currentUsername.toUpperCase();
      const userDisplayGeneral = document.getElementById('user-display-page');
      if (userDisplayGeneral) userDisplayGeneral.innerText = currentUsername.toUpperCase();
      const totalManny = document.getElementById('total-manny');
      if (totalManny) totalManny.innerText = mannyData.totalManny.toFixed(2);
      const adminNavButton = document.getElementById('admin-nav');
      if (adminNavButton) {
        if (currentUsername === 'root') {
          Toastify({
            text: "Здраствуйте админестратор!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
              background: "linear-gradient(to right, green, blue)",
            }
          }).showToast();
          adminNavButton.style.display = 'block';
        } else {
          Toastify({
            text: `Здраствуйте, ${currentUsername}`,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
              background: "linear-gradient(to right, green, blue)",
            }
          }).showToast();
          adminNavButton.style.display = 'none';
        }
      }
      const tbody = document.querySelector('#table-accounts tbody');
      const selectFrom = document.getElementById('tx-from');
      const selectCredit = document.getElementById('credit-target');
      if (tbody) tbody.innerHTML = "";
      if (selectFrom) selectFrom.innerHTML = "";
      if (selectCredit) selectCredit.innerHTML = "";
      if (result.accounts && Array.isArray(result.accounts)) {
        result.accounts.forEach(acc => {
          if (tbody) {
            tbody.innerHTML += `
              <tr>
                <td>#${acc.id}</td>
                <td><b>${parseFloat(acc.manny).toFixed(2)}</b> руб.</td>
                <td>${acc.two_fa_status ? '🔒 Активна' : '❌ Выкл'}</td>
                <td>${acc.active ? '<span style="color:green">Активен</span>' : '<span style="color:red">Забанен</span>'}</td>
                <td><button class="btn btn-danger" onclick="closeAccount(${acc.id})">Закрыть</button></td>
              </tr>`;
          }
          
          if (acc.active) {
            let opt = `<option value="${acc.id}">Счет #${acc.id} (${parseFloat(acc.manny).toFixed(2)} руб.)</option>`;
            if (selectFrom) selectFrom.innerHTML += opt;
            if (selectCredit) selectCredit.innerHTML += opt;
          }
        });
      }
      let profileRes = await fetch('/api/users/profile');
      let profileData = await profileRes.json();
      const userAvatar = document.getElementById('user-avatar');
      const userAvatar2 = document.getElementById('user-avatar2');
      if (profileData.status && profileData.user && profileData.user.avatar && userAvatar) {
        userAvatar.src = profileData.user.avatar;
      }
      if (profileData.status && profileData.user && profileData.user.avatar && userAvatar2) {
        userAvatar2.src = profileData.user.avatar;
      }
      await syncProfileSectionData();
      if (document.getElementById('table-logs')) {
        await loadTransactionLogs();
      }
      document.addEventListener('keydown', function(event) {
        if(event.ctrlKey == true || event.key == "a"){
          window.location.href = "/admin.html"
        }
      });
    } catch(e) {
      console.error("Критическая ошибка выполнения скрипта страницы:", e);
      window.Swal.fire({
          title: 'Внимание!',
          text: `Ошибка кода!${e}`,
          icon: 'error',
          confirmButtonText: 'ОК',
          confirmButtonColor: '#d63030',
          background: '#d63030'
      });
    }
  }
  async function openCreateAccountModal() {
    const pin = await window.Swal.fire({title: 'Создание щёта', text: 'Введите надёжный пин-код!', icon: 'question', iconColor:"blue", input:"number", inputAttributes: { autocapitalize: "off" }, preConfirm:async(pincode)=>{return pincode}, confirmButtonText: 'ОК', confirmButtonColor: '#3085d6', background:'#ffffffaf'})
    if (!pin) return;
    const fa = await Swal.fire({title: 'Создание щёта', text: 'Включить индивидуальную 2FA-защиту транзакций для этого счета?', icon: 'question', iconColor:"blue", showCancelButton: true, confirmButtonColor: '#3085d6', cancelButtonColor: '#3085d6', confirmButtonText: 'Да, включить', cancelButtonText: 'Нет, не включать'}).then((result) => {return result;});
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ pinCode: pin.value, enableAccount2FA: fa.isConfirmed })
    });
    const data = await res.json();
    if(data.status) {
      loadData(); 
       Toastify({
          text: `Вы создали щёт! \n Проверте "Мои щета"`,
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "linear-gradient(to right, yellowgreen, green)",
          }
        }).showToast();
    } else {
       alert("Ошибка: " + data.message); 
    }
  }

  async function executeTransfer() {
    const fromId = document.getElementById('tx-from').value;
    const toId = document.getElementById('tx-to').value.trim();
    const amount = document.getElementById('tx-amount').value;
    const pinCode = document.getElementById('tx-pin').value;

    const res = await fetch('/api/accounts/transfer', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ fromId, toId, amount, pinCode })
    });
    const data = await res.json();
    if (data.status) { alert("Перевод выполнен!"); loadData(); } else { alert("Ошибка ["+data.statusCode+"]: " + data.message); }
  }

  async function applyForCredit() {
    const targetAccountId = document.getElementById('credit-target').value;
    const amount = document.getElementById('credit-amount').value;
    const paymentsCount = document.getElementById('credit-payments').value;
    const autoWithdrawal = document.getElementById('credit-auto').checked;
    const pinCode = document.getElementById('credit-pin').value;

    const res = await fetch('/api/accounts/credit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ targetAccountId, amount, paymentsCount, autoWithdrawal, pinCode })});const data = await res.json();if(data.status) { alert("Кредит одобрен! Деньги зачислены на технический счет #" + data.creditAccountId); loadData(); } else { alert("Ошибка: " + data.message); }}async function logout() {await fetch('/api/users/logout', { method: 'POST' });window.location.href = '/login.html';}window.onload = loadData;
        async function uploadAvatar() {
    const fileInput = document.getElementById('avatar-file');
    if (fileInput.files.length === 0) {
      alert("Выберите файл!");
      return;
    }

    // Так как отправляем физический файл, используем FormData вместо JSON
    const formData = new FormData();
    // ✅ ИСПРАВЛЕННЫЙ ВАРИАНТ:
formData.append('avatar', fileInput.files[0]); // Передаем конкретный файл


    const res = await fetch('/api/users/avatar', {
      method: 'POST',
      body: formData // Заголовки Content-Type multer выставит автоматически
    });
    const data = await res.json();
    
    if (data.status) {
      alert("Аватарка успешно обновлена!");
      document.getElementById('user-avatar').src = data.avatar; // Сразу меняем картинку
    } else {
      alert("Ошибка загрузки: " + data.message);
    }
  }
    let user2FaActive = false; // Глобальный триггер статуса 2FA на фронтенде

  // Синхронизация данных профиля при загрузке страницы
    // Синхронизация данных профиля при загрузке страницы
  async function syncProfileSectionData() {
    try {
      const response = await fetch('/api/users/profile');
      
      // 🔑 ЗАЩИТА: Если бэкенд вернул ошибку (не 200 OK), не пытаемся парсить JSON
      if (!response.ok) {
        console.warn("⚠️ [City-bank] Не удалось загрузить данные профиля, сервер вернул статус:", response.status);
        return;
      }
      
      const result = await response.json(); // СТРОКА 444 (теперь тут безопасно)
      
      if (result.status && result.user) {
        if (result.user.avatar) {
          document.getElementById('user-avatar').src = result.user.avatar;
        }
        
        user2FaActive = result.user.two_fa_status;
        const statusText = document.getElementById('2fa-current-status');
        const toggleBtn = document.getElementById('btn-toggle-2fa');
        
        if (user2FaActive) {
          statusText.innerHTML = 'Текущий статус: <span style="color:green; font-weight:bold;">ЗАЩИЩЕН (2FA включена)</span>';
          toggleBtn.innerText = 'Отключить защиту 2FA';
          toggleBtn.className = 'btn btn-danger';
        } else {
          statusText.innerHTML = 'Текущий статус: <span style="color:red; font-weight:bold;">НЕБЕЗОПАСНО (2FA выключена)</span>';
          toggleBtn.innerText = 'Включить защиту 2FA';
          toggleBtn.className = 'btn';
        }
      }
    } catch (e) {
      console.error("Ошибка парсинга или запроса профиля:", e);
    }
  }


  // Асинхронная загрузка картинки аватарки (через FormData)
  async function uploadAvatar() {
    const fileInput = document.getElementById('avatar-file');
    if (fileInput.files.length === 0) {
      alert("⚠️ Пожалуйста, выберите файл изображения!");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', fileInput.files[0]);

    try {
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.status) {
        alert("📷 Аватарка успешно обновлена!");
        document.getElementById('user-avatar').src = data.avatar;
        fileInput.value = "";
      } else {
        alert("Ошибка: " + data.message);
      }
    } catch (err) {
      alert("Не удалось загрузить файл на server.");
    }
  }
  async function updatePassword() {
    const oldPassword = document.getElementById('p-old').value;
    const newPassword = document.getElementById('p-new').value;
    if (!oldPassword || !newPassword) {
      alert("⚠️ Заполните оба поля паролей!");
      return;
    }
    let totpCode = null;
    if (user2FaActive) {
      totpCode = prompt("🔒 Безопасность: Введите ваш 2FA токен подтверждения для смены пароля:");
      if (!totpCode) return;
    }
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ oldPassword, newPassword, totpCode })
      });
      const data = await res.json();
      if (data.status) {
        alert("✅ Пароль успешно изменен!");
        document.getElementById('p-old').value = "";
        document.getElementById('p-new').value = "";
      } else {
        alert("Ошибка изменения пароля. Код [" + data.statusCode + "]");
      }
    } catch (err) {
      console.error(err);
    }
  }
  async function updateGmail() {
    const newGmail = document.getElementById('profile-new-gmail').value.trim();
    if (!newGmail || !newGmail.includes('@')) {
      alert("⚠️ Введите корректный адрес почты!");
      return;
    }

    try {
      const res = await fetch('/api/users/change-gmail', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ newGmail })
      });
      const data = await res.json();

      if (data.status) {
        alert("📧 Адрес Google почты успешно обновлен!");
        document.getElementById('profile-new-gmail').value = "";
      } else {
        alert("Ошибка смены почты: Код [" + data.statusCode + "]");
      }
    } catch (err) {
      console.error(err);
    }
  }
  async function toggleSystem2FA() {
    const url = user2FaActive ? '/api/users/disable-2fa' : '/api/users/enable-2fa';
    try {
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (data.status) {
        if (!user2FaActive && data.secret2FA) {
          document.getElementById('profile-2fa-setup').style.display = 'block';
          document.getElementById('profile-2fa-key').innerText = data.secret2FA;
          alert("🔒 Защита 2FA успешно активирована! Обязательно сохраните токен.");
        } else {
          document.getElementById('profile-2fa-setup').style.display = 'none';
          alert("⚠️ Защита 2FA успешно отключена.");
        }
        syncProfileSectionData();
      } else {
        alert("Ошибка управления 2FA");
      }
    } catch (err) {
      console.error(err);
    }
  }
  async function closeAccount(accountId) {
    if (!confirm(`Вы уверены, что хотите закрыть и удалить счет #${accountId}?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Критическая ошибка бэкенда:", errorText);
        alert("⚠️ Ошибка сервера при попытке закрыть счет. Попробуйте позже.");
        return;
      }
      const data = await response.json();
      if (data.status) {
        alert("🎉 Счет успешно закрыт и удален из системы!");
        loadData();
      } else {
        alert(`❌ Ошибка удаления: ${data.message || 'Счет должен быть пуст и разблокирован'}`);
      }
    } catch (err) {
      console.error("Ошибка при закрытии счета:", err);
      alert("Не удалось отправить запрос на удаление счета.");
    }
  }
  async function loadTransactionLogs() {
    try {
      const response = await fetch('/api/accounts/my-logs');
      if (!response.ok) return;
      const result = await response.json();
      const tbody = document.querySelector('#table-logs tbody');
      tbody.innerHTML = "";
      if (result.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#aaa;">У вас пока нет совершенных транзакций</td></tr>`;
        return;
      }
      result.logs.forEach(log => {
        const tad = new Date(log.createdAt);
        const date = `${tad.getFullYear()}.${tad.getMonth()}.${tad.getDay()}`;
        const time = `${tad.getHours()}:${tad.getMinutes()}:${tad.getSeconds()}`;
        let typeText = "";
        let amountStyle = "";
        let prefix = "";
        let sender = "";
        if (log.type === 'DEPOSIT' || log.type === 'TRANSFER_IN') {
          typeText = log.type === 'DEPOSIT' ? 'Пополнение' : 'Перевод (Входящий)';
          amountStyle = 'color: green; font-weight: bold;';
          prefix = "+";
        } else {
          typeText = log.type === 'WITHDRAW' ? 'Списание' : 'Перевод (Исходящий)';
          amountStyle = 'color: red; font-weight: bold;';
          prefix = "-";
        }
        if(log.sender_or_receiver == "Администрация (ROOT)"){
          sender = `<span style='color:blue' id='root001'><strong><i>Администрация (ROOT)</i></strong></span>`
        } else {
          sender = log.sender_or_receiver;
        }
        tbody.innerHTML += `
          <tr>
            <td>${date}</td>
            <td>${time}</td>
            <td><b>#${log.account_id}</b></td>
            <td>${typeText}</td>
            <td>${sender || '—'}</td>
            <td style="${amountStyle}">${prefix} ${parseFloat(log.amount).toFixed(2)} руб.</td>
          </tr>
        `;
      });
    } catch (err) {
      console.error("Ошибка загрузки истории операций:", err);
    }
  }