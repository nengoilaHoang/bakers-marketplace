# Test module Đơn hàng

> Branch `thuan/feat/admin-module`, chưa commit. Mật khẩu mọi tài khoản: `Bakers@123`.
> Làm lần lượt từ kịch bản 1 tới 6. Đổi tài khoản: menu tài khoản góc phải → **Đăng xuất** → đăng nhập lại.

## Chuẩn bị

Lần đầu (migration gốc có thay đổi) phải dựng lại DB, mất dữ liệu local:

```sh
cd be
npm run db:rollback -- --all && npm run db:migrate
npm run db:seed                 # xoá dữ liệu cũ, nạp dữ liệu mẫu
cd .. && docker compose up -d --build
```

Rollback lỗi thì xoá DB `bakers_marketplace`, tạo lại rồi chạy `npm run db:migrate` và `npm run db:seed`.

Mở http://localhost:3000. Muốn làm lại từ đầu thì chạy lại `npm run db:seed`.

| Tài khoản | Là ai |
|---|---|
| `thaovy@example.com` | Khách, **chưa có đơn nào**, dùng để đặt đơn mới |
| `minhanh@example.com`, `baongoc@example.com` | Khách, có sẵn đơn mẫu |
| `vendor.mattroi@example.com` | Tiệm **Sunrise Patisserie** |
| `vendor.hoasen@example.com` | Tiệm **Hoa Sen Bakery** |
| `admin@example.com` | Admin |

| Sản phẩm | Tiệm | Giá |
|---|---|---|
| Croissant Bơ Pháp | Sunrise | 35.000đ / cái |
| Tart Trứng Bồ Đào Nha | Sunrise | 25.000đ / cái |
| Bánh Su Kem | Sunrise | 8.000đ / cái |
| Bánh Bông Lan Trứng Muối | Hoa Sen | 65.000đ / hộp |
| Bánh Trung Thu Thập Cẩm | Hoa Sen | 85.000đ / cái |
| Bánh Mì Hoa Cúc | Hoa Sen | **hết hàng** |

**Hạn duyệt:** tiệm phải trả lời trong **5 phút** sau khi khách đặt (đang để ngắn để test). Quá hạn thì món chưa duyệt thành **Tiệm không phản hồi** (bỏ khỏi đơn, trả kho). Nếu còn món được duyệt, đơn vẫn **Đã xác nhận**. Nếu không còn món nào, đơn thành **Quá hạn duyệt**.

> ⏱ Ở kịch bản 1 và 2, vendor phải bấm kịp trong 5 phút. Mẹo: mở sẵn cửa sổ ẩn danh đăng nhập vendor. Muốn lâu hơn thì đổi `ORDER_APPROVAL_WINDOW_MINUTES` trong `be/src/models/orders/orders.model.ts`, rồi `docker compose up -d --build backend`.

---

## Kịch bản 1: Đặt đơn 2 tiệm → 1 tiệm duyệt, 1 tiệm từ chối → giao → đánh giá

**Bước 1. Khách đặt hàng** (đăng nhập `thaovy`)

1. **Cửa hàng** → **Croissant Bơ Pháp** → số lượng **2** → **Thêm vào giỏ**.
   ✅ Trang sản phẩm có tên tiệm *Sunrise Patisserie*.
2. **Cửa hàng** → **Bánh Bông Lan Trứng Muối** → số lượng **1** → **Thêm vào giỏ**.
3. Bấm icon giỏ hàng.
   ✅ Có 2 ô riêng: *Sunrise Patisserie* và *Hoa Sen Bakery*. Bỏ tick ô của một tiệm thì tổng tiền giảm; tick lại cả 2.
4. **Đặt hàng** → điền số điện thoại `0901234567`, địa chỉ `12 Lê Lợi`.
   Chọn tỉnh **Thành phố Hồ Chí Minh** → chọn phường **Phường Sài Gòn** → **Đặt hàng**.
   ✅ Chưa chọn tỉnh thì ô phường bị khoá, không gõ tay được.
5. ✅ Hiện **Đặt hàng thành công!** Bấm **Xem đơn của tôi** → mở đơn:
   - Trạng thái **Chờ xác nhận**, tổng **135.000đ**.
   - Cả 2 món ghi **Chờ tiệm duyệt**.
   - Giỏ hàng không còn 2 món vừa đặt.

**Bước 2. Tiệm Sunrise duyệt** (đăng nhập `vendor.mattroi`)

1. **Đơn hàng** → lọc **Cần tiệm duyệt** → mở đơn của *Phạm Thảo Vy*.
   ✅ Chỉ thấy món Croissant, không thấy món của Hoa Sen.
