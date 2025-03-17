import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
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


const UserForm = ({ onSaveUser, onCancel, userToEdit }) => {
  const [name, setName] = useState(userToEdit ? userToEdit.name : "");
  const [email, setEmail] = useState(userToEdit ? userToEdit.email : "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(userToEdit ? userToEdit.role : "USER");
  const [isActive, setIsActive] = useState(userToEdit ? userToEdit.isActive : true);
  const [imageUrl, setImageUrl] = useState(userToEdit ? userToEdit.imageUrl : "");
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
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

    const updatedUser = {
      id: userToEdit ? userToEdit.id : null,
      name,
      email,
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
            value={isActive}
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
            onChange={(e) => setImageFile(e.target.files[0])}
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
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

        const decoded = jwt.decode(token);
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
          const userData = userResponse.data.filter(user => user.id === currentUser.id);
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes((search || "").toLowerCase()) ||
      user.email.toLowerCase().includes((search || "").toLowerCase())
  );

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
        if (userToDeleteCheck && userToDeleteCheck.id !== currentUser.id) {
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

  const handleEditUser = (user) => {
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

  const handleSaveUser = (userToSave) => {
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
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
          userToEdit={userToEdit}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
                Manage User
              </h1>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white">
              <FaPlus className="mr-2" /> Tambah Pengguna
            </Button>
          </div>

          {filteredUsers.length === 0 && (
            <Alert variant="warning" className="mb-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              Tidak ada pengguna untuk ditampilkan.
            </Alert>
          )}

          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <Table className="min-w-max table-auto text-sm overflow-x-auto bg-white dark:bg-gray-800">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                  <TableCell className="py-3 px-4 text-left font-semibold">Nama</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Email</TableCell>
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
                            e.target.onerror = null;
                            e.target.src = "/placeholder-user.png";
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
                  <SelectItem value="5" className="hover:bg-gray-100 dark:hover:bg-gray-600">5</SelectItem>
                  <SelectItem value="10" className="hover:bg-gray-100 dark:hover:bg-gray-600">10</SelectItem>
                  <SelectItem value="20" className="hover:bg-gray-100 dark:hover:bg-gray-600">20</SelectItem>
                  <SelectItem value="50" className="hover:bg-gray-100 dark:hover:bg-gray-600">50</SelectItem>
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
              Apakah Anda yakin??
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