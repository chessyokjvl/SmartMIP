// --- app.js ---
const API_URL = 'https://script.google.com/macros/s/AKfycbyuYuC3kFwHOhfKaiiYtnSg2u2SfWwSJvT-utrnfMtTB9Gc8tbVIAvNKiIm9d6xAjg/exec';

// 1. ฟังก์ชันเรียก API
async function callAPI(action, dataObj) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action, data: dataObj })
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    alert("ปัญหาเครือข่าย: ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    return { success: false };
  }
}

// 2. ตรวจสอบสถานะ Login (กันคนแอบเข้าหน้าอื่น)
function checkAuth() {
  const role = sessionStorage.getItem('userRole');
  const path = window.location.pathname;
  // ถ้ายังไม่ login และไม่ได้อยู่หน้า index ให้เด้งกลับไปหน้า login
  if (!role && !path.includes('index.html') && path !== '/' && !path.endsWith('/PCT/front/')) {
    window.location.href = 'index.html';
  }
}

// 3. ฟังก์ชัน Render เมนูและแถบด้านบน (Navbar & Sidebar)
function renderLayout() {
  const role = sessionStorage.getItem('userRole') || 'Guest';
  const name = sessionStorage.getItem('userName') || 'ผู้เยี่ยมชม';

  // --- สร้าง Navbar (แถบด้านบน) ---
  const navbarHTML = `
    <nav class="navbar top-navbar fixed-top" style="background-color: #3c8dbc; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 1050;">
      <div class="container-fluid">
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-outline-light me-2 d-md-none" onclick="toggleSidebar()"><i class="bi bi-list fs-5"></i></button>
          <span class="navbar-brand mb-0 text-white fw-bold"><i class="bi bi-shield-plus me-1"></i> JVL Clinical Management</span>
        </div>
        <div class="d-flex align-items-center text-white">
          <img src="https://ui-avatars.com/api/?name=${name}&background=random&color=fff&rounded=true" alt="Avatar" width="30" height="30" class="me-2">
          <span class="me-3 small d-none d-sm-inline">${name} <br><small class="text-warning">(${role})</small></span>
          <button class="btn btn-sm btn-danger" onclick="logout()" title="ออกจากระบบ"><i class="bi bi-box-arrow-right"></i></button>
        </div>
      </div>
    </nav>
  `;

  // --- สร้าง Sidebar (เมนูด้านซ้ายตาม Role) ---
  let menuHTML = `<ul class="sidebar-menu" style="list-style: none; padding: 0; margin: 0;">`;
  
  // เมนูที่ทุกคนเห็น (รวม Guest)
  menuHTML += `
    <li><a href="dashboard.html" class="nav-link text-dark py-3 border-bottom"><i class="bi bi-speedometer2 me-2 text-info"></i> Dashboard (KPIs)</a></li>
  `;

  // เมนูสำหรับ General, Admin, GodAdmin
  if (['General', 'Admin', 'GodAdmin'].includes(role)) {
    menuHTML += `
      <li><a href="save.html" class="nav-link text-dark py-3 border-bottom"><i class="bi bi-clipboard-check me-2 text-primary"></i> แบบประเมิน</a></li>
      <li><a href="#" class="nav-link text-dark py-3 border-bottom"><i class="bi bi-journal-text me-2 text-primary"></i> แบบบันทึก</a></li>
      <li><a href="#" class="nav-link text-dark py-3 border-bottom"><i class="bi bi-calendar-check me-2 text-primary"></i> ระบบนัดหมาย</a></li>
    `;
  }

  // เมนูสำหรับ Admin, GodAdmin
  if (['Admin', 'GodAdmin'].includes(role)) {
    menuHTML += `
      <li class="mt-3 px-3 pb-1 text-muted small fw-bold">ADMIN TOOLS</li>
      <li><a href="#" class="nav-link text-dark py-3 border-bottom"><i class="bi bi-diagram-3 me-2 text-secondary"></i> จัดการโครงสร้างระบบ</a></li>
    `;
  }

  // เมนูสำหรับ GodAdmin เท่านั้น
  if (role === 'GodAdmin') {
    menuHTML += `
      <li class="mt-3 px-3 pb-1 text-danger small fw-bold">GOD ADMIN</li>
      <li><a href="#" class="nav-link text-dark py-3 border-bottom"><i class="bi bi-people-fill me-2 text-danger"></i> จัดการผู้ใช้งาน</a></li>
      <li><a href="#" class="nav-link text-dark py-3 border-bottom"><i class="bi bi-database-fill-gear me-2 text-danger"></i> จัดการฐานข้อมูล (PII)</a></li>
    `;
  }

  menuHTML += `</ul>`;

  // นำ HTML ไปใส่ใน DOM
  const headerDiv = document.getElementById('app-header');
  const sidebarDiv = document.getElementById('app-sidebar');
  if (headerDiv) headerDiv.innerHTML = navbarHTML;
  if (sidebarDiv) sidebarDiv.innerHTML = menuHTML;
}

function toggleSidebar() {
  document.getElementById('app-sidebar').classList.toggle('show');
}

function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// รันฟังก์ชันตอนโหลดหน้า
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  if(document.getElementById('app-header')) renderLayout();
});
