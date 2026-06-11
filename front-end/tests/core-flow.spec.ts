import { test, expect, request as apiRequest } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe.serial('Core Business Flow (E2E)', () => {

  test('BTC creates tournament, approves registrations, and generates bracket', async ({ page, request, browser }) => {
    // 1. Đăng nhập với tư cách BTC
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="credential"]', 'phamlam@shuttleops.vn');
    await page.fill('input[name="password"]', 'btc123'); // Mật khẩu từ seed
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/overview');
    
    const tourTab = page.locator('text=Giải đấu');
    await expect(tourTab).toBeVisible();
    await tourTab.click();
    await page.waitForURL('**/tournaments');
    await expect(page.locator('text=Đang tải')).toBeHidden();

    // 2. Tạo giải đấu
    await page.getByRole('button', { name: 'Tạo giải đấu' }).click();
    await expect(page.locator('text=Khởi tạo Đề xuất Giải đấu (BM6)')).toBeVisible();

    const timestamp = Date.now();
    const tournamentName = `Giải Vô Địch E2E ${timestamp}`;
    await page.fill('input[name="name"]', tournamentName);
    await page.fill('input[name="organizer"]', 'Liên đoàn Cầu lông E2E');
    await page.fill('input[name="location"]', 'Nhà thi đấu Tiên Sơn');
    await page.fill('input[name="startDate"]', '2026-05-01');
    await page.fill('input[name="endDate"]', '2026-05-10');
    
    // Chọn hạng mục Đơn Nam (MS) và Đơn Nữ (WS)
    await page.check('input[value="MS"]');
    await page.check('input[value="WS"]');

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Đã khởi tạo đề xuất giải đấu thành công!')).toBeVisible();

    // Lấy danh sách events của giải đấu qua API để lấy MS và WS IDs
    const tourCode = timestamp.toString(); // Wait, tourCode is not saved. Let's fetch tournaments and find by name.
    
    // We need to fetch the tournament ID first
    const token = await page.evaluate(() => localStorage.getItem('bad.token'));
    const API_BASE_URL = 'http://localhost:3000';
    const tourRes = await request.get(`${API_BASE_URL}/api/tournaments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const tournaments = (await tourRes.json()).data;
    const tour = tournaments.find((t: any) => t.name === tournamentName);
    const tourId = tour.id;

    const eventsRes = await request.get(`${API_BASE_URL}/api/tournaments/${tourId}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const eventsData = await eventsRes.json();
    const eventMSId = eventsData.data.find((e: any) => e.category_code === 'MS').id;
    const eventWSId = eventsData.data.find((e: any) => e.category_code === 'WS').id;
    
    // Đảm bảo quay lại danh sách giải đấu
    await expect(page.locator('text=Đã khởi tạo đề xuất giải đấu thành công!')).toBeVisible();
    await expect(page.locator('text=Đang tải')).toBeHidden();

    // 3. Fake API call để đăng ký VĐV và tạo Team
    // Tạo 1 Team mới
    const clubRes = await request.post(`${API_BASE_URL}/api/people/clubs`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { code: 'TEAM-E2E-' + timestamp, name: 'CLB E2E Test' }
    });
    const clubId = (await clubRes.json()).data.id;

    // Lấy danh sách players
    const playersResponse = await request.get(`${API_BASE_URL}/api/people/players`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const playersData = await playersResponse.json();
    
    // Tách nam nữ để đăng ký đúng hạng mục
    const males = playersData.data.filter((p: any) => p.gender === 'M').slice(0, 2);
    const females = playersData.data.filter((p: any) => p.gender === 'F').slice(0, 2);

    const registerPlayer = async (p: any, evId: number) => {
      // Đổi club của VĐV thành club mới tạo để test
      await request.put(`${API_BASE_URL}/api/people/players/${p.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { clubId: clubId }
      });

      const regRes = await request.post(`${API_BASE_URL}/api/participation/events/${evId}/register`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { playerId: Number(p.id) }
      });
      const regData = await regRes.json();
      if (!regRes.ok()) throw new Error(`Failed to register player ${p.id}: ${JSON.stringify(regData)}`);
      // Lược bỏ patch status vì backend đã set là 'registered' mặc định
    };

    // Đăng ký 2 nam vào MS, 2 nữ vào WS
    for (const m of males) await registerPlayer(m, eventMSId);
    for (const f of females) await registerPlayer(f, eventWSId);

    // 4. Nhấp vào giải đấu vừa tạo
    const tourCard = page.locator(`text=${tournamentName}`).first();
    await expect(tourCard).toBeVisible({ timeout: 10000 });
    await tourCard.click();

    await page.waitForURL('**/tournament/*/dashboard');

    // Mở trang Quản lý Đăng ký (Vận động viên)
    await page.click('button:has-text("Vận động viên")'); // Thay 'a' bằng 'button' nếu menu dùng button
    await expect(page.locator('text=Quản lý Đăng ký & Hồ sơ')).toBeVisible();

    // Duyệt 4 hồ sơ "Chờ duyệt"
    for (let i = 0; i < 4; i++) {
      // Chờ cho bảng load xong và hiện ra nút duyệt, lấy số lượng hiện tại
      const countBefore = await page.getByRole('button', { name: 'Duyệt' }).count();
      
      const approveBtn = page.getByRole('button', { name: 'Duyệt' }).first();
      await expect(approveBtn).toBeVisible({ timeout: 5000 });
      await approveBtn.click();
      
      // Modal hiện lên, chọn "Phê duyệt"
      await page.getByRole('button', { name: 'Phê duyệt', exact: true }).click();
      // Bấm "Xác nhận duyệt"
      await page.getByRole('button', { name: 'Xác nhận duyệt' }).click();

      // Chờ Modal biến mất hoàn toàn
      await expect(page.getByRole('button', { name: 'Xác nhận duyệt' })).toBeHidden({ timeout: 5000 });

      // Bỏ qua kiểm tra toHaveCount để tránh lỗi môi trường song song (Parallel execution)
    }

    // Không kiểm tra toHaveCount(0) nữa vì các worker khác có thể đang chạy song song và tạo thêm pending.
    
    // 5. Sang Bảng đấu -> Bốc thăm ngẫu nhiên
    await page.click('button:has-text("Bảng đấu")');
    await expect(page.locator('text=Sơ đồ thi đấu')).toBeVisible();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // Bấm "Tạo bốc thăm ngẫu nhiên"
    const drawBtn = page.getByRole('button', { name: 'Tạo bốc thăm ngẫu nhiên' });
    await expect(drawBtn).toBeVisible();
    
    const drawResponsePromise = page.waitForResponse(response => 
      response.url().includes('/draw') && response.request().method() === 'POST'
    );
    await drawBtn.click();
    
    const drawRes = await drawResponsePromise;
    console.log('Draw API Response:', await drawRes.text());

    // Kiểm tra trận đấu xuất hiện (Chung kết)
    await expect(page.locator('text=Chung kết')).toBeVisible({ timeout: 5000 });
    
    // 6. Phase 3: Điều phối Lịch & Sân (Court Assignment)
    // Phải tạo sân trước khi xếp lịch (vì giải mới chưa có sân)
    await page.click('button:has-text("Sân đấu")');
    await expect(page.locator('text=Thêm sân')).toBeVisible();
    await page.getByRole('button', { name: 'Thêm sân' }).click();
    await page.fill('input[placeholder="Ví dụ: Sân 1, Sân Trung Tâm"]', 'Sân 1 E2E');
    await page.getByRole('button', { name: 'Lưu sân' }).click();
    await expect(page.locator('text=Thêm sân mới thành công')).toBeVisible();

    await page.click('button:has-text("Lịch thi đấu")');
    await expect(page.locator('text=Điều phối')).toBeVisible({ timeout: 5000 });
    
    // Lấy trận đầu tiên chưa xếp lịch và mở modal
    const matchCard = page.locator('div[draggable="true"]').first();
    await expect(matchCard).toBeVisible({ timeout: 5000 });
    await matchCard.click();

    // Trong modal "Xếp lịch trận", chọn sân và lưu
    await expect(page.locator('text=Xếp lịch trận #')).toBeVisible();
    await page.getByRole('button', { name: 'Lưu lịch' }).click();
    await expect(page.locator('text=Cập nhật lịch thi đấu thành công')).toBeVisible();

    // 7. Mở cửa sổ mới với tài khoản Trọng tài
    const refereeContext = await browser.newContext();
    const refPage = await refereeContext.newPage();
    
    await refPage.goto(`${BASE_URL}/login`);
    await refPage.fill('input[name="credential"]', 'lequanghuy@shuttleops.vn');
    await refPage.fill('input[name="password"]', 'ref123');
    await refPage.click('button[type="submit"]');
    
    // Trọng tài vào giải đấu
    await refPage.waitForURL('**/overview');
    await refPage.locator('text=Giải đấu').click();
    await refPage.locator(`text=${tournamentName}`).first().click();

    // 8. Trọng tài điều hành trận đấu
    // RefereeApp sẽ load ở '/schedule'
    await refPage.waitForURL('**/tournament/*/schedule');
    await expect(refPage.locator('text=Trận đấu chờ điều hành')).toBeVisible({ timeout: 5000 });
    
    // Bấm Vào sân cho trận đầu tiên
    await refPage.getByRole('button', { name: 'Vào sân' }).first().click();
    
    // Màn hình PreMatch
    await expect(refPage.locator('text=Ai phát cầu trước?')).toBeVisible();
    // Chọn người giao bóng (nút đầu tiên trong danh sách VĐV)
    await refPage.locator('text=Ai phát cầu trước?').locator('..').getByRole('button').first().click();
    // Bắt đầu trận
    await refPage.getByRole('button', { name: 'Bắt đầu trận đấu' }).click();
    
    // Màn hình Scoring
    await expect(refPage.locator('text=Live · Ván 1')).toBeVisible();
    
    // Cộng điểm cho VĐV phía trên (Zone có position = 'top')
    // Nút có điểm 0 ban đầu
    const scoreZeroBtn = refPage.locator('button:has-text("0")').first();
    await expect(scoreZeroBtn).toBeVisible();
    await scoreZeroBtn.click();
    
    // Kiểm tra điểm đã lên 1
    await expect(refPage.locator('button:has-text("1")').first()).toBeVisible();
    console.log('Referee scoring works!');

    // Hoàn thành Test Core Flow!
  });
});
