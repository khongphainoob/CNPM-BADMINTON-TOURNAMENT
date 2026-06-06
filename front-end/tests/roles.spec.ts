import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe.serial('E2E Tests for Roles', () => {

  // ==========================================
  // Test Role Admin
  // ==========================================
  test('Admin Role - Login and Access System Settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Thực hiện đăng nhập
    await page.fill('input[name="credential"]', 'admin@shuttleops.vn');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Chờ chuyển hướng đến overview
    await page.waitForURL('**/overview');
    
    // Kiểm tra có tab "Quản lý tài khoản" ở Sidebar hay không
    const usersTab = page.locator('text=Quản lý tài khoản');
    await expect(usersTab).toBeVisible();

    // Click và kiểm tra trang Quản lý tài khoản
    await usersTab.click();
    await page.waitForURL('**/users');
    await expect(page.locator('text=Quản lý tài khoản').first()).toBeVisible();
  });

  // ==========================================
  // Test Role BTC
  // ==========================================
  test('BTC Role - Login and Access Tournament Dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="credential"]', 'phamlam@shuttleops.vn');
    await page.fill('input[name="password"]', 'btc123');
    await page.click('button[type="submit"]');

    // Nếu có lỗi đăng nhập thì văng luôn ở đây (bắt lỗi hiển thị trên form)
    await expect(page.locator('text=Lỗi đăng nhập').or(page.locator('text=Thông tin đăng nhập không đúng'))).toBeHidden();

    await page.waitForURL('**/overview');

    // Mở trang Quản lý giải đấu
    const tourTab = page.locator('text=Giải đấu');
    await expect(tourTab).toBeVisible();
    await tourTab.click();
    await page.waitForURL('**/tournaments');
    
    await expect(page.locator('text=Đang tải')).toBeHidden();
    
    await page.waitForTimeout(1500); // Đảm bảo React đã render xong danh sách
    
    // Nếu màn hình hiện "Chưa có giải đấu nào", test sẽ fail ngay tại đây thay vì timeout
    await expect(page.locator('text=Chưa có giải đấu nào')).toBeHidden();

    // Nhấp vào giải đấu đầu tiên
    const tourCard = page.getByTestId('tournament-card').first();
    await expect(tourCard).toBeVisible({ timeout: 10000 });
    await tourCard.click();
    
    // Đảm bảo truy cập được vào dashboard của Giải đấu cụ thể
    await page.waitForURL('**/tournament/*/dashboard');
    await expect(page.locator('text=Dashboard Giải')).toBeVisible();
  });

  // ==========================================
  // Test Role Referee
  // ==========================================
  test('Referee Role - Login and Access Offline Sync', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="credential"]', 'lequanghuy@shuttleops.vn');
    await page.fill('input[name="password"]', 'ref123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Lỗi đăng nhập').or(page.locator('text=Thông tin đăng nhập không đúng'))).toBeHidden();

    await page.waitForURL('**/overview');

    // Referee phải chọn Giải đấu trước
    const tourTab = page.locator('text=Giải đấu');
    await expect(tourTab).toBeVisible();
    await tourTab.click();
    await page.waitForURL('**/tournaments');
    
    await expect(page.locator('text=Đang tải')).toBeHidden();

    const tourCard = page.getByTestId('tournament-card').first();
    await expect(tourCard).toBeVisible();
    await tourCard.click();

    await page.waitForURL('**/tournament/*/schedule');

    // Phải thấy các tab của Referee
    await expect(page.locator('text=Đồng bộ Offline')).toBeVisible();

    // Vào Sync Log (BM22)
    await page.click('text=Đồng bộ Offline');
    await expect(page.locator('text=Trạng thái đồng bộ')).toBeVisible();
  });

  // ==========================================
  // Test Role Athlete
  // ==========================================
  test('Athlete Role - Login and Payment Check', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="credential"]', 'nguyenhaidang@shuttleops.vn');
    await page.fill('input[name="password"]', 'vdv123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Lỗi đăng nhập').or(page.locator('text=Thông tin đăng nhập không đúng'))).toBeHidden();

    await page.waitForURL('**/overview');

    // Athlete Dashboard
    await expect(page.locator('text=Thành tích & Tích điểm')).toBeVisible();

    // Check payment notification (BM23) - Nguyễn Hải Đăng is hardcoded with unpaid registration in UI mock
    const paymentWarning = page.locator('text=Cảnh báo: Bạn có 1 khoản lệ phí chưa thanh toán');
    await expect(paymentWarning).toBeVisible();
    
    const payNowBtn = page.locator('button', { hasText: 'Thanh toán ngay' });
    await expect(payNowBtn).toBeVisible();

    // Check register new tournament tab
    await expect(page.locator('text=Đăng ký thi đấu')).toBeVisible();
  });
});
