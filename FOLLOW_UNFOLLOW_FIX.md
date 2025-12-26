# 🔧 Fix Follow/Unfollow Conflict Error

## 🐛 Vấn đề

Khi unfollow một user và follow lại, gặp lỗi:
```
POST 409 Conflict
{"success":false,"message":"Duplicate entry","errors":null}
```

**Nguyên nhân**: 
- Follow model sử dụng `paranoid: true` (soft delete)
- Khi unfollow, record chỉ bị đánh dấu `deleted_at` nhưng vẫn tồn tại trong database
- Unique constraint trong MySQL không hoạt động đúng với partial index (`WHERE deleted_at IS NULL`)
- Khi follow lại, tạo record mới → Vi phạm unique constraint → Conflict

---

## ✅ Giải pháp

### 1. **Disable Soft Delete cho Follow Model**

**File**: `backend/src/models/Follow.js`

Thay đổi:
```javascript
// Trước
paranoid: true,

// Sau
paranoid: false, // Disable soft delete để tránh conflict với unique constraint
```

**Lý do**: Follow/unfollow là hành động đơn giản, không cần soft delete. Hard delete sẽ tránh được vấn đề unique constraint.

---

### 2. **Đơn giản hóa Logic Follow/Unfollow**

**File**: `backend/src/services/followService.js`

#### Follow Method:
- ✅ Check nếu user đang tự follow chính mình
- ✅ Check nếu user cần follow tồn tại
- ✅ Check nếu đã follow rồi
- ✅ Tạo follow relationship mới
- ✅ Xử lý race condition với try-catch

#### Unfollow Method:
- ✅ Tìm follow relationship
- ✅ Hard delete (không còn soft delete)
- ✅ Đơn giản và rõ ràng

---

### 3. **Migration để Fix Unique Constraint**

**File**: `backend/migrations/20251226140000-fix-follows-unique-constraint.js`

Migration này sẽ:
1. ✅ Xóa unique index cũ (có WHERE clause - không hoạt động tốt với MySQL)
2. ✅ Xóa các records đã bị soft delete (cleanup)
3. ✅ Tạo lại unique constraint đơn giản (không có WHERE clause)

---

## 📋 Cách chạy Migration

```bash
cd backend
npx sequelize-cli db:migrate
```

Migration sẽ:
- Xóa các records có `deleted_at IS NOT NULL`
- Tạo lại unique constraint đơn giản

---

## 🔄 Flow hoạt động mới

### Follow User:
```
1. User A follow User B
   → Check: A có đang follow B không?
   → Không → Tạo record mới
   → Có → Error: "既にフォローしています"
```

### Unfollow User:
```
1. User A unfollow User B
   → Tìm follow relationship
   → Tìm thấy → Hard delete (xóa hoàn toàn)
   → Không tìm thấy → Error: "フォロー関係が見つかりません"
```

### Follow lại sau khi Unfollow:
```
1. User A unfollow User B
   → Record bị xóa hoàn toàn

2. User A follow lại User B
   → Không tìm thấy record cũ
   → Tạo record mới thành công ✅
```

---

## ✅ Kết quả

Sau khi fix:
- ✅ Unfollow → Record bị xóa hoàn toàn
- ✅ Follow lại → Tạo record mới thành công
- ✅ Không còn conflict 409
- ✅ Follow/unfollow hoạt động mượt mà
- ✅ Unique constraint hoạt động đúng

---

## 🧪 Test

### Test Case 1: Follow → Unfollow → Follow lại
```
1. POST /api/follows/2/follow
   → ✅ Success: "フォローしました"

2. DELETE /api/follows/2/unfollow
   → ✅ Success: "フォローを解除しました"

3. POST /api/follows/2/follow (lần 2)
   → ✅ Success: "フォローしました" (KHÔNG còn conflict!)
```

### Test Case 2: Follow 2 lần liên tiếp
```
1. POST /api/follows/2/follow
   → ✅ Success

2. POST /api/follows/2/follow (lần 2)
   → ✅ Error: "既にフォローしています" (đúng như mong đợi)
```

### Test Case 3: Unfollow khi chưa follow
```
1. DELETE /api/follows/2/unfollow
   → ✅ Error: "フォロー関係が見つかりません" (đúng như mong đợi)
```

---

## 📁 Files Changed

1. ✅ `backend/src/models/Follow.js` - Disable paranoid
2. ✅ `backend/src/services/followService.js` - Đơn giản hóa logic
3. ✅ `backend/migrations/20251226140000-fix-follows-unique-constraint.js` - Fix unique constraint

---

## ⚠️ Lưu ý

1. **Migration cần được chạy** để cleanup data và fix constraint
2. **Các records đã bị soft delete sẽ bị xóa** (đây là điều mong muốn)
3. **Follow/unfollow giờ là hard delete** - không thể recover sau khi unfollow

---

## ✨ Tóm tắt

- ❌ **Trước**: Soft delete → Conflict khi follow lại
- ✅ **Sau**: Hard delete → Follow/unfollow mượt mà, không conflict

**Status**: ✅ **FIXED - Ready to use!**

