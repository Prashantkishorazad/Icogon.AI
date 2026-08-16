import { useEffect, useRef, useState } from "react";

import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  ArrowLeft,
  Upload,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getMyProfileApi,
  updateProfileApi,
} from "../../api/profileApi";

import { uploadAvatar } from "../../services/storageApi";

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  provider?: string;
}

const ProfilePage = () => {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await getMyProfileApi();

        const data =
          response.data.profile;

        if (data) {
          setProfile(data);

          setFullName(
            data.full_name || ""
          );

          setPhone(
            data.phone || ""
          );

          setAvatarUrl(
            data.avatar_url || ""
          );

          setPreviewUrl(
            data.avatar_url || ""
          );
        }

      } catch (error) {
        console.error(
          "PROFILE ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =========================================================
  // SELECT IMAGE
  // =========================================================

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image size must be less than 5MB."
      );
      return;
    }

    setSelectedFile(file);

    const localPreview =
      URL.createObjectURL(file);

    setPreviewUrl(localPreview);
  };

  // =========================================================
  // REMOVE SELECTED IMAGE
  // =========================================================

  const handleRemoveImage = () => {
    setSelectedFile(null);

    setPreviewUrl(
      avatarUrl || ""
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      let finalAvatarUrl =
        avatarUrl;

      // -------------------------------------------------------
      // UPLOAD NEW IMAGE
      // -------------------------------------------------------

      if (selectedFile) {
        if (!profile?.id) {
          alert("User ID not found.");
          return;
        }

        setUploading(true);

        const uploadedUrl =
          await uploadAvatar(
            selectedFile,
            profile.id
          );

        console.log(
          "AVATAR PUBLIC URL:",
          uploadedUrl
        );

        finalAvatarUrl =
          uploadedUrl;

        setUploading(false);
      }

      // -------------------------------------------------------
      // UPDATE DATABASE
      // -------------------------------------------------------

      const response =
        await updateProfileApi({
          full_name: fullName,
          phone: phone,
          avatar_url: finalAvatarUrl,
        });

      const updatedProfile =
        response.data.profile;

      setProfile(
        updatedProfile
      );

      setAvatarUrl(
        updatedProfile.avatar_url || ""
      );

      setPreviewUrl(
        updatedProfile.avatar_url || ""
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert(
        "Profile updated successfully!"
      );

    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      alert(
        "Unable to update profile."
      );

    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070B14] text-white">
        Loading profile...
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#070B14] px-6 py-10 text-white">

      <div className="mx-auto max-w-2xl">

        {/* Back */}

        <Link
          to="/dashboard"
          className="mb-8 flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your ICOGON AI profile information.
          </p>

        </div>

        {/* Profile Card */}

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-xl">

          {/* Avatar */}

          <div className="mb-8 flex flex-col items-center gap-5 sm:flex-row">

            <div className="relative">

              {previewUrl ? (
                <img
                  key={previewUrl}
                  src={
                    previewUrl.startsWith("blob:")
                      ? previewUrl
                      : `${previewUrl}${
                          previewUrl.includes("?")
                            ? "&"
                            : "?"
                        }t=${Date.now()}`
                  }
                  alt="Profile"
                  onError={() => {
                    console.error(
                      "AVATAR IMAGE FAILED:",
                      previewUrl
                    );
                  }}
                  className="h-28 w-28 rounded-full border-2 border-cyan-500 object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-800">
                  <User
                    size={45}
                    className="text-slate-500"
                  />
                </div>
              )}

              {/* Camera Button */}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#111827] bg-cyan-500 text-black transition hover:bg-cyan-400"
              >
                <Camera size={17} />
              </button>

            </div>

            <div className="text-center sm:text-left">

              <h2 className="text-xl font-semibold">
                {fullName || "Your Name"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {profile?.email}
              </p>

              <p className="mt-2 text-xs uppercase tracking-wider text-cyan-400">
                {profile?.provider || "email"}
              </p>

              {/* Upload Button */}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-3 flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-500 hover:text-white"
              >
                <Upload size={15} />
                Change Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

            </div>

          </div>

          {/* Selected Image */}

          {selectedFile && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">

              <div>

                <p className="text-sm text-white">
                  New image selected
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedFile.name}
                </p>

              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-slate-500 transition hover:text-red-400"
              >
                <X size={18} />
              </button>

            </div>
          )}

          {/* Full Name */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Full Name
            </label>

            <div className="relative">

              <User
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                placeholder="Enter your full name"
                className="h-14 w-full rounded-xl border border-slate-800 bg-[#191a1c] pl-12 pr-4 text-sm text-white outline-none transition focus:border-cyan-500"
              />

            </div>

          </div>

          {/* Email */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>

            <div className="relative">

              <Mail
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="h-14 w-full cursor-not-allowed rounded-xl border border-slate-800 bg-[#0d1117] pl-12 pr-4 text-sm text-slate-500 outline-none"
              />

            </div>

            <p className="mt-2 text-xs text-slate-600">
              Email is managed by Supabase Authentication.
            </p>

          </div>

          {/* Phone */}

          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Mobile Number
            </label>

            <div className="relative">

              <Phone
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Enter mobile number"
                className="h-14 w-full rounded-xl border border-slate-800 bg-[#191a1c] pl-12 pr-4 text-sm text-white outline-none transition focus:border-cyan-500"
              />

            </div>

          </div>

          {/* Avatar URL */}

          <div className="mb-8">

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Profile Image URL
            </label>

            <input
              type="url"
              value={avatarUrl}
              onChange={(e) =>
                setAvatarUrl(e.target.value)
              }
              placeholder="https://example.com/profile.jpg"
              className="h-14 w-full rounded-xl border border-slate-800 bg-[#191a1c] px-4 text-sm text-white outline-none transition focus:border-cyan-500"
            />

            <p className="mt-2 text-xs text-slate-600">
              You can upload an image or use an external image URL.
            </p>

          </div>

          {/* Save */}

          <button
            type="button"
            onClick={handleSave}
            disabled={
              saving ||
              uploading
            }
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <Save size={19} />

            {uploading
              ? "Uploading Image..."
              : saving
                ? "Saving Changes..."
                : "Save Changes"}

          </button>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;