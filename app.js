// ==========================================
// 1. การตั้งค่าระบบ (System Configuration)
// ==========================================
const API_URL = 'https://script.google.com/macros/s/AKfycbyuYuC3kFwHOhfKaiiYtnSg2u2SfWwSJvT-utrnfMtTB9Gc8tbVIAvNKiIm9d6xAjg/exec';

// ==========================================
// 2. ฟังก์ชันแทรก CSS อัตโนมัติ (แก้ไข Navbar ล้น)
// ==========================================
function injectThemeCSS() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === 'index.html' || path === '') return;

  if (document.getElementById('jvl-theme-styles')) return; 
  const style = document.createElement('style');
  style.id = 'jvl-theme-styles';
  style.innerHTML = `
    body { font-family: 'Sarabun', sans-serif; background-color: #ecf0f5; overflow-x: hidden; }
    
    /* แก้ไข Navbar ไม่ให้ล้น */
    .top-navbar { background-color: #3c8dbc; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 1050; padding: 0.5rem 0.5rem; height: 56px; }
    .navbar-brand { font-weight: 600; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    
    .sidebar-wrapper { width: 250px; height: calc(100vh - 56px); background-color: #f9fafc; border-right: 1px solid #d2d6de; position: fixed; top: 56px; left: 0; transition: all 0.3s ease; z-index: 1040; overflow-y: auto; }
    .sidebar-menu { list-style: none; padding: 0; margin: 0; }
    .sidebar-menu li.header { padding: 10px 25px 10px 15px; font-size: 12px; color: #848484; background: #f9fafc; font-weight: bold; text-transform: uppercase; }
    .sidebar-menu li a { display: block; padding: 12px 15px; color: #444; text-decoration: none; border-left: 3px solid transparent; border-bottom: 1px solid #f4f4f4; font-size: 0.95rem; transition: all 0.2s; cursor: pointer; }
    .sidebar-menu li a:hover, .sidebar-menu li a.active { background-color: #f4f4f5; color: #3c8dbc; border-left-color: #3c8dbc; font-weight: 600; }
    .sidebar-menu li a i { width: 25px; text-align: center; color: #666; font-size: 1.1rem; }
    .sidebar-menu li a:hover i, .sidebar-menu li a.active i { color: #3c8dbc; }
    
    .content-wrapper { margin-left: 250px; padding: 20px; margin-top: 56px; min-height: calc(100vh - 56px); transition: all 0.3s ease; }
    .sidebar-overlay { display: none; position: fixed; top: 56px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1035; }
    .sidebar-overlay.show { display: block; }
    
    @media (max-width: 768px) {
      .sidebar-wrapper { left: -250px; box-shadow: 3px 0 10px rgba(0,0,0,0.1); }
      .sidebar-wrapper.show { left: 0; }
      .content-wrapper { margin-left: 0; padding: 15px; }
      .navbar-brand { font-size: 1rem; max-width: 140px; } /* ลดขนาดตัวอักษรบนมือถือ */
    }
  `;
  document.head.appendChild(style);
}

// ==========================================
// 3. API & Auth
// ==========================================
async function callAPI(action, dataObj) {
  try {
    const response = await fetch(API_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: action, data: dataObj }) });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error); alert("เครือข่ายมีปัญหา"); return { success: false };
  }
}

function checkAuth() {
  const role = sessionStorage.getItem('userRole');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === 'index.html' || path === '') { if (role) window.location.href = 'dashboard.html'; return; }
  if (!role) { alert("กรุณาเข้าสู่ระบบก่อนใช้งาน"); window.location.href = 'index.html'; }
}

