# Flash Sale — frontend

Ứng dụng React cho API xác thực và vai trò của backend Spring Boot (`http://localhost:8088`).

## Chạy

Backend phải đang lắng nghe cổng `8088`. CORS của backend đã cho `http://localhost:3000`.

```bash
cd flash-sale-fe
npm install
npm run dev
```

Mở [http://localhost:3002](http://localhost:3002). Cổng 3000 trên máy này thường đã bị Grafana chiếm. Backend cho phép CORS cả `3000` và `3002`. Vite chuyển `/api` và `/actuator` sang backend, nên trình duyệt gọi cùng origin.

Tài khoản seed:

Đăng nhập bằng email.

| Email | Mật khẩu | Vai trò |
| --- | --- | --- |
| `admin@example.com` | `password` | `ADMIN` |
| `user@example.com` | `password` | `CUSTOMER` |

## Cấu trúc

```
src/
  app/            Khởi động: theme, provider, router, layout, chặn trang
  core/
    config/       Biến môi trường
    http/         Axios, gắn access token, tự làm mới khi 401
    auth/         Phiên đăng nhập (Zustand), đọc JWT
    query/        TanStack Query
    realtime/     STOMP, chỉ nối khi có VITE_STOMP_URL
  modules/
    auth/         Đăng nhập, đăng ký, đăng xuất, đổi mật khẩu
    account/      Vai trò của tôi, quyền, xin thêm hoặc gỡ vai trò
    admin/        Duyệt yêu cầu, cấp thẳng và gỡ vai trò
    dashboard/    Tổng quan phiên và biểu đồ quyền
  shared/         Kiểu dùng chung, hằng số, component nhỏ
```

Module mới (sản phẩm, giỏ, đơn) thêm thư mục trong `modules/`, đăng route trong `app/router/router.tsx`, và thêm mục menu trong `app/layouts/AppLayout.tsx`. `core` không chứa màn hình nghiệp vụ.

## Phiên đăng nhập

Access token và refresh token nằm trong Zustand, lưu `localStorage` khóa `flash-sale.session`. Mọi request qua `http` gắn `Authorization: Bearer`. Gặp `401` thì gọi `POST /api/auth/refresh` một lần, các request đang chờ dùng chung lần làm mới đó. Refresh thất bại thì xóa phiên và về trang đăng nhập.

Đổi mật khẩu và đăng xuất làm thu hồi refresh token phía server, nên ứng dụng xóa phiên cục bộ và yêu cầu đăng nhập lại.

Menu quản trị đọc `GET /api/me/roles`. Backend nạp quyền từ database mỗi request, không chỉ dựa vào claim trong JWT.

## Biến môi trường

| Biến | Ý nghĩa |
| --- | --- |
| `VITE_API_BASE_URL` | Để trống khi dùng proxy Vite. Đặt URL đầy đủ khi build tách khỏi backend. |
| `VITE_STOMP_URL` | Broker STOMP, ví dụ `ws://localhost:8088/ws`. Để trống thì không mở kết nối. |

## API đang gắn màn hình

| Màn hình | API |
| --- | --- |
| Đăng nhập bằng email | `POST /api/auth/login` |
| Đăng ký | `POST /api/auth/register` |
| Quên / đặt lại mật khẩu | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Đăng xuất | `POST /api/auth/logout` |
| Làm mới token | `POST /api/auth/refresh` (interceptor) |
| Hồ sơ | `GET /api/me/profile`, `PUT /api/me/profile` |
| Đổi mật khẩu | `POST /api/auth/change-password` |
| Vai trò của tôi | `GET /api/me/roles` |
| Quyền của tôi | `GET /api/me/permissions` |
| Vai trò được xin | `GET /api/roles/requestable` |
| Gửi yêu cầu | `POST /api/role-requests` |
| Lịch sử của tôi | `GET /api/role-requests/me` |
| Hủy yêu cầu | `POST /api/role-requests/{id}/cancel` |
| Admin xem yêu cầu | `GET /api/admin/role-requests` |
| Duyệt / từ chối | `POST /api/admin/role-requests/{id}/approve` và `.../reject` |
| Cấp / gỡ thẳng | `POST /api/admin/users/{username}/roles`, `DELETE /api/admin/users/{username}/roles/{code}` |
| Tìm / khóa tài khoản | `GET /api/admin/users`, `POST /api/admin/users/{username}/lock`, `POST .../unlock` |
| Sức khỏe | `GET /actuator/health` |

Chưa có API sản phẩm, giỏ hàng, đơn flash sale. Màn cấp và gỡ vai trò nhập username.
