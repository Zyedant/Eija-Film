import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaFilter } from "react-icons/fa";
import axios from "axios";
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { useRouter } from "next/router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  telephone: string;
  password: string;
  role: string;
  isActive: boolean;
  imageUrl?: string;
}

const UserForm = ({ onSaveUser, onCancel, userToEdit }: { onSaveUser: (user: User) => void, onCancel: () => void, userToEdit?: User }) => {
  const [name, setName] = useState(userToEdit ? userToEdit.name : "");
  const [email, setEmail] = useState(userToEdit ? userToEdit.email : "");
  const [telephone, setTelephone] = useState(userToEdit ? userToEdit.telephone : "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(userToEdit ? userToEdit.role : "USER");
  const [isActive, setIsActive] = useState(userToEdit ? userToEdit.isActive : true);
  const [imageUrl, setImageUrl] = useState(userToEdit ? userToEdit.imageUrl : "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let uploadedImageUrl = imageUrl;

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const token = Cookies.get('token');
        const response = await axios.post("/api/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        uploadedImageUrl = response.data.imageUrl;
      } catch (error) {
        console.error("Gagal meng-upload gambar", error);
      }
    }

    const updatedUser: User = {
      id: userToEdit ? userToEdit.id : "",
      name,
      email,
      telephone,
      password,
      role,
      isActive,
      imageUrl: uploadedImageUrl,
    };

    try {
      const token = Cookies.get('token');
      if (userToEdit) {
        await axios.put(`/api/user/${userToEdit.id}`, updatedUser, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await axios.post("/api/user", updatedUser, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      onSaveUser(updatedUser);
    } catch (error) {
      console.error("Gagal menyimpan pengguna", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold text-yellow-500">{userToEdit ? "Edit Pengguna" : "Tambah Pengguna"}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telephone</label>
          <input
            type="telephone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="AUTHOR">Author</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select
            value={isActive.toString()}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Gambar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button type="submit" className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
            {userToEdit ? "Perbarui Pengguna" : "Tambah Pengguna"}
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-500 text-white">
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
};

const ManageUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State untuk menampilkan filter
  const router = useRouter();

  const { search } = router.query;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const decoded = jwt.decode(token) as { role: string; id: string };
        if (!decoded) {
          router.push('/login');
          return;
        }

        setCurrentUser(decoded);
        setIsAdmin(decoded.role === 'ADMIN');
      } catch (error) {
        console.error("Failed to decode token", error);
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const token = Cookies.get('token');

        const userResponse = await axios.get("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (isAdmin) {
          setUsers(userResponse.data);
        } else {
          const userData = userResponse.data.filter((user: User) => user.id === currentUser.id);
          setUsers(userData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data user", error);
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, isAdmin]);

  const searchQuery = Array.isArray(search) ? search[0] : search || "";
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    const matchesIsActive =
      isActiveFilter === "all"
        ? true
        : isActiveFilter === "true"
        ? user.isActive
        : !user.isActive;

    return matchesSearch && matchesRole && matchesIsActive;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleDeleteUser = async () => {
    if (!userToDelete || isDeleting) return;

    try {
      setIsDeleting(true);

      const token = Cookies.get('token');

      if (!isAdmin) {
        const userToDeleteCheck = users.find(user => user.id === userToDelete);
        if (userToDeleteCheck && userToDeleteCheck.id !== currentUser?.id) {
          console.error("Tidak memiliki izin untuk menghapus user ini.");
          setIsDeleting(false);
          return;
        }
      }

      await axios.delete(`/api/user/${userToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Gagal menghapus user", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUser = (user: User) => {
    if (!isAdmin && user.id !== currentUser?.id) {
      console.error("Tidak memiliki izin untuk mengedit user ini.");
      return;
    }

    setUserToEdit(user);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setUserToEdit(null);
  };

  const handleSaveUser = (userToSave: User) => {
    if (userToEdit) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userToSave.id ? userToSave : u))
      );
    } else {
      setUsers((prevUsers) => [...prevUsers, userToSave]);
    }
    setShowForm(false);
    setUserToEdit(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setRoleFilter("all");
    setIsActiveFilter("all");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-100 dark:bg-gray-800 p-6 overflow-x-auto">
      {showForm ? (
        <UserForm
          onSaveUser={handleSaveUser}
          onCancel={handleCancelEdit}
          userToEdit={userToEdit || undefined}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
                Manage User
              </h1>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white"
              >
                <FaFilter className="mr-2" /> Filter
              </Button>
              <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
                <FaPlus className="mr-2" /> Tambah Pengguna
              </Button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="mb-6 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-300">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">Semua Role</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="AUTHOR">Author</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2 text-gray-900 dark:text-gray-300">Status</label>
                  <select
                    value={isActiveFilter}
                    onChange={(e) => setIsActiveFilter(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  >
                    <option value="all">Semua Status</option>
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  onClick={resetFilters}
                  className="bg-gray-500 text-white hover:bg-gray-600"
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={() => setCurrentPage(1)}
                  className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
                >
                  Terapkan
                </Button>
              </div>
            </div>
          )}

          {/* Active filters display */}
          {(roleFilter !== "all" || isActiveFilter !== "all") && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Filter aktif:</span>
                {roleFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    Role: {roleFilter}
                  </span>
                )}
                {isActiveFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    Status: {isActiveFilter === "true" ? "Aktif" : "Tidak Aktif"}
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="ml-auto text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800/50"
                >
                  Hapus semua filter
                </Button>
              </div>
            </div>
          )}

          {filteredUsers.length === 0 && (
            <Alert variant="destructive" className="mb-4">
              Tidak ada pengguna untuk ditampilkan.
            </Alert>
          )}

          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <Table className="min-w-max table-auto text-sm overflow-x-auto">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                  <TableCell className="py-3 px-4 text-left font-semibold">Nama</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Email</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Telephone</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Role</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Status</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Gambar</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Aksi</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id} className="dark:text-white text-black">
                    <TableCell className="py-3 px-4">{user.name}</TableCell>
                    <TableCell className="py-3 px-4">{user.email}</TableCell>
                    <TableCell className="py-3 px-4">{user.telephone}</TableCell>
                    <TableCell className="py-3 px-4">{user.role}</TableCell>
                    <TableCell className="py-3 px-4">
                      <span className={`text-sm ${user.isActive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
                        {user.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl.startsWith('/') ? user.imageUrl : `/${user.imageUrl}`}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/placeholder-user.png";
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">Tidak ada gambar</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Button onClick={() => handleEditUser(user)} className="bg-yellow-500 text-white mr-2">
                        <FaEdit />
                      </Button>
                      <Button
                        onClick={() => {
                          setUserToDelete(user.id);
                          setShowDeleteDialog(true);
                        }}
                        className="bg-red-500 text-white"
                        disabled={isDeleting}
                      >
                        <FaTrash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tampilkan</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600 dark:text-gray-400">data per halaman</span>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
              >
                Sebelumnya
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
              Apakah Anda yakin?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Anda tidak dapat mengembalikan user yang telah dihapus!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default ManageUser;