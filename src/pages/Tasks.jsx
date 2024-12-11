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
import { ArrowLeft, ArrowUpRight, Trash2 } from 'lucide-react';
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
    

    const apiUrl = 'http://localhost/crud-api/index.php';

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
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('project_id', projectId);
        if (form.image) {
            formData.append('image', form.image);
        }
    
        axios.post(apiUrl, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => {
            setTasks([...tasks, { id: res.data.id, name: form.name, status: 'pending', image: form.image ? URL.createObjectURL(form.image) : null }]);
            setForm({ name: '', image: null });
        });
        window.location.reload();
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
    

    const handleDelete = (id) => {
        // Show a confirmation alert before proceeding with the delete action
        const isConfirmed = window.confirm('Yakin ingin donwload task ini?');
    
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
    


    return (
        <div className="container min-h-screen py-12">
            <h1 className="text-2xl font-bold mb-4">Design Tasks {project ? project.name : '...'}</h1>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <Input
                    className="p-2 border rounded-lg"
                    type="text"
                    placeholder="Task Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <Input
                    className="p-2 border rounded-lg w-[250px]"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                />
                <Button className="rounded-lg">Add Task</Button>
            </form>
            <div className='flex w-full gap-x-48 items-start'>
                <div className='flex gap-x-2 w-full'>
                  <Link to='/'><Button variant='outline'> <ArrowLeft className='w-4 h-4 mr-2' /> Back</Button></Link>
                  <Input
                      type="search"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="p-2 border rounded mb-4 rounded-lg max-w-[200px]"
                  />
                </div>
                <div className='my-2 w-full'>
                    <div className='flex gap-[2px]'>
                        <div
                        className='bg-green-500 rounded h-4'
                        style={{ width: `${completedPercentage}%` }}
                        ></div>
                        <div
                        className='bg-purple-500 rounded h-4'
                        style={{ width: `${ongoingPercentage}%` }}
                        ></div>
                        <div
                        className='bg-stone-400 rounded h-4'
                        style={{ width: `${pendingPercentage}%` }}
                        ></div>
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
            </div>
            <Table className='rounded-lg border'>
                <TableCaption>A list of {project ? project.name : '...'} design tasks.</TableCaption>
                <TableHeader>
                <TableRow className='bg-stone-100 dark:bg-stone-800'>
                    <TableHead className="text-center w-[50px]">*</TableHead>
                    <TableHead className="w-full">Project</TableHead>
                    <TableHead className="text-center w-[200px]">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredTasks.map((task) => (
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
                            <div className='flex flex-row gap-3 items-center'>
                                <div>
                                {task.image && (
                                    <ModalImage
                                        small={`${apiUrl.replace('/index.php', '')}/${task.image}`}
                                        large={`${apiUrl.replace('/index.php', '')}/${task.image}`}
                                        // alt={task.name}
                                        className="my-2 w-[50px] h-[50px] object-cover rounded-lg"
                                    />
                                )}
                                </div>
                                <p className='line-clamp-[2] w-[90%] font-medium opacity-70 my-2'>{task.name}</p>
                            </div>
                        </TableCell>
                        <TableCell className="space-x-2 flex text-right w-full py-6">
                            <Button size='icon' variant='ghost' onClick={() => handleDelete(task.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="p-2 border rounded dark:bg-black"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="ongoing">On Going</option>
                            </select>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline">Detail</Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <div className="grid gap-4 py-4 h-[86vh] overflow-y-scroll">
                                        <div className='flex flex-col gap-1'>
                                            {task.image && (
                                                <ModalImage
                                                    small={`${apiUrl.replace('/index.php', '')}/${task.image}`}
                                                    large={`${apiUrl.replace('/index.php', '')}/${task.image}`}
                                                    // alt={task.name}
                                                    className="my-2 w-auto h-[128px] object-cover rounded-lg"
                                                />
                                            )}
                                            <p className='text-sm'>{task.name}</p>
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