// ==========================================
// 4. สร้าง Navbar & Sidebar (ปรับแก้ให้ไม่ล้น)
// ==========================================
function renderLayout() {
  const role = sessionStorage.getItem('userRole') || 'Guest';
  let name = sessionStorage.getItem('userName') || 'ผู้เยี่ยมชม';
  const currentPage = window.location.pathname.split('/').pop() || 'index.html'; 

  // ปรับ Navbar ให้ใช้ flex-nowrap และตัดคำที่ยาวเกินไป
  const navbarHTML = `
    <nav class="navbar top-navbar fixed-top flex-nowrap">
      <div class="container-fluid flex-nowrap px-2">
        <div class="d-flex align-items-center overflow-hidden">
          <button class="btn btn-sm btn-outline-light me-2 d-md-none flex-shrink-0" onclick="toggleSidebar()"><i class="bi bi-list fs-5"></i></button>
          <span class="navbar-brand mb-0 text-white fw-bold">
            <i class="bi bi-shield-plus me-1"></i> 
            <span class="d-none d-sm-inline">JVL Clinical Management</span>
            <span class="d-inline d-sm-none">Smart MIP</span>
          </span>
        </div>
        <div class="d-flex align-items-center text-white flex-shrink-0">
          <img src="https://ui-avatars.com/api/?name=${name}&background=random&color=fff&rounded=true" alt="Avatar" width="30" height="30" class="me-2 d-none d-sm-block">
          <div class="me-2 text-end d-none d-md-block" style="line-height: 1.2;">
            <div class="small text-truncate" style="max-width: 120px;">${name}</div>
            <small class="text-warning fw-bold" style="font-size: 0.7rem;">(${role})</small>
          </div>
          <button class="btn btn-sm btn-danger shadow-sm ms-1 flex-shrink-0" onclick="logout()" title="ออกจากระบบ"><i class="bi bi-box-arrow-right"></i></button>
        </div>
      </div>
    </nav>
  `;

  let menuHTML = `<ul class="sidebar-menu">`;
  const activeClass = (page) => currentPage === page ? 'active' : '';

  menuHTML += `<li class="header">เมนูหลัก (MAIN NAVIGATION)</li><li><a href="dashboard.html" class="nav-link ${activeClass('dashboard.html')}"><i class="bi bi-speedometer2 text-info"></i> Dashboard (KPIs)</a></li>`;

  if (['General', 'Admin', 'GodAdmin'].includes(role)) {
    menuHTML += `
      <li class="header">การปฏิบัติการทางคลินิก</li>
      <li><a href="admission_3s.html" class="nav-link ${activeClass('admission_3s.html')} fw-bold text-dark bg-light border-start border-primary border-4"><i class="bi bi-person-bounding-box text-primary"></i> 1. ลงทะเบียนแรกรับ (3S)</a></li>
      <li><a href="aws.html" class="nav-link ${activeClass('aws.html')}"><i class="bi bi-thermometer-half text-danger"></i> 2. ประเมิน AWS (Phase 1)</a></li>
      <li><a href="save.html" class="nav-link ${activeClass('save.html')}"><i class="bi bi-exclamation-triangle text-danger"></i> 3. ประเมิน SAVE (Phase 1)</a></li>
      <li><a href="bprs.html" class="nav-link ${activeClass('bprs.html')}"><i class="bi bi-clipboard2-pulse text-warning"></i> 4. ประเมิน BPRS (Phase 2)</a></li>
      <li><a href="records.html" class="nav-link ${activeClass('records.html')}"><i class="bi bi-journal-text text-secondary"></i> 5. แบบบันทึกทางคลินิก</a></li>
      <li><a href="appointments.html" class="nav-link ${activeClass('appointments.html')}"><i class="bi bi-calendar-check text-info"></i> 6. ระบบนัดหมาย</a></li>
    `;
  }
  if (['Admin', 'GodAdmin'].includes(role)) {
    menuHTML += `<li class="header">ADMIN TOOLS</li><li><a href="admin_structure.html" class="nav-link ${activeClass('admin_structure.html')}"><i class="bi bi-diagram-3 text-secondary"></i> จัดการโครงสร้างระบบ</a></li>`;
  }
  if (role === 'GodAdmin') {
    menuHTML += `<li class="header text-danger">GOD ADMIN</li><li><a href="admin_users.html" class="nav-link ${activeClass('admin_users.html')}"><i class="bi bi-people-fill text-danger"></i> จัดการผู้ใช้งาน</a></li><li><a href="admin_pii.html" class="nav-link ${activeClass('admin_pii.html')}"><i class="bi bi-database-fill-gear text-danger"></i> จัดการฐานข้อมูล (PII)</a></li>`;
  }
  menuHTML += `</ul>`;

  const headerDiv = document.getElementById('app-header'); const sidebarDiv = document.getElementById('app-sidebar');
  if (headerDiv) headerDiv.innerHTML = navbarHTML;
  if (sidebarDiv) {
    sidebarDiv.innerHTML = menuHTML;
    if (!document.getElementById('sidebarOverlay')) {
      const overlay = document.createElement('div'); overlay.id = 'sidebarOverlay'; overlay.className = 'sidebar-overlay'; overlay.onclick = toggleSidebar; document.body.appendChild(overlay);
    }
  }
}

function toggleSidebar() {
  document.getElementById('app-sidebar').classList.toggle('show');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
function logout() { if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) { sessionStorage.clear(); window.location.href = 'index.html'; } }

document.addEventListener("DOMContentLoaded", () => {
  injectThemeCSS(); checkAuth();
  if(document.getElementById('app-header')) renderLayout();
});
