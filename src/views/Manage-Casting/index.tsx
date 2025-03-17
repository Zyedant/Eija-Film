import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
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

const ManageCasting = () => {
  const [castings, setCastings] = useState<any[]>([]);
  const [realName, setRealName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [stageName, setStageName] = useState('');
  const [editCastingId, setEditCastingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [uploadType, setUploadType] = useState("file");
  const [actorPhotoFile, setActorPhotoFile] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [castingToDelete, setCastingToDelete] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(''); // State untuk query pencarian
  const router = useRouter();

  // Fetch data on load
  useEffect(() => {
    const fetchCastings = async () => {
      try {
        const token = Cookies.get('token');
        const response = await axios.get("/api/casting", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCastings(response.data);
      } catch (error) {
        console.error("Error fetching castings:", error);
        setErrorMessage("Failed to load castings. Please try again.");
      }
    };

    fetchCastings();
  }, []);

  // Filter castings based on search query
  const filteredCastings = castings.filter(
    (casting) =>
      casting.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      casting.stageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredCastings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCastings = filteredCastings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Handle form submission for adding or editing casting
  const handleSaveCasting = async () => {
    if (!realName || (!photoUrl && !actorPhotoFile) || !stageName) {
      setErrorMessage("Real Name, Stage Name, and Photo (URL or File) are required");
      return;
    }

    setIsLoading(true);
    setErrorMessage(""); // Reset error message

    try {
      const token = Cookies.get('token');
      let uploadedPhotoUrl = photoUrl;

      // Jika ada file gambar yang di-upload
      if (actorPhotoFile) {
        const formData = new FormData();
        formData.append("file", actorPhotoFile);

        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        uploadedPhotoUrl = uploadResponse.data.imageUrl;
      }

      const castingData = { realName, photoUrl: uploadedPhotoUrl, stageName };
      let response;

      if (editCastingId) {
        // Editing an existing casting
        response = await axios.put(`/api/casting/${editCastingId}`, castingData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCastings(castings.map((casting) => (casting.id === editCastingId ? response.data : casting)));
      } else {
        // Adding a new casting
        response = await axios.post("/api/casting", castingData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCastings((prev) => [...prev, response.data]);
      }

      // Reset form fields after submission
      setRealName('');
      setPhotoUrl('');
      setStageName('');
      setActorPhotoFile(null);
      setShowForm(false);
      setEditCastingId(null);
    } catch (error) {
      console.error("Error saving casting:", error);
      setErrorMessage("Failed to save casting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deletion of a casting
  const handleDeleteCasting = async () => {
    if (!castingToDelete) return;

    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      await axios.delete(`/api/casting/${castingToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCastings(castings.filter((casting) => casting.id !== castingToDelete));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting casting:", error);
      setErrorMessage("Failed to delete casting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit casting
  const handleEditCasting = (casting: any) => {
    setRealName(casting.realName);
    setPhotoUrl(casting.photoUrl);
    setStageName(casting.stageName);
    setEditCastingId(casting.id);
    setShowForm(true);
  };

  // Handle cancel edit or add
  const handleCancel = () => {
    setShowForm(false);
    setEditCastingId(null);
    setRealName('');
    setPhotoUrl('');
    setStageName('');
    setActorPhotoFile(null);
  };

  // Handle file change for photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setActorPhotoFile(file);
    }
  };

  return (
    <main className="bg-gray-100 dark:bg-gray-800 p-6 overflow-x-auto">
      {showForm ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold text-yellow-500 mb-4">
            {editCastingId ? "Edit Casting" : "Add New Casting"}
          </h2>
          {/* Error Message */}
          {errorMessage && <Alert variant="warning" className="mb-4">{errorMessage}</Alert>}

          {/* Form for Add/Edit Casting */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Real Name"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Stage Name"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />

            {/* Pilihan antara URL atau Upload File */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Photo Upload Method
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="block w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="file">Upload File</option>
                <option value="url">Use URL</option>
              </select>
            </div>

            {uploadType === "url" ? (
              <input
                type="text"
                placeholder="Photo URL"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            ) : (
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              />
            )}

            <div className="flex justify-between mt-4">
              <Button
                onClick={handleSaveCasting}
                className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : editCastingId ? "Save Changes" : "Add Casting"}
              </Button>
              <Button onClick={handleCancel} className="bg-gray-500 text-white">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:text-yellow-300">
                Manage Castings
              </h1>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white"
            >
              <FaPlus className="mr-2" /> Add Casting
            </Button>
          </div>

          {/* Error Message */}
          {errorMessage && <Alert variant="warning" className="mb-4">{errorMessage}</Alert>}

          <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-lg">
            <Table className="min-w-max table-auto text-sm">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-white dark:bg-gradient-to-r dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800">
                  <TableCell className="py-3 px-4 text-left font-semibold">Photo</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Real Name</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Stage Name</TableCell>
                  <TableCell className="py-3 px-4 text-left font-semibold">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCastings.map((casting) => (
                  <TableRow key={casting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="py-3 px-4 border-b dark:border-gray-700">
                      {casting.photoUrl ? (
                        <img
                          src={casting.photoUrl}
                          alt={casting.stageName}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-gray-400">No photo available</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 border-b dark:border-gray-700 dark:text-white">
                      {casting.realName}
                    </TableCell>
                    <TableCell className="py-3 px-4 border-b dark:border-gray-700 dark:text-white">
                      {casting.stageName}
                    </TableCell>
                    <TableCell className="py-3 px-4 border-b dark:border-gray-700">
                      <Button
                        onClick={() => handleEditCasting(casting)}
                        className="bg-yellow-500 text-white mr-2"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        onClick={() => {
                          setCastingToDelete(casting.id);
                          setShowDeleteDialog(true);
                        }}
                        className="bg-red-500 text-white"
                      >
                        <FaTrash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination and Items Per Page Selector */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">entries</span>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
              Apakah Anda yakin?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
            Anda tidak dapat mengembalikan film yang telah dihapus!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCasting}
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

export default ManageCasting;