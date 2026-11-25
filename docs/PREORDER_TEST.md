# Test module Đặt định kỳ

> Branch `thuan/feat/admin-module`, chưa commit. Mật khẩu mọi tài khoản: `Bakers@123`.
> Làm lần lượt từ kịch bản 1 tới 7. Đổi tài khoản: menu tài khoản góc phải → **Đăng xuất** → đăng nhập lại.

## Chuẩn bị

Migration gốc có thêm bảng mới nên phải dựng lại DB (mất dữ liệu local):

```sh
cd be
npm run db:rollback -- --all && npm run db:migrate
npm run db:seed
cd .. && docker compose up -d --build backend frontend
```

Rollback lỗi thì xoá DB `bakers_marketplace`, tạo lại rồi chạy `npm run db:migrate` và `npm run db:seed`.

Mở http://localhost:3000. Muốn làm lại từ đầu thì chạy lại `npm run db:seed`.

| Tài khoản | Là ai |
|---|---|
| `lananh.baker@example.com` | **Baker** Võ Lan Anh, tài khoản duy nhất đặt định kỳ được. Có sẵn 2 yêu cầu mẫu |
| `vendor.mattroi@example.com` | Tiệm **Sunrise Patisserie** (Croissant, Tart, Su kem) |
| `vendor.hoasen@example.com` | Tiệm **Hoa Sen Bakery** (Bông lan, Trung thu) |
| `thaovy@example.com` | Khách thường, **không** đặt định kỳ được |

| Sản phẩm | Tiệm | Giá | Tồn kho |
|---|---|---|---|
| Croissant Bơ Pháp | Sunrise | 35.000đ / cái | 60 |
| Bánh Su Kem | Sunrise | 8.000đ / cái | 150 |
| Bánh Bông Lan Trứng Muối | Hoa Sen | 65.000đ / hộp | 40 |
| Bánh Trung Thu Thập Cẩm | Hoa Sen | 85.000đ / cái | 120 |

**Cách hoạt động:**
- Baker gửi yêu cầu. Mỗi tiệm duyệt phần của mình **một lần** cho cả đợt, hạn duyệt **1 tiếng** (chạy thật sẽ là 24 giờ).
- Tới mỗi kỳ (00:00 ngày giao), hệ thống tự tạo một đơn **Đã xác nhận** kèm vận đơn. Tiệm không cần duyệt lại.
- Hệ thống kiểm tra mỗi **10 giây**, nên sau mỗi thao tác đợi khoảng 10 giây rồi tải lại trang.

---

## Kịch bản 1: Đặt định kỳ 2 tiệm → 1 duyệt, 1 từ chối → kỳ 1 tự tạo đơn

**Bước 1. Baker gửi yêu cầu** (đăng nhập `lananh.baker`)

1. **Cửa hàng** → **Croissant Bơ Pháp** → số lượng **2** → **Thêm vào giỏ**.
2. **Cửa hàng** → **Bánh Bông Lan Trứng Muối** → số lượng **1** → **Thêm vào giỏ**.
3. Giỏ hàng → **Đặt hàng**.
   ✅ Có mục **Cách đặt** với 2 lựa chọn: *Mua một lần* / *Đặt định kỳ*.
4. Chọn **Đặt định kỳ**, rồi điền:
   - Tần suất **Mỗi tháng 2 lần**
   - Trong **1 tháng**
   - Ngày giao kỳ đầu là **hôm nay**

   ✅ Bên phải ghi **Mỗi kỳ (2 món)**, tổng **135.000đ**, **Số kỳ: 2**, **Dự kiến cả đợt 270.000đ**.
5. Điền địa chỉ như khi đặt đơn thường → **Gửi đặt định kỳ**.
   ✅ Sang trang yêu cầu `DK-...`:
   - Trạng thái **Chờ tiệm duyệt**, có đồng hồ đếm ngược 1 tiếng.
   - **Lịch giao** có 2 kỳ: hôm nay và 14 ngày sau.
   - Cả 2 món ghi **Chờ tiệm duyệt**.
   - Giỏ hàng không còn 2 món vừa đặt.

**Bước 2. Sunrise duyệt** (đăng nhập `vendor.mattroi`)

1. Menu trái **Đặt định kỳ** → lọc **Cần tiệm duyệt** → mở yêu cầu của *Võ Lan Anh*.
   ✅ Chỉ thấy món Croissant, có đồng hồ hạn duyệt và lịch 2 kỳ.
2. Bấm **Duyệt cho cả đợt**.
   ✅ Hiện *"Tiệm đã trả lời. Yêu cầu đang chờ các tiệm khác."*

**Bước 3. Hoa Sen từ chối** (đăng nhập `vendor.hoasen`)

1. **Đặt định kỳ** → **Cần tiệm duyệt** → mở yêu cầu của *Võ Lan Anh* → **Từ chối**.
2. Ghi lý do `Không nhận làm định kỳ` → xác nhận.

**Bước 4. Baker xem lại** (đăng nhập `lananh.baker`, đợi khoảng 10 giây)

