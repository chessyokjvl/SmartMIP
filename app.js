// ==========================================
// การตั้งค่าระบบ (System Configuration)
// ==========================================
// URL ของ Google Apps Script Web App (อัปเดตล่าสุด)
const API_URL = 'https://script.google.com/macros/s/AKfycbyuYuC3kFwHOhfKaiiYtnSg2u2SfWwSJvT-utrnfMtTB9Gc8tbVIAvNKiIm9d6xAjg/exec';

// ==========================================
// 1. ฟังก์ชันเชื่อมต่อฐานข้อมูล (API Fetcher)
// ==========================================
async function callAPI(action, dataObj) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      redirect: 'follow', // จำเป็นมาก: สั่งให้วิ่งตามการ Redirect ของ Google
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // จำเป็นมาก: เลี่ยงปัญหา CORS Preflight
      body: JSON.stringify({ action: action, data: dataObj })
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    alert("เกิดปัญหาการเชื่อมต่อเครือข่าย หรือไม่สามารถติดต่อฐานข้อมูลได้");
    return { success: false, message: "Connection Error" };
  }
}

// ==========================================
// 2. ฟังก์ชันตรวจสอบสิทธิ์ (Authentication Check)
// ==========================================
function checkAuth() {
  const role = sessionStorage.getItem('userRole');
  const path = window.location.pathname.split('/').pop() || 'index.html'; // ดึงชื่อไฟล์ปัจจุบัน
  
  // อนุญาตให้หน้า index.html (หน้า Login) ไม่ต้องเช็คสิทธิ์
  if (path === 'index.html' || path === '') {
    // ถ้า Login แล้ว แต่เผลอกดมาหน้า Login ให้เด้งไป Dashboard เลย
    if (role) {
      window.location.href = 'dashboard.html';
    }
    return;
  }

  // ถ้าเข้าหน้าอื่นแต่ยังไม่ Login ให้เตะกลับไปหน้า Login
  if (!role) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    window.location.href = 'index.html';
  }
}