2. Bấm **Duyệt**.
   ✅ Hiện *"Tiệm đã trả lời. Đơn đang chờ các tiệm khác."*

**Bước 3. Tiệm Hoa Sen từ chối** (đăng nhập `vendor.hoasen`)

1. **Đơn hàng** → **Cần tiệm duyệt** → mở đơn của *Phạm Thảo Vy* → **Từ chối**.
2. Ghi lý do `Tiệm hết trứng muối hôm nay` → xác nhận.
   ✅ Không ghi lý do thì không từ chối được.

**Bước 4. Khách xem lại** (đăng nhập `thaovy`)

✅ Đơn chuyển sang **Đã xác nhận**:
- Croissant: **Tiệm đã duyệt**.
- Bông lan: bị gạch, ghi **Tiệm từ chối** kèm lý do.
- Tổng còn **70.000đ**.
- Có mục **Theo dõi giao hàng** ở bước *Đã tạo vận đơn*.
- Không còn nút **Huỷ đơn**.

**Bước 5. Admin giao hàng** (đăng nhập `admin`)

1. **Giao hàng** → bấm **Cập nhật** ở đơn của *Phạm Thảo Vy*.
   ✅ Trang chi tiết có thanh 5 bước (bước 1 *Đã tạo vận đơn* sáng, có giờ), các mốc vận chuyển, món giao, địa chỉ.
2. Ô **Cập nhật bước tiếp theo** đã điền sẵn gợi ý. Sửa thử: Địa điểm `Sunrise Patisserie, Quận 1`, Mô tả `Shipper đã lấy 2 croissant` → **Xác nhận: Đã lấy hàng**.
   ✅ Thanh sáng tới bước 2, mốc mới hiện đúng chữ vừa nhập, form tự điền gợi ý cho bước kế.
3. Làm tiếp tới **Đã giao hàng** (bước cuối gợi ý địa điểm là phường, tỉnh của khách).
   ✅ Báo "Đã giao hàng xong, đơn chuyển sang Hoàn thành". Đơn biến khỏi bộ lọc *Đang giao*, chuyển qua *Đã giao*.
4. `thaovy` mở đơn → mục **Theo dõi giao hàng** có cùng thanh 5 bước và các mốc admin đã nhập.

**Bước 6. Khách đánh giá** (đăng nhập `thaovy`)

1. Mở đơn.
   ✅ Trạng thái **Hoàn thành**, phần theo dõi đủ 5 bước.
2. Croissant → **Đánh giá** → chọn 5 sao, ghi nhận xét → **Gửi đánh giá**.
   ✅ Nút biến mất, hiện "Đánh giá ngày …". Món bông lan (bị từ chối) **không có** nút đánh giá.

---

## Kịch bản 2: Huỷ đơn và Đặt lại (đăng nhập `thaovy`)

1. **Cửa hàng** → **Tart Trứng Bồ Đào Nha** → **Mua ngay**.
   ✅ Giỏ hàng chỉ tick sẵn món tart.
2. **Đặt hàng** → nhập địa chỉ như kịch bản 1 → **Đặt hàng**.
3. Mở đơn → **Huỷ đơn** → ghi lý do `Đặt nhầm` → xác nhận.
   ✅ Đơn thành **Đã huỷ**.
4. Bấm **Đặt lại**.
   ✅ Mở giỏ hàng, món tart được thêm và tick sẵn.

## Kịch bản 3: Cả 2 tiệm từ chối → đơn Bị từ chối (dùng đơn mẫu của Bảo Ngọc)

1. `vendor.hoasen` → **Đơn hàng** → **Cần tiệm duyệt** → đơn của *Trần Bảo Ngọc* (Trung thu + Su kem) → **Từ chối** món Trung thu.
2. `vendor.mattroi` → mở cùng đơn đó → **Từ chối** món Su kem.
3. `baongoc` → **Đơn hàng của tôi** → mở đơn.
   ✅ Trạng thái **Bị từ chối**, cả 2 món bị gạch, không có vận đơn. Admin **Giao hàng** không có đơn này.

## Kịch bản 4: Xem đơn mẫu (đăng nhập `minhanh`)

Vào **Đơn hàng của tôi**, thử lọc theo trạng thái. Có sẵn 4 đơn:

