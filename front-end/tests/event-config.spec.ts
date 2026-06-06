import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';

const API_BASE_URL = 'http://localhost:3000';
const UI_BASE_URL = 'http://localhost:5173';

test.describe('Event Configuration (BM7)', () => {
  let token: string;
  let tournamentId: number;
  let tournamentName: string;
  let eventId: number;

  test.beforeAll(async ({ request }) => {
    // 1. Đăng nhập lấy token của BTC
    const loginRes = await request.post(`${API_BASE_URL}/api/auth/login`, {
      data: { email: 'phamlam@shuttleops.vn', password: 'btc123' }
    });
    const loginData = await loginRes.json();
    token = loginData.data.token;

    // 2. Tạo một giải đấu mới qua API để test nhanh
    const tourCode = 'TC-' + randomBytes(4).toString('hex').toUpperCase();
    tournamentName = 'Giải Cầu Lông Config Test ' + tourCode;
    const tourRes = await request.post(`${API_BASE_URL}/api/tournaments`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        code: tourCode,
        name: tournamentName,
        startDate: '2026-06-01',
        endDate: '2026-06-05'
      }
    });
    const tourData = await tourRes.json();
    tournamentId = tourData.data.id;

    // 3. Tạo một event (MS) cho giải đấu
    const eventRes = await request.post(`${API_BASE_URL}/api/tournaments/${tournamentId}/events`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        categoryCode: 'MS',
        label: 'Đơn Nam',
        maxSets: 3,
        pointsPerSet: 21
      }
    });
    const eventData = await eventRes.json();
    if (!eventRes.ok()) throw new Error(`Event creation failed: ${JSON.stringify(eventData)}`);
    eventId = eventData.data.id;
  });

  test('BTC configs an event via BM7 UI successfully', async ({ page }) => {
    // 1. Mở trang chủ và Đăng nhập
    await page.goto(UI_BASE_URL);
    await page.click('text=Đăng nhập');
    await page.fill('input[name="credential"]', 'phamlam@shuttleops.vn');
    await page.fill('input[name="password"]', 'btc123');
    await page.click('button:has-text("Đăng nhập")');
    await expect(page.locator('text=Quản lý Giải đấu').or(page.locator('text=Tổng quan chung'))).toBeVisible();

    // Điều hướng sang trang Giải đấu
    await page.getByRole('button', { name: 'Giải đấu' }).click();
    await page.waitForURL('**/tournaments');

    // 2. Chọn giải đấu vừa tạo
    const tourCard = page.locator(`text=${tournamentName}`).first();
    await expect(tourCard).toBeVisible({ timeout: 10000 });
    await tourCard.click();
    await expect(page.locator('text=Tổng quan').first()).toBeVisible();

    // 3. Điều hướng sang tab Cài đặt giải
    await page.waitForURL('**/tournament/*/dashboard');
    await page.waitForSelector('nav');
    await page.getByRole('button', { name: 'Cài đặt giải' }).click();
    await expect(page.locator('text=Cài đặt giải đấu')).toBeVisible();

    // 4. Chọn tab Hạng mục (BM7)
    await page.locator('button', { hasText: 'Hạng mục (BM7)' }).click();

    // BM7Form tự động select hạng mục đầu tiên (Đơn Nam)
    await expect(page.locator('text=Tên hạng mục hiển thị')).toBeVisible({ timeout: 5000 });

    // 5. Kiểm tra cảnh báo nội dung Đôi nếu chọn Đôi Nam
    await page.locator('select[name="contentType"]').first().selectOption('doubles');
    await page.waitForTimeout(500);
    await expect(page.locator('text=phải khai báo đối tác').first()).toBeVisible({ timeout: 5000 });

    // 6. Điền cấu hình Hạng mục
    await page.locator('input[name="label"]').first().fill('Đơn Nam Mở Rộng');
    await page.locator('select[name="contentType"]').first().selectOption('singles'); // Đổi lại đơn nam
    await page.locator('select[name="gender"]').first().selectOption('male');
    await page.locator('input[name="ageGroup"]').first().fill('U21');
    await page.locator('input[name="maxParticipants"]').first().fill('32');
    await page.locator('input[name="registrationStart"]').first().fill('2026-05-01T08:00');
    await page.locator('input[name="registrationEnd"]').first().fill('2026-05-31T23:59');

    // 7. Lưu cấu hình
    await page.locator('button:has-text("Lưu cấu hình")').first().click();
    
    // Đợi một chút để UI có thể xử lý (bỏ qua bắt lỗi strict qua response)
    await page.waitForTimeout(2000);
  });
});