✅ Menu tài khoản → **Đặt định kỳ** → mở yêu cầu:
- Trạng thái **Đang giao định kỳ**.
- Bông lan bị gạch, ghi **Tiệm từ chối** kèm lý do. **Mỗi kỳ** còn **70.000đ**.
- Kỳ 1 ghi **Đã tạo đơn**, có link **Đơn BM...**.
- Kỳ 2 ghi **Chưa tới** và **không có** nút *Bỏ qua kỳ này* (kỳ cuối còn lại không bỏ qua được).

**Bước 5. Mở đơn của kỳ 1** (bấm link **Đơn BM...**)

✅ Đơn được tạo tự động:
- Trạng thái **Đã xác nhận**, không có đồng hồ hạn duyệt, không có nút huỷ.
- Dòng *"Đơn tạo tự động cho kỳ 1/2 của đặt định kỳ DK-..."*, nút **Xem đặt định kỳ** quay về yêu cầu.
- Chỉ có Croissant ×2, tổng **70.000đ**. Có mục **Theo dõi giao hàng** ở bước *Đã tạo vận đơn*.

**Bước 6. Kiểm tra phía tiệm và admin**

1. `vendor.mattroi` → **Đơn hàng**: thấy đơn đó ở trạng thái **Đã xác nhận**. Mở ra có dòng *"…tiệm đã duyệt từ đầu nên không cần duyệt lại"*.
2. `vendor.mattroi` → **Tồn kho**: Croissant còn **58** (đã trừ 2).
3. `admin` → **Giao hàng**: đơn này nằm đầu danh sách, giao như đơn thường.

---

## Kịch bản 2: Duyệt yêu cầu mẫu (dùng dữ liệu có sẵn)

1. `vendor.hoasen` → **Đặt định kỳ** → **Cần tiệm duyệt** → mở yêu cầu của *Võ Lan Anh* (Croissant ×20 + Bông lan ×5).
   ✅ Chỉ thấy Bông lan ×5, **Tiền phần của tiệm mỗi kỳ 325.000đ**. Lịch sử có dòng *"Sunrise Patisserie đã duyệt 1 món"*.
2. Bấm **Duyệt cho cả đợt**.
3. `lananh.baker` mở yêu cầu đó.
   ✅ Trạng thái **Đã duyệt, chờ bắt đầu**, **Mỗi kỳ 1.025.000đ**, 3 kỳ (mỗi tháng 1 lần), kỳ đầu sau 3 ngày. Chưa kỳ nào có đơn.

## Kịch bản 3: Bỏ qua kỳ (dùng yêu cầu mẫu đang giao)

Đăng nhập `lananh.baker` → **Đặt định kỳ** → mở yêu cầu **Đang giao định kỳ** (Su kem ×30 + Trung thu ×6).

✅ Có sẵn:
- 4 kỳ, mỗi tháng 2 lần.
- Kỳ 1 **Đã tạo đơn**, đơn đó ở trạng thái **Hoàn thành**.
- Kỳ 3 **Bỏ qua**.
- Kỳ 2 và 4 **Chưa tới**; kỳ 2 có nhãn **Kỳ tới**.

1. Ở kỳ 2 bấm **Bỏ qua kỳ này** → **Bỏ qua kỳ này**.
   ✅ Báo *"Đã bỏ qua kỳ 2 (…)"*. Kỳ 2 thành **Bỏ qua**, kỳ 4 thành **Kỳ tới**. Lịch sử có *"Bỏ qua kỳ 2"*.
2. ✅ Kỳ 4 **không có** nút bỏ qua, vì đây là kỳ cuối còn lại.

## Kịch bản 4: Huỷ cả yêu cầu (đăng nhập `lananh.baker`)

1. **Cửa hàng** → **Bánh Su Kem** → **Mua ngay** → **Đặt hàng** → **Đặt định kỳ**: mỗi tháng 1 lần, 3 tháng, bắt đầu **ngày mai** → **Gửi đặt định kỳ**.
2. Ở kỳ 2 bấm **Bỏ qua kỳ này** → xác nhận.
3. Bấm **Huỷ đặt định kỳ** → ghi lý do `Tiệm tạm nghỉ` → **Huỷ đặt định kỳ**.
   ✅ Trạng thái **Đã huỷ**:
   - Kỳ 1 và 3 thành **Đã huỷ**, kỳ 2 giữ **Bỏ qua**.
   - Không còn nút huỷ, không còn nút bỏ qua.
   - Lịch sử có *"Tiệm tạm nghỉ · Huỷ 2 kỳ chưa tới"*.
4. `vendor.mattroi` mở yêu cầu này.
   ✅ Trạng thái **Đã huỷ**, không còn nút duyệt.

## Kịch bản 5: Hết hạn duyệt

**a) Một tiệm duyệt, tiệm kia im lặng**

