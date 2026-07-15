// ============================================================================
// AdminError — Hiển thị lỗi rõ ràng thay vì để Server Component ném exception
// (Next.js sẽ hiện "server-side exception" vô nghĩa). Dùng khi Supabase
// không khởi tạo được (thiếu env) hoặc query lỗi.
// ============================================================================

export function AdminError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      <p className="font-semibold">Không thể tải dữ liệu quản trị.</p>
      <p className="mt-1 text-red-600/90">{message}</p>
      <p className="mt-3 text-xs text-red-600/70">
        Kiểm tra biến môi trường NEXT_PUBLIC_SUPABASE_URL và
        SUPABASE_SERVICE_ROLE_KEY đã được cấu hình trên môi trường deploy.
      </p>
    </div>
  );
}