// ==========================================
// 3. ฟังก์ชันสร้างโครงร่าง UI (Render Layout)
// ==========================================
function renderLayout() {
  const role = sessionStorage.getItem('userRole') || 'Guest';
  const name = sessionStorage.getItem('userName') || 'ผู้เยี่ยมชม';
  const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // สำหรับทำ Highlight เมนู

  // --- 3.1 สร้างแถบด้านบน (Navbar) ---
  const navbarHTML = `
    <nav class="navbar top-navbar fixed-top" style="background-color: #3c8dbc; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 1050;">
      <div class="container-fluid">
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-outline-light me-2 d-md-none" onclick="toggleSidebar()"><i class="bi bi-list fs-5"></i></button>
          <span class="navbar-brand mb-0 text-white fw-bold"><i class="bi bi-shield-plus me-1"></i> JVL Clinical Management</span>
        </div>
        <div class="d-flex align-items-center text-white">
          <img src="https://ui-avatars.com/api/?name=${name}&background=random&color=fff&rounded=true" alt="Avatar" width="30" height="30" class="me-2">
          <span class="me-3 small d-none d-sm-inline">${name} <br><small class="text-warning fw-bold">(${role})</small></span>
          <button class="btn btn-sm btn-danger shadow-sm" onclick="logout()" title="ออกจากระบบ"><i class="bi bi-box-arrow-right"></i></button>
        </div>
      </div>
    </nav>
  `;

  // --- 3.2 สร้างเมนูด้านซ้าย (Sidebar) ตามสิทธิ์ ---
  let menuHTML = `<ul class="sidebar-menu" style="list-style: none; padding: 0; margin: 0;">`;
  
  // ฟังก์ชันตัวช่วยสำหรับเช็คเมนูที่กำลังเปิดอยู่
  const activeClass = (page) => currentPage === page ? 'active' : '';

  // เมนูที่ทุกคนเห็น (รวม Guest)
  menuHTML += `
    <li class="header mt-2 px-3 pb-1 text-muted small fw-bold">เมนูหลัก (MAIN NAVIGATION)</li>
    <li><a href="dashboard.html" class="nav-link text-dark py-2 border-bottom ${activeClass('dashboard.html')}"><i class="bi bi-speedometer2 me-2 text-info"></i> Dashboard (KPIs)</a></li>
  `;

  // เมนูสำหรับ General, Admin, GodAdmin
  if (['General', 'Admin', 'GodAdmin'].includes(role)) {
    menuHTML += `
      <li class="header mt-3 px-3 pb-1 text-muted small fw-bold">การปฏิบัติการทางคลินิก</li>
      <li><a href="aws.html" class="nav-link text-dark py-2 border-bottom ${activeClass('aws.html')}"><i class="bi bi-thermometer-half me-2 text-primary"></i> 1. ประเมิน AWS</a></li>
      <li><a href="save.html" class="nav-link text-dark py-2 border-bottom ${activeClass('save.html')}"><i class="bi bi-exclamation-triangle me-2 text-danger"></i> 2. ประเมิน SAVE</a></li>
      <li><a href="bprs.html" class="nav-link text-dark py-2 border-bottom ${activeClass('bprs.html')}"><i class="bi bi-clipboard2-pulse me-2 text-success"></i> 3. ประเมิน BPRS</a></li>
      
      <li><a href="records.html" class="nav-link text-dark py-2 border-bottom ${activeClass('records.html')}"><i class="bi bi-journal-text me-2 text-secondary"></i> แบบบันทึกต่างๆ</a></li>
      <li><a href="appointments.html" class="nav-link text-dark py-2 border-bottom ${activeClass('appointments.html')}"><i class="bi bi-calendar-check me-2 text-info"></i> ระบบนัดหมาย</a></li>
    `;
  }

  // เมนูสำหรับ Admin, GodAdmin
  if (['Admin', 'GodAdmin'].includes(role)) {
    menuHTML += `
      <li class="header mt-3 px-3 pb-1 text-muted small fw-bold">ADMIN TOOLS</li>
      <li><a href="admin_structure.html" class="nav-link text-dark py-2 border-bottom ${activeClass('admin_structure.html')}"><i class="bi bi-diagram-3 me-2 text-secondary"></i> จัดการโครงสร้างระบบ</a></li>
    `;
  }

  // เมนูสำหรับ GodAdmin เท่านั้น
  if (role === 'GodAdmin') {
    menuHTML += `
      <li class="header mt-3 px-3 pb-1 text-danger small fw-bold">GOD ADMIN</li>
      <li><a href="admin_users.html" class="nav-link text-dark py-2 border-bottom ${activeClass('admin_users.html')}"><i class="bi bi-people-fill me-2 text-danger"></i> จัดการผู้ใช้งาน</a></li>
      <li><a href="admin_pii.html" class="nav-link text-dark py-2 border-bottom ${activeClass('admin_pii.html')}"><i class="bi bi-database-fill-gear me-2 text-danger"></i> จัดการฐานข้อมูล (PII)</a></li>
    `;
  }

  menuHTML += `</ul>`;

  // --- 3.3 นำ HTML ไปใส่ใน DOM ของหน้าเว็บ ---
  const headerDiv = document.getElementById('app-header');
  const sidebarDiv = document.getElementById('app-sidebar');
  
  if (headerDiv) headerDiv.innerHTML = navbarHTML;
  if (sidebarDiv) {
    // เพิ่ม Overlay สำหรับมือถืออัตโนมัติ
    sidebarDiv.innerHTML = menuHTML;
    if (!document.getElementById('sidebarOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'sidebarOverlay';
      overlay.className = 'sidebar-overlay';
      overlay.onclick = toggleSidebar;
      document.body.appendChild(overlay);
    }
  }
}

// ==========================================
// 4. ฟังก์ชันควบคุม UI และการทำงานทั่วไป
// ==========================================
// เปิด-ปิด เมนูในโหมดมือถือ (Hamburger Menu)
function toggleSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('show');
  if (overlay) overlay.classList.toggle('show');
}

// ฟังก์ชันออกจากระบบ
function logout() {
  if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
    sessionStorage.clear();
    window.location.href = 'index.html';
  }
}

// ==========================================
// 5. สั่งรันฟังก์ชันทันทีเมื่อโหลดหน้าเว็บเสร็จ
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  checkAuth(); // ตรวจสอบสิทธิ์ก่อนเป็นอันดับแรก
  
  // ถ้ามีกล่อง Header/Sidebar ค่อยวาด UI (ป้องกัน Error ในหน้า index.html ที่ไม่มีกล่องเหล่านี้)
  if(document.getElementById('app-header') && document.getElementById('app-sidebar')) {
    renderLayout();
  }
});