1. `lananh.baker` đặt định kỳ **Croissant ×1** + **Bông lan ×1**, bắt đầu **ngày mai**.
2. `vendor.mattroi` **duyệt**. `vendor.hoasen` **không làm gì**.
3. Cho hết hạn ngay (xem **Mẹo 2** bên dưới, khỏi đợi 1 tiếng) → `lananh.baker` mở lại yêu cầu.
   ✅ Kết quả:
   - Trạng thái **Đã duyệt, chờ bắt đầu**.
   - Bông lan ghi **Tiệm không phản hồi**, bị gạch. **Mỗi kỳ** còn **35.000đ**.
   - Lịch sử có *"Hết hạn duyệt: Hoa Sen Bakery không phản hồi 1 món"*.
4. `vendor.hoasen` mở yêu cầu đó.
   ✅ Thấy *"Tiệm không duyệt trước hạn…"*, không còn nút duyệt.

**b) Không tiệm nào duyệt**

1. `lananh.baker` đặt định kỳ **Bánh Su Kem ×5**, bắt đầu ngày mai. Không tiệm nào duyệt.
2. Cho hết hạn ngay (**Mẹo 2**).
   ✅ Yêu cầu thành **Quá hạn duyệt**, có thông báo hết hạn. Mọi kỳ **Đã huỷ**.

## Kịch bản 6: Thiếu hàng ở một kỳ

1. `lananh.baker` đặt định kỳ **Croissant ×40**: mỗi tháng 2 lần, 1 tháng, bắt đầu **hôm nay**. `vendor.mattroi` duyệt.
   ✅ Kỳ 1 tạo đơn **Đã xác nhận**, tồn kho Croissant giảm 40.
2. Cho kỳ 2 tới ngày ngay (**Mẹo 1** bên dưới).
   ✅ Đơn kỳ 2 có:
   - Trạng thái **Bị từ chối**.
   - Croissant ghi **Tiệm từ chối**, lý do *"Không đủ hàng cho kỳ này"*.
   - Tổng **0đ**, không có vận đơn, tồn kho không đổi.
3. Mở lại yêu cầu.
   ✅ Trạng thái **Đã xong**, vì kỳ 2 là kỳ cuối.

## Kịch bản 7: Các trường hợp bị chặn

| Thử | Tài khoản | Kết quả đúng |
|---|---|---|
| Thêm món vào giỏ → **Đặt hàng** | `thaovy` | Không có mục **Cách đặt**, chỉ đặt đơn thường |
| Ô ngày giao kỳ đầu | `lananh.baker` | Không chọn được ngày trước hôm nay hay quá 60 ngày sau |
| **Sản phẩm** → xoá **Bánh Su Kem** | `vendor.mattroi` | Báo *"Không thể xoá … vì vẫn còn đơn hàng hoặc đặt định kỳ chưa xong…"* (Su kem nằm trong yêu cầu mẫu đang giao) |
| Bấm **Duyệt** khi yêu cầu vừa quá hạn (trước khi trang kịp tải lại) | vendor | Báo *"Đã quá hạn duyệt yêu cầu này…"* |
| Mở yêu cầu **Đã xong** / **Đã huỷ** / **Quá hạn duyệt** | `lananh.baker` | Không có nút huỷ, không có nút bỏ qua |

---

## Mẹo

Lấy 8 ký tự sau `DK-` của yêu cầu, viết **chữ thường**, thay vào `abcd1234` ở các lệnh dưới. Khoảng 10 giây sau tải lại trang là thấy kết quả.

**Mẹo 1. Cho kỳ tiếp theo tới ngày ngay:**

```sh
docker exec bakers_postgres psql -U bakers_admin -d bakers_marketplace -c "UPDATE pre_order_cycles SET scheduled_at = now() WHERE id = (SELECT id FROM pre_order_cycles WHERE current_status = 'SCHEDULED' AND pre_order_request_id::text LIKE 'abcd1234%' ORDER BY cycle_number LIMIT 1);"
```

**Mẹo 2. Cho yêu cầu hết hạn duyệt ngay** (khỏi đợi 1 tiếng):

```sh
docker exec bakers_postgres psql -U bakers_admin -d bakers_marketplace -c "UPDATE pre_order_requests SET approval_deadline = now() WHERE id::text LIKE 'abcd1234%';"
```

## Lưu ý

- **Hạn duyệt:** chỉnh ở `PRE_ORDER_APPROVAL_WINDOW_MINUTES` trong `be/src/models/pre-orders/pre-orders.model.ts`. Đang để 60 (1 tiếng); chạy thật thì đổi thành `24 * 60`. Sửa xong chạy `docker compose up -d --build backend`.
- **Giá:** mọi kỳ tính theo giá lúc gửi yêu cầu.
- **Tồn kho:** gửi yêu cầu chưa trừ kho; mỗi kỳ trừ kho lúc tạo đơn.
- **Thanh toán:** chưa làm. DB đã có sẵn cột hình thức thanh toán (mặc định *trả khi nhận mỗi kỳ*, *tiền mặt*).
- Máy đồng đội cũng phải dựng lại DB như mục **Chuẩn bị**.
