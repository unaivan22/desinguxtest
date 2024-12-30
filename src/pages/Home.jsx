import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ChevronLeft, ChevronRight, PlusCircleIcon, Trash2 } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({ name: '' });
    const [editProject, setEditProject] = useState(null);
    const [editedName, setEditedName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const itemsPerPage = 10; // Number of items per page
    const [tasksCount, setTasksCount] = useState({});

    // const apiUrl = '/crud-api/index.php';
    const apiUrl = 'https://designtest.energeek.id/crud-api/index.php';

    useEffect(() => {
        axios.get(apiUrl).then((res) => setProjects(res.data));
    }, []);

    useEffect(() => {
        // Fetch pending tasks count for each project
        projects.forEach((project) => {
            axios
                .get(`${apiUrl}?project_id=${project.id}&status=pending`)
                .then((res) => {
                    setTasksCount((prev) => ({
                        ...prev,
                        [project.id]: res.data.length,
                    }));
                });
        });
    }, [projects]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(apiUrl, form).then((res) => {
            setProjects([...projects, { id: res.data.id, name: form.name }]);
            setForm({ name: '' });
        });
    };

    const handleDelete = (id) => {
        const isConfirmed = window.confirm("Yakin hapus design testing project ini? data task project terkait juga akan ikut terhapus");
        if (isConfirmed) {
            axios.delete(apiUrl, { data: { id } }).then(() => {
                setProjects(projects.filter((project) => project.id !== id));
            });
        }
    };

    const handleEdit = (project) => {
        setEditProject(project);  // Set the project to be edited
        setEditedName(project.name);  // Set the name to be pre-filled in the input field
    };

    const handleSaveChanges = () => {
        if (editedName) {
            axios.put(apiUrl, { id: editProject.id, name: editedName }).then(() => {
                setProjects(projects.map(project =>
                    project.id === editProject.id ? { ...project, name: editedName } : project
                ));
                setEditProject(null);  // Close the dialog
            }).catch(error => {
                console.error("Error saving project changes:", error);
            });
        }
    };

    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically A to Z
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        const pages = [];
        if (totalPages <= 5) {
          for (let i = 1; i <= totalPages; i++) {
            pages.push(
              <PaginationItem key={i}>
                <PaginationLink
                //   href="#"
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
                //   href="#"
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

    return (
        <section>
            <div className="container min-h-screen py-12">
                <div className='flex items-center gap-x-2'>
                    <img src='/e.svg' className='w-8' />
                    <h1 className="text-2xl font-bold">Energeek - Design Testing </h1> 
                    <ModeToggle />
                </div>
                <div className='flex flex-col md:flex-row items-center gap-4 md:gap-x-24 my-6 w-full'>
                    <Input
                        type="search"
                        placeholder="Cari projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded rounded-lg max-w-full md:max-w-[200px] order-2 md:order-1"
                    />
                    <form onSubmit={handleSubmit} className="flex gap-3 w-full items-center order-1 md:order-2">
                        <PlusCircleIcon className='w-6 h-6 opacity-60'/>
                        <Input
                            className="p-2 border rounded-lg"
                            type="text"
                            placeholder="Nama Project"
                            value={form.name}
                            onChange={(e) => setForm({ name: e.target.value })}
                            required
                        />
                        <Button className="rounded-lg">Tambah</Button>
                    </form>
                </div>

                <Table className='bg-white dark:bg-black border shadow-sm rounded-xl mb-4'>
                    <TableHeader>
                        <TableRow className='bg-stone-100 dark:bg-stone-800'>
                            <TableHead className="w-full">Project</TableHead>
                            <TableHead className="text-center w-[200px]">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className='items-center'>
                        {paginatedProjects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.name}</TableCell>
                                <TableCell className="space-x-2 flex text-right w-full items-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size='icon' variant='ghost' onClick={() => handleDelete(project.id)}>
                                                    <Trash2 className="h-4 w-4 text-rose-500" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Hapus Project</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Button variant="outline" onClick={() => handleEdit(project)}>
                                        Edit
                                    </Button>
                                    <Link to={`/tasks/${project.id}`}>
                                        <Button variant='outline' className='w-auto py-[5px] h-auto'>
                                            <div className='flex flex-col'>
                                                <div className='flex items-center'>
                                                    Detail
                                                    <ArrowUpRight className="h-4 w-4 ml-1" />
                                                </div>
                                                <p className='text-[.7rem] opacity-80 font-light'>{Number(project.pending_count || 0) + Number(project.ongoing_count || 0) === 0 
                                                    ? 'No task' 
                                                    : `${Number(project.pending_count || 0) + Number(project.ongoing_count || 0)} Task${Number(project.pending_count || 0) + Number(project.ongoing_count || 0) > 1 ? 's' : ''}`}</p>
                                            </div>
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

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

                {/* Edit Project Modal */}
            {editProject && (
                <Dialog open={true} onOpenChange={(open) => !open && setEditProject(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogDescription>
                                Make changes to your project here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Input
                                label="Project Name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Project name"
                                required='true'
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveChanges}>Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            </div>
        </section>
    );
};

export default Home;