| Đơn | Kiểm tra |
|---|---|
| **Chờ xác nhận** (Croissant + Bông lan) | Croissant *Tiệm đã duyệt*, Bông lan *Chờ tiệm duyệt*; có nút **Huỷ đơn** |
| **Đã xác nhận** (Trung thu ×6) | Theo dõi giao hàng ở bước *Đang vận chuyển*; không có nút huỷ |
| **Hoàn thành** (Croissant + Tart) | Croissant đã đánh giá 5 sao; Tart có nút **Đánh giá**, thử đánh giá |
| **Đã huỷ** (Su kem ×3) | Có lý do huỷ *Đặt nhầm số lượng*; bấm **Đặt lại** thử |

Muốn duyệt nốt đơn chờ: `vendor.hoasen` → **Duyệt** món Bông lan → đơn của Minh Anh thành **Đã xác nhận** và có vận đơn.

## Kịch bản 5: Hết hạn duyệt

**a) Không tiệm nào duyệt** (đăng nhập `thaovy`)

1. **Cửa hàng** → **Bánh Su Kem** → **Mua ngay** → đặt hàng.
   ✅ Dưới mã đơn có dòng "Các tiệm cần duyệt trước …" (sau lúc đặt 5 phút).
2. Đợi khoảng 5 phút rồi tải lại trang đơn (hệ thống kiểm tra mỗi 10 giây).
   ✅ Đơn thành **Quá hạn duyệt**, có thông báo hết hạn. Món ghi **Tiệm không phản hồi**, bị gạch, tổng **0đ**. Không còn nút huỷ, vẫn có **Đặt lại**.
3. `vendor.mattroi` → **Đơn hàng** → lọc **Quá hạn duyệt**.
   ✅ Thấy đơn vừa rồi, phần của tiệm ghi **Quá hạn duyệt**.

**b) Một tiệm duyệt, tiệm kia im lặng**

1. `thaovy` đặt **Croissant Bơ Pháp ×1** + **Bánh Bông Lan Trứng Muối ×1** (tổng 100.000đ).
2. Trong vòng 5 phút: `vendor.mattroi` → mở đơn → **Duyệt**. `vendor.hoasen` **không làm gì**.
   ✅ Ở danh sách đơn, vendor thấy dòng "Hạn duyệt: …".
3. Đợi hết hạn → `thaovy` mở lại đơn.
   ✅ Đơn **Đã xác nhận**, có vận đơn. Bông lan ghi **Tiệm không phản hồi**. Tổng còn **35.000đ**. Lịch sử có dòng "Hết hạn duyệt: Hoa Sen Bakery không phản hồi 1 món".
4. `vendor.hoasen` mở đơn đó.
   ✅ Thấy thông báo "Tiệm không duyệt trước hạn nên các món của tiệm đã bị bỏ khỏi đơn", không còn nút duyệt.

**c) Đơn mẫu có sẵn**

- `baongoc`: 1 đơn **Quá hạn duyệt** (Croissant ×3, Sunrise không trả lời).
- `hoangnam`: 1 đơn **Đã xác nhận** (Su kem ×10 được giao, Trung thu ×2 **Tiệm không phản hồi**). Admin thấy đơn này ở **Giao hàng**, bước *Đã tạo vận đơn*.

> Đơn mẫu đang chờ (của Minh Anh, Bảo Ngọc) có hạn 24 giờ nên không tự hết hạn, vẫn dùng để test duyệt được.

## Kịch bản 6: Các trường hợp bị chặn

| Thử | Tài khoản | Kết quả đúng |
|---|---|---|
| Mở **Bánh Mì Hoa Cúc** | bất kỳ | Hiện **Hết hàng**, không thêm vào giỏ được |
| Thêm món vào giỏ rồi **Đặt hàng** | `vendor.mattroi` hoặc `admin` | Trang đặt hàng báo *"Tài khoản cửa hàng và quản trị viên không đặt hàng được…"* |
| **Sản phẩm** → xoá **Bánh Trung Thu Thập Cẩm** | `vendor.hoasen` | Báo không xoá được vì còn đơn chưa hoàn tất có sản phẩm này |
| Mở đơn đã xác nhận / đang giao | khách | Không có nút **Huỷ đơn** |
| Bấm **Duyệt** khi đơn đã quá hạn (trước khi trang kịp tải lại) | vendor | Báo "Đã quá hạn duyệt đơn này…" |
| Đặt hàng khi chưa đăng nhập | (đăng xuất) | Giỏ hàng vẫn dùng được, bấm **Đặt hàng** thì bị đưa tới trang đăng nhập |

---

## Lưu ý

- Trang `/vendors/products/[id]` có thể báo lỗi "Release with ID … not found". Đây là lỗi phần storefront, không phải đơn hàng.
- Hệ thống kiểm tra hạn duyệt mỗi **10 giây**, nên sau khi hết hạn đợi thêm vài giây rồi tải lại trang.
