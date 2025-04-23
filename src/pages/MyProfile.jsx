import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyProfile = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [mode, setMode] = useState('view'); // 'view', 'edit', hoặc 'change-password'
  const [userData, setUserData] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    phone_num: '',
    email: '',
    status: '',
    creation_at: '',
    modified_at: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Trạng thái cho modal đăng ký KOL
  const [isKolModalOpen, setIsKolModalOpen] = useState(false);
  const [kolData, setKolData] = useState({
    platform: 'Facebook', // Mặc định là Facebook
    profile_link: '',
    reason: '',
  });

  // Lấy thông tin người dùng khi component được mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(backendUrl + '/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUserData({
            user_id: response.data.user.id,
            first_name: response.data.user.first_name,
            last_name: response.data.user.last_name,
            phone_num: response.data.user.phone_num,
            email: response.data.user.email,
            status: response.data.user.status,
            creation_at: response.data.user.creation_at,
            modified_at: response.data.user.modified_at,
          });
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error('Không thể tải thông tin hồ sơ.');
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token, backendUrl]);

  // Xử lý thay đổi giá trị trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Xử lý thay đổi giá trị trong form đăng ký KOL
  const handleKolInputChange = (e) => {
    const { name, value } = e.target;
    setKolData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Xử lý gửi form cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        backendUrl + '/api/users/profile',
        {
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_num: userData.phone_num,
          password: currentPassword, // Gửi mật khẩu hiện tại để xác thực
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Cập nhật hồ sơ thành công!');
        setCurrentPassword(''); // Xóa mật khẩu hiện tại sau khi cập nhật
        setMode('view'); // Chuyển về chế độ xem
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Không thể cập nhật hồ sơ.');
    }
  };

  // Xử lý thay đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        backendUrl + '/api/users/change-password',
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setMode('view'); // Chuyển về chế độ xem
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Không thể đổi mật khẩu.');
    }
  };

  // Xử lý đăng ký KOL
  const handleKolRegister = async (e) => {
    e.preventDefault();
    try {
      // Lấy user_id từ localStorage
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        toast.error('Không tìm thấy user_id. Vui lòng đăng nhập lại.');
        return;
      }

      // Gửi yêu cầu đăng ký KOL
      const response = await axios.post(
        backendUrl + '/api/users/registerinfluencer',
        {
          user_id: userId,
          status: 'pending',
          status_reason: kolData.reason,
          tier_id: 1, // Hạng thường
          social_link: {
            platform: kolData.platform,
            profile_link: kolData.profile_link,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Thêm vai trò KOL (role_id: 3) vào bảng user_role
        await axios.post(
          backendUrl + '/api/users/assignrole',
          {
            user_id: userId,
            role_id: 3, // Vai trò KOL
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success('Đăng ký KOL thành công! Vui lòng chờ xét duyệt.');
        setKolData({ platform: 'Facebook', profile_link: '', reason: '' }); // Reset form
        setIsKolModalOpen(false); // Đóng modal
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Không thể đăng ký KOL.');
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Hồ Sơ Của Tôi</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {mode === 'view' ? (
        <div className="w-full flex flex-col gap-4">
          <div>
            <p className="font-semibold">Tên:</p>
            <p>{userData.first_name}</p>
          </div>
          <div>
            <p className="font-semibold">Họ:</p>
            <p>{userData.last_name}</p>
          </div>
          <div>
            <p className="font-semibold">Số Điện Thoại:</p>
            <p>{userData.phone_num}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>{userData.email}</p>
          </div>
          <div>
            <p className="font-semibold">Trạng Thái:</p>
            <p>{userData.status}</p>
          </div>
          <div>
            <p className="font-semibold">Ngày Tạo:</p>
            <p>{new Date(userData.creation_at).toLocaleString('vi-VN')}</p>
          </div>
          <div>
            <p className="font-semibold">Cập Nhật Lần Cuối:</p>
            <p>{new Date(userData.modified_at).toLocaleString('vi-VN')}</p>
          </div>
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => setMode('edit')}
              className="w-full bg-blue-500 text-white font-light px-8 py-2 mt-4"
            >
              Chỉnh Sửa Hồ Sơ
            </button>
            <button
              onClick={() => setMode('change-password')}
              className="w-full bg-green-500 text-white font-light px-8 py-2 mt-4"
            >
              Đổi Mật Khẩu
            </button>
            <button
              onClick={() => setIsKolModalOpen(true)}
              className="w-full bg-purple-500 text-white font-light px-8 py-2 mt-4"
            >
              Đăng Ký KOL
            </button>
          </div>
        </div>
      ) : mode === 'edit' ? (
        <form onSubmit={handleUpdate} className="w-full flex flex-col gap-4">
          <input
            type="text"
            name="first_name"
            value={userData.first_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Tên"
            required
          />
          <input
            type="text"
            name="last_name"
            value={userData.last_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Họ"
            required
          />
          <input
            type="tel"
            name="phone_num"
            value={userData.phone_num}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Số Điện Thoại"
            required
          />
          <input
            type="email"
            value={userData.email}
            className="w-full px-3 py-2 border border-gray-800 bg-gray-100"
            placeholder="Email"
            disabled
          />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Mật Khẩu Hiện Tại"
            required
          />
          <div className="w-full flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPassword('');
                setMode('view');
              }}
              className="w-full bg-gray-500 text-white font-light px-8 py-2 mt-4"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="w-full bg-black text-white font-light px-8 py-2 mt-4"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="w-full flex flex-col gap-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Mật Khẩu Hiện Tại"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Mật Khẩu Mới"
            required
          />
          <div className="w-full flex justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPassword('');
                setNewPassword('');
                setMode('view');
              }}
              className="w-full bg-gray-500 text-white font-light px-8 py-2 mt-4"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="w-full bg-black text-white font-light px-8 py-2 mt-4"
            >
              Đổi Mật Khẩu
            </button>
          </div>
        </form>
      )}

      {/* Modal Đăng Ký KOL */}
      {isKolModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-[90%] sm:max-w-md">
            <h2 className="text-xl font-semibold mb-4">Đăng Ký KOL</h2>
            <form onSubmit={handleKolRegister} className="flex flex-col gap-4">
              <div>
                <label className="block font-semibold mb-1">Chọn Mạng Xã Hội:</label>
                <select
                  name="platform"
                  value={kolData.platform}
                  onChange={handleKolInputChange}
                  className="w-full px-3 py-2 border border-gray-800"
                  required
                >
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Link Hồ Sơ:</label>
                <input
                  type="url"
                  name="profile_link"
                  value={kolData.profile_link}
                  onChange={handleKolInputChange}
                  className="w-full px-3 py-2 border border-gray-800"
                  placeholder="https://www.facebook.com/yourprofile"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lý Do Đăng Ký:</label>
                <textarea
                  name="reason"
                  value={kolData.reason}
                  onChange={handleKolInputChange}
                  className="w-full px-3 py-2 border border-gray-800"
                  placeholder="Tại sao bạn muốn trở thành KOL?"
                  required
                />
              </div>
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setKolData({ platform: 'Facebook', profile_link: '', reason: '' });
                    setIsKolModalOpen(false);
                  }}
                  className="w-full bg-gray-500 text-white font-light px-8 py-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-full bg-purple-500 text-white font-light px-8 py-2"
                >
                  Gửi Đăng Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;