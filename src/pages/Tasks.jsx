import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Loader, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ModalImage from 'react-modal-image';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationEllipsis,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const Tasks = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null); // Store project details
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({ name: '', image: null });

    const [editTask, setEditTask] = useState(null); // To store the task being edited
    const [editedName, setEditedName] = useState('');
    const [editedImage, setEditedImage] = useState(null); // For storing the new image
    const [imagePreview, setImagePreview] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusCounts, setStatusCounts] = useState({
        completed: 0,
        ongoing: 0,
        pending: 0,
      });

    const [pelaporCounts, setPelaporCounts] = useState({
        ivan: 0,
        drajat: 0,
      });
  
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const itemsPerPage = 10; // Number of items per page


    const apiUrl = 'https://designtest.energeek.id/crud-api/tasks.php';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, tasksRes] = await Promise.all([
                    axios.get(`${apiUrl}?id=${projectId}`),
                    axios.get(`${apiUrl}?project_id=${projectId}`)
                ]);
    
                // If project data exists, set it
                if (projectRes.data.length > 0) {
                    setProject(projectRes.data[0]); // Assuming the first item is the latest project
                }
    
                // Sort tasks to have the newest on top (assuming there's a 'created_at' field)
                const sortedTasks = tasksRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setTasks(sortedTasks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, [projectId]);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Set loading to true when the upload starts
      setLoading(true);
  
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('project_id', projectId);
      if (form.image) {
          formData.append('image', form.image);
      }
  
      axios.post(apiUrl, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then((res) => {
              // Add the new task to the list
              setTasks([...tasks, { id: res.data.id, name: form.name, status: 'pending', image: form.image ? URL.createObjectURL(form.image) : null }]);
              
              // Clear the form fields
              setForm({ name: '', image: null });
  
              // Reload the page to reflect the changes
              window.location.reload();
          })
          .catch((error) => {
              console.error("Error uploading the data:", error);
          })
          .finally(() => {
              // Set loading to false after the upload is done
              setLoading(false);
          });
  };
  

    const handleStatusChange = (id, status) => {
        axios
            .put(apiUrl, { id, status })
            .then(() => {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === id ? { ...task, status } : task
                    )
                );
            })
            .catch((error) => {
                console.error("Failed to update status:", error);
                alert("Failed to update status. Please try again.");
            });
    };
    
    const handlePelaporChange = async (id, pelapor) => {
      try {
          await axios.put(apiUrl, { id, pelapor });
          
          // Update the local tasks state
          setTasks((prevTasks) =>
              prevTasks.map((task) =>
                  task.id === id ? { ...task, pelapor } : task
              )
          );
      } catch (error) {
          console.error("Failed to update pelapor:", error);
          alert("Failed to update pelapor. Please try again.");
      }
  };  

    const handleDelete = (id) => {
        // Show a confirmation alert before proceeding with the delete action
        const isConfirmed = window.confirm('Yakin ingin hapus task ini?');
    
        if (isConfirmed) {
            // Proceed with the delete request if confirmed
            axios.delete(apiUrl, { data: { id, project_id: projectId } }).then(() => {
                setTasks(tasks.filter((task) => task.id !== id));
            }).catch((error) => {
                console.error('Error deleting task:', error);
            });
        }
    };

    // Handle opening the modal for editing a task
  const handleEdit = (task) => {
    setEditTask(task);
    setEditedName(task.name);
    setEditedImage(null); // Reset image on edit
    setImagePreview(null); // Reset image preview on edit
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditedImage(file);
    setImagePreview(URL.createObjectURL(file)); // Show preview of the uploaded image
  };

  // Handle saving the edited task
  const handleSave = () => {
    const formData = new FormData();
    formData.append('id', editTask.id);
    formData.append('name', editedName);
  
    if (editedImage) {
      formData.append('image', editedImage);
    }
  
    // Sending a PUT request to the server to save the task data
    axios.put(`${apiUrl}/tasks`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for image upload
      },
    }).then((response) => {
      // Handle success - Update the task list locally after edit
      setTasks(tasks.map((task) => 
        task.id === editTask.id ? { ...task, name: editedName, image: editedImage ? editedImage.name : task.image } : task
      ));
      setEditTask(null); // Close the modal after saving
    }).catch((error) => {
      console.error('Error updating task:', error);
    });
  };  

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
      }
  };

  const renderPagination = () => {
          const pages = [];
          if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) {
              pages.push(
                <PaginationItem key={i}>
                  <PaginationLink
                    // href="#"
                    onClick={() => handlePageChange(i)}
                    isActive={i === currentPage}
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
              );
            }
          } else {
            const rangeStart = Math.max(2, currentPage - 1);
            const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
      
            pages.push(
              <PaginationItem key={1}>
                <PaginationLink
                  // href="#"
                  onClick={() => handlePageChange(1)}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            );
      
            if (rangeStart > 2) {
              pages.push(<PaginationEllipsis key="start-ellipsis" />);
            }
      
            for (let i = rangeStart; i <= rangeEnd; i++) {
              pages.push(
                <PaginationItem key={i}>
                  <PaginationLink
                    // href="#"
                    onClick={() => handlePageChange(i)}
                    isActive={i === currentPage}
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
              );
            }
      
            if (rangeEnd < totalPages - 1) {
              pages.push(<PaginationEllipsis key="end-ellipsis" />);
            }
      
            pages.push(
              <PaginationItem key={totalPages}>
                <PaginationLink
                  // href="#"
                  onClick={() => handlePageChange(totalPages)}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            );
          }
          return pages;
        };

    useEffect(() => {
        // Count tasks based on status
        const counts = { completed: 0, ongoing: 0, pending: 0 };
        tasks.forEach(task => {
          if (task.status === 'completed') {
            counts.completed += 1;
          } else if (task.status === 'ongoing') {
            counts.ongoing += 1;
          } else if (task.status === 'pending') {
            counts.pending += 1;
          }
        });
        setStatusCounts(counts);
      }, [tasks]);
    
      // Calculate total number of tasks
      const totalTasks = tasks.length;
      const completedPercentage = totalTasks ? (statusCounts.completed / totalTasks) * 100 : 0;
      const ongoingPercentage = totalTasks ? (statusCounts.ongoing / totalTasks) * 100 : 0;
      const pendingPercentage = totalTasks ? (statusCounts.pending / totalTasks) * 100 : 0;


      useEffect(() => {
        // Count tasks based on status
        const counts = { ivan: 0, drajat: 0};
        tasks.forEach(task => {
          if (task.pelapor === 'ivan') {
            counts.ivan += 1;
          } else if (task.pelapor === 'drajat') {
            counts.drajat += 1;
          }
        });
        setPelaporCounts(counts);
      }, [tasks]);
    
      // Calculate total number of tasks
      const totalPelaporTasks = tasks.length;
      const ivanPelaporPercentage = totalPelaporTasks ? (pelaporCounts.ivan / totalPelaporTasks) * 100 : 0;
      const drajatPelaporPercentage = totalPelaporTasks ? (pelaporCounts.drajat / totalPelaporTasks) * 100 : 0;
    
      const formatDate = (dateString) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const date = new Date(dateString);
        
        const day = date.getDate();
        const month = months[date.getMonth()];  // Get month name in Indonesian
        const year = date.getFullYear();
        const time = date.toLocaleTimeString('en-GB'); // Use en-GB for 24-hour format
    
        return `${day} ${month} ${year} (${time})`;
    };


    return (
        <div className="container min-h-screen py-12">
            <h1 className="text-2xl font-bold mb-4">Design Tasks {project ? project.name : '...'}</h1>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-4">
                <div className='flex flex-col w-full'>
                  <p className='text-sm mb-1 '>Nama Task</p>
                  <Input
                      className="p-2 border rounded-lg"
                      type="text"
                      placeholder="Nama task"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      disabled={loading}
                  />
                </div>
                <div className='flex flex-col md:flex-row gap-2 md:items-end'>
                  <div className='flex flex-col w-full'>
                    <p className='text-sm mb-1 '>Upload Gambar <span className='opacity-50'>*opsional</span></p>
                    <Input
                        className="p-2 border rounded-lg w-full md:w-[250px]"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                        disabled={loading}
                    />
                  </div>
                  <Button className="rounded-lg" disabled={loading}> {loading && <Loader className="animate-spin mr-2 h-4 w-4" /> } Tambah Task</Button>
                </div>
            </form>
            <div className='flex flex-col md:flex-row w-full gap-x-4 items-start'>
                <div className='flex gap-x-2 w-full'>
                  <Link to='/'><Button variant='outline'> <ArrowLeft className='w-4 h-4 mr-2' /> Back</Button></Link>
                  <Input
                      type="search"
                      placeholder="Cari tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="p-2 border rounded mb-4 rounded-lg max-w-full md:max-w-[200px]"
                  />
                </div>
                <div className='my-2 w-full w-full md:w-[80%]'>
                    <div className='flex gap-[2px]'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <div
                          className='bg-green-500 rounded h-4 transition ease-in-out delay-150 duration-300'
                          style={{ width: `${completedPercentage}%` }}
                          ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Completed {completedPercentage}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <div
                          className='bg-purple-500 rounded h-4 transition ease-in-out delay-150 duration-300'
                          style={{ width: `${ongoingPercentage}%` }}
                          ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ongoing {ongoingPercentage}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <div
                          className='bg-stone-500 rounded h-4 transition ease-in-out delay-150 duration-300'
                          style={{ width: `${pendingPercentage}%` }}
                          ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Pending {pendingPercentage}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className='flex gap-x-2 my-2'>
                        <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-green-500'></div>
                        <p className='text-xs font-light opacity-100'>Complete</p>
                        </div>
                        <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-purple-500'></div>
                        <p className='text-xs font-light opacity-100'>On Going</p>
                        </div>
                        <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-stone-300'></div>
                        <p className='text-xs font-light opacity-400'>Pending</p>
                        </div>
                    </div>
                </div>
                <div className='my-2 w-full md:w-[40%]'>
                    <div className='flex gap-[2px]'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <div
                          className='bg-yellow-500 rounded h-4 transition ease-in-out delay-150 duration-300'
                          style={{ width: `${ivanPelaporPercentage}%` }}
                          ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ivan {ivanPelaporPercentage}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                          <div
                          className='bg-indigo-500 rounded h-4 transition ease-in-out delay-150 duration-300'
                          style={{ width: `${drajatPelaporPercentage}%` }}
                          ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Drajat {drajatPelaporPercentage}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className='flex gap-x-2 my-2'>
                        <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                        <p className='text-xs font-light opacity-100'>Ivan</p>
                        </div>
                        <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-indigo-500'></div>
                        <p className='text-xs font-light opacity-100'>Drajat</p>
                        </div>
                    </div>
                </div>
            </div>
            <Table className='rounded-lg border mb-4'>
                {/* <TableCaption>A list of {project ? project.name : '...'} design tasks.</TableCaption> */}
                <TableHeader>
                <TableRow className='bg-stone-100 dark:bg-stone-800'>
                    <TableHead className="text-center w-[50px]">*</TableHead>
                    <TableHead className="w-full">Project</TableHead>
                    <TableHead className="text-center w-[200px]">Pelapor</TableHead>
                    <TableHead className="text-center w-[200px]">Status</TableHead>
                    <TableHead className="text-center w-[200px]">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedTasks.map((task) => (
                    <TableRow key={task.id}>
                        <TableCell>
                            <div
                                className={`w-3 h-3 rounded-full ${
                                    task.status === 'completed' ? 'bg-green-500' :
                                    task.status === 'ongoing' ? 'bg-purple-500' : 'bg-stone-400'
                                }`}>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium ">
                            <div className='flex flex-col'>
                              <div className='flex gap-3 items-center'>
                                <div>
                                {task.image && (
                                    <ModalImage
                                        small={`https://designtest.energeek.id/crud-api/uploads/${task.image}`}
                                        large={`https://designtest.energeek.id/crud-api/uploads/${task.image}`}
                                        // alt={task.name}
                                        className="my-2 w-[50px] h-[50px] object-cover rounded-lg"
                                    />
                                )}
                                </div>
                                <div className='flex flex-col gap-2 w-[300px] md:w-[90%]'>
                                  <p className='line-clamp-[1] font-medium opacity-70'>{task.name}</p>
                                  <p className='font-light text-xs opacity-70 flex items-center gap-1'> 
                                    <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Clock className='w-4 h-4 opacity-80' />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Tanggal dibuat</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    {formatDate(task.created_at)}</p>
                                </div>
                              </div>
                                
                            </div>
                        </TableCell>
                        <TableCell>
                          <select
                                value={task.pelapor}
                                onChange={(e) => handlePelaporChange(task.id, e.target.value)}
                                className="p-2 border rounded dark:bg-black"
                            >
                                <option value="ivan">Ivan</option>
                                <option value="drajat">Drajat</option>
                            </select>
                        </TableCell>
                        <TableCell>
                          <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="p-2 border rounded dark:bg-black"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="ongoing">On Going</option>
                            </select>
                        </TableCell>
                        <TableCell className="space-x-2 flex text-right w-full py-6">
                            <Button size='icon' variant='outline' onClick={() => handleDelete(task.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline"> Detail <ArrowUpRight className='w-4 h-4 ml-1' /></Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <div className="grid gap-4 py-4 h-[96vh] md:h-[94vh] overflow-y-scroll">
                                        <div className='flex flex-col gap-1 md:pr-4'>
                                            {task.image && (
                                                <ModalImage
                                                    small={`${apiUrl.replace('/index.php', '')}/${task.image}`}
                                                    large={`${apiUrl.replace('/index.php', '')}/${task.image}`}
                                                    // alt={task.name}
                                                    className="my-2 w-auto h-full object-cover rounded-lg"
                                                />
                                            )}
                                            <p className='text-sm mt-4'>{task.name}</p>
                                        </div>
                                    </div>
                                    {/* <SheetFooter className='py-4'>
                                        <SheetClose asChild>
                                            
                                        <Button onClick={() => handleEdit(task)}>Edit Task</Button>
                                        </SheetClose>
                                    </SheetFooter> */}
                                </SheetContent>
                                </Sheet>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>

            <p className='text-sm font-light opacity-70 text-center mb-4'>A list of {project ? project.name : '...'} design tasks.</p>

            {/* Pagination */}
            <Pagination>
              <PaginationContent>
                  <PaginationItem>
                  <Button
                      variant='outline'
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                  >
                      First
                  </Button>
                  </PaginationItem>
                  <PaginationItem>
                  <Button
                      variant='outline'
                      size='icon'
                      onClick={() =>
                      handlePageChange(currentPage > 1 ? currentPage - 1 : 1)
                      }
                      disabled={currentPage === 1}
                  >
                      <ChevronLeft />
                  </Button>
                  </PaginationItem>
                  {renderPagination()}
                  <PaginationItem>
                  <Button
                      variant='outline'
                      size='icon'
                      onClick={() =>
                      handlePageChange(
                          currentPage < totalPages ? currentPage + 1 : totalPages
                      )
                      }
                      disabled={currentPage === totalPages}
                  >
                      <ChevronRight />
                  </Button>
                  </PaginationItem>
                  <PaginationItem>
                  <Button
                      variant='outline'
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                  >
                      Last
                  </Button>
                  </PaginationItem>
              </PaginationContent>
          </Pagination>
          

            {editTask && (
        <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
          <DialogTrigger asChild>
            <Button>Edit Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              {/* <DialogTitle>Edit Task</DialogTitle> */}
              <DialogDescription>
                Make changes to your task here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                label="Task Name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Task name"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Image</label>
                <input 
                  type="file" 
                  onChange={handleImageChange} 
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md"
                />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
        </div>
    );
};

export default Tasks;
