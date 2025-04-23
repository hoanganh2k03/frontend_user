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
        toast.error('Failed to load profile data.');
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
        toast.success('Profile updated successfully!');
        setCurrentPassword(''); // Xóa mật khẩu hiện tại sau khi cập nhật
        setMode('view'); // Chuyển về chế độ xem
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to update profile.');
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
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setMode('view'); // Chuyển về chế độ xem
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to change password.');
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">My Profile</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {mode === 'view' ? (
        <div className="w-full flex flex-col gap-4">
          <div>
            <p className="font-semibold">First Name:</p>
            <p>{userData.first_name}</p>
          </div>
          <div>
            <p className="font-semibold">Last Name:</p>
            <p>{userData.last_name}</p>
          </div>
          <div>
            <p className="font-semibold">Phone Number:</p>
            <p>{userData.phone_num}</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>{userData.email}</p>
          </div>
          <div>
            <p className="font-semibold">Status:</p>
            <p>{userData.status}</p>
          </div>
          <div>
            <p className="font-semibold">Created At:</p>
            <p>{new Date(userData.creation_at).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-semibold">Last Modified:</p>
            <p>{new Date(userData.modified_at).toLocaleString()}</p>
          </div>
          <div className="w-full flex justify-between gap-2">
            <button
              onClick={() => setMode('edit')}
              className="w-full bg-blue-500 text-white font-light px-8 py-2 mt-4"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setMode('change-password')}
              className="w-full bg-green-500 text-white font-light px-8 py-2 mt-4"
            >
              Change Password
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
            placeholder="First Name"
            required
          />
          <input
            type="text"
            name="last_name"
            value={userData.last_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Last Name"
            required
          />
          <input
            type="tel"
            name="phone_num"
            value={userData.phone_num}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Phone Number"
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
            placeholder="Current Password"
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
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-black text-white font-light px-8 py-2 mt-4"
            >
              Save Changes
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
            placeholder="Current Password"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="New Password"
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
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-black text-white font-light px-8 py-2 mt-4"
            >
              Change Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MyProfile;