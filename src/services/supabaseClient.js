import { createClient } from "@supabase/supabase-js";

// Lấy URL và key từ environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file");
}

// Tạo Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export các hàm xác thực
export const authService = {
  // Đăng ký tài khoản mới
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // Lưu dữ liệu người dùng bổ sung
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data, message: "Tài khoản đã được tạo. Vui lòng kiểm tra email để xác nhận." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Đăng nhập
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data, message: "Đăng nhập thành công!" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Khôi phục mật khẩu
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data, message: "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Cập nhật mật khẩu
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data, message: "Mật khẩu đã được cập nhật thành công!" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Đăng xuất
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, message: "Đã đăng xuất!" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lấy session hiện tại
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw new Error(error.message);
      }

      return session;
    } catch (error) {
      console.error("Lỗi lấy session:", error.message);
      return null;
    }
  },

  // Đăng nhập qua Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/main-menu`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data, message: "Redirect to Google..." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Đăng nhập qua Facebook
  async signInWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/main-menu`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, data, message: "Redirect to Facebook..." };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Lắng nghe thay đổi trạng thái xác thực
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
