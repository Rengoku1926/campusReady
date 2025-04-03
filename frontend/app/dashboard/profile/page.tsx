"use client";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const FRONTEND_URI = process.env.NEXT_PUBLIC_FRONTEND_URI ; // Adjust as needed

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states for profile update
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [profileMessage, setProfileMessage] = useState("");

  // Form states for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User not authenticated.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${FRONTEND_URI}/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await res.json();
        setUser(data);
        // Populate the profile form with current user data
        setProfileForm({
          name: data.name,
          email: data.email,
        });
      } catch (error: any) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    setProfileMessage("");

    try {
      const res = await fetch(`${FRONTEND_URI}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update profile");
      }

      const data = await res.json();
      setUser(data);
      setProfileMessage("Profile updated successfully.");
    } catch (error: any) {
      setProfileMessage(error.message);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    setPasswordMessage("");

    try {
      const res = await fetch(`${FRONTEND_URI}/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to change password");
      }

      const data = await res.json();
      setPasswordMessage(data.message || "Password updated successfully.");
      // Optionally, clear the form fields
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error: any) {
      setPasswordMessage(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12">
        <p className="text-muted-foreground">
          User not found or not authenticated.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* User Profile Update Form */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name:</label>
            <input
              type="text"
              value={profileForm.name}
              placeholder={user.name} // Show previous value as placeholder
              onChange={(e) =>
                setProfileForm({ ...profileForm, name: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email:</label>
            <input
              type="email"
              value={profileForm.email}
              placeholder={user.email} // Show previous value as placeholder
              onChange={(e) =>
                setProfileForm({ ...profileForm, email: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Profile
          </button>
          {profileMessage && (
            <p className="mt-2 text-sm text-center">{profileMessage}</p>
          )}
        </form>
      </section>

      {/* Password Change Form */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Current Password:</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              // Since you cannot fetch the real password, use a generic placeholder
              placeholder="••••••••" 
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">New Password:</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              placeholder="Enter new password"
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Change Password
          </button>
          {passwordMessage && (
            <p className="mt-2 text-sm text-center">{passwordMessage}</p>
          )}
        </form>
      </section>
    </div>
  );
};

export default Profile;
