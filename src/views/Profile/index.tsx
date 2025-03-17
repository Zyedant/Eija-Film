import { useState, useEffect } from "react";
import { 
  FaUserCircle, FaEdit, FaSave, FaTimes, FaLock, FaEnvelope, 
  FaUser, FaArrowLeft, FaCamera, FaMoon, FaSun, 
  FaIdCard
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import jwt from "jsonwebtoken";
import axios from "axios";

interface UserData {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [role, setRole] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = Cookies.get("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);

    Cookies.set("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Anda harus login untuk mengakses halaman ini");
        router.push("/auth/login");
        return;
      }

      try {
        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.id) {
          throw new Error("Token tidak valid");
        }

        const userId = decoded.id;
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) {
          throw new Error("Gagal mengambil data pengguna");
        }

        const data = await response.json();
        setUserData(data);
        setName(data.name);
        setEmail(data.email);
        setImageUrl(data.imageUrl);
        setRole(data.role);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Gagal memuat data pengguna");
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSave = async () => {
    if (!userData) return;

    let uploadedImageUrl = imageUrl;

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const response = await axios.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uploadedImageUrl = response.data.imageUrl;
      } catch (error) {
        console.error("Gagal meng-upload gambar", error);
        toast.error("Gagal meng-upload gambar");
        return;
      }
    }

    try {
      const response = await fetch(`/api/user/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          imageUrl: uploadedImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui profil");
      }

      toast.success("Profil berhasil diperbarui!");
      setIsEditing(false);
      setUserData((prev) => ({ ...prev!, name, email, imageUrl: uploadedImageUrl }));
      setImageUrl(uploadedImageUrl);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan saat memperbarui profil");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Password baru tidak cocok!");
      return;
    }

    if (!oldPassword) {
      toast.error("Password lama harus diisi!");
      return;
    }

    try {
      const response = await fetch(`/api/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui password");
      }

      toast.success("Password berhasil diperbarui!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Terjadi kesalahan saat memperbarui password");
    }
  };

  const handleCancelEdit = () => {
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
      setImageUrl(userData.imageUrl);
    }
    setIsEditing(false);
    setImageFile(null);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-900" : "bg-gray-100"}`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-500 animate-spin"></div>
          </div>
          <div className={`mt-4 font-medium ${isDarkMode ? "text-yellow-500" : "text-yellow-600"}`}>Memuat profil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <header className={`fixed top-0 left-0 right-0 px-4 py-3 ${isDarkMode ? "bg-slate-900/80" : "bg-white/80"} backdrop-blur-lg z-10 border-b ${isDarkMode ? "border-yellow-500/10" : "border-gray-200"}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            onClick={handleGoBack} 
            variant="ghost" 
            className={`flex items-center ${isDarkMode ? "text-yellow-500 hover:text-yellow-400" : "text-gray-900 hover:text-gray-700"}`}
          >
            <FaArrowLeft className="mr-2" /> 
            <span>Kembali</span>
          </Button>
          
          <h1 className={`text-xl font-bold ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500" : "text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-700"}`}>
            Profil Pengguna
          </h1>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDarkMode ? "bg-yellow-600 text-white" : "bg-yellow-500 text-white"
            } hover:bg-yellow-600 transition duration-200`}
          >
            {isDarkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
          </button>
        </div>
      </header>

      <div className="w-full max-w-4xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <Card className={`${isDarkMode ? "bg-slate-800/50 border-yellow-500/10" : "bg-white border-gray-200"} shadow-xl overflow-hidden`}>
              <div className="relative h-32 bg-gradient-to-r from-yellow-600/20 to-amber-500/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
              </div>
              
              <div className="flex flex-col items-center -mt-16 px-6 pb-6">
                <div className="relative group mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full opacity-50 blur group-hover:opacity-75 transition-all duration-500"></div>
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-slate-900 shadow-xl">
                      <AvatarImage src={imageUrl} alt="Profile Picture" className="object-cover" />
                      <AvatarFallback className={`bg-gradient-to-r ${isDarkMode ? "from-slate-700 to-slate-800" : "from-gray-200 to-gray-300"}`}>
                        <FaUserCircle className={`w-16 h-16 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                      <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-200">
                        <FaCamera />
                        <input 
                          type="file" 
                          id="avatar-upload" 
                          accept="image/*" 
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  {isEditing ? (
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`mt-2 mb-1 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-100 border-gray-200 text-gray-900"} text-center`}
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{name}</h2>
                  )}
                  
                  <Badge variant="outline" className={`mt-2 ${isDarkMode ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"} font-medium`}>
                    {role || "User"}
                  </Badge>
                  
                  {!isEditing && (
                    <div className={`mt-4 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                      <div className="flex items-center justify-center">
                        <FaEnvelope className={`mr-2 ${isDarkMode ? "text-yellow-500/80" : "text-yellow-600/80"}`} />
                        <span>{email}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-center">
                        <FaIdCard className={`mr-2 ${isDarkMode ? "text-yellow-500/80" : "text-yellow-600/80"}`} />
                        <span>ID: {userData?.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator className={`my-6 ${isDarkMode ? "bg-yellow-500/10" : "bg-gray-200"}`} />
                
                <div className="w-full">
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <Button 
                        onClick={handleSave} 
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-medium"
                      >
                        <FaSave className="mr-2" /> Simpan Perubahan
                      </Button>
                      <Button 
                        onClick={handleCancelEdit} 
                        variant="outline" 
                        className={`w-full ${isDarkMode ? "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10" : "border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"}`}
                      >
                        <FaTimes className="mr-2" /> Batal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className={`w-full ${isDarkMode ? "border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10" : "border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"}`}
                    >
                      <FaEdit className="mr-2" /> Edit Profil
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-8">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className={`grid grid-cols-2 ${isDarkMode ? "bg-slate-800/50 border-yellow-500/10" : "bg-gray-100 border-gray-200"} mb-6`}>
                <TabsTrigger value="profile" className={`data-[state=active]:bg-yellow-500 data-[state=active]:text-black`}>
                  <FaUser className="mr-2" /> Profil
                </TabsTrigger>
                <TabsTrigger value="security" className={`data-[state=active]:bg-yellow-500 data-[state=active]:text-black`}>
                  <FaLock className="mr-2" /> Keamanan
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card className={`${isDarkMode ? "bg-slate-800/50 border-yellow-500/10" : "bg-white border-gray-200"} shadow-xl`}>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className={`text-xl ${isDarkMode ? "text-yellow-500" : "text-yellow-600"}`}>Informasi Profil</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div>
                          <Label className={`${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Nama Lengkap</Label>
                          <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`mt-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                          />
                        </div>
                        
                        <div>
                          <Label className={`${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Email</Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <Label className={`${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Nama Lengkap</Label>
                          <p className={`mt-2 p-2 ${isDarkMode ? "bg-slate-700/30 text-white" : "bg-gray-100/30 text-gray-900"} rounded-md`}>{name}</p>
                        </div>
                        
                        <div>
                          <Label className={`${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Email</Label>
                          <p className={`mt-2 p-2 ${isDarkMode ? "bg-slate-700/30 text-white" : "bg-gray-100/30 text-gray-900"} rounded-md`}>{email}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card className={`${isDarkMode ? "bg-slate-800/50 border-yellow-500/10" : "bg-white border-gray-200"} shadow-xl`}>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className={`text-xl ${isDarkMode ? "text-yellow-500" : "text-yellow-600"}`}>Ubah Password</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <Label className={`${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Password Saat Ini</Label>
                        <Input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className={`mt-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                        />
                      </div>
                      
                      <div>
                        <Label className={`${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Password Baru</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`mt-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                        />
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                          Password harus terdiri dari minimal 8 karakter dengan kombinasi huruf dan angka
                        </p>
                      </div>
                      
                      <div>
                        <Label className={`${isDarkMode ? "text-yellow-300" : "text-yellow-600"}`}>Konfirmasi Password Baru</Label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`mt-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}`}
                        />
                      </div>
                      
                      <Button
                        onClick={handleChangePassword}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-medium"
                      >
                        <FaLock className="mr-2" /> Ubah Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;