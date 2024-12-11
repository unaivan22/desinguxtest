import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const Home = () => {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({ name: '' });
    const [editProject, setEditProject] = useState(null);  // State to manage the project being edited
    const [editedName, setEditedName] = useState('');

    const apiUrl = 'https://designtest.energeek.id/crud-api/index.php';

    useEffect(() => {
        axios.get(apiUrl).then((res) => setProjects(res.data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(apiUrl, form).then((res) => {
            setProjects([...projects, { id: res.data.id, name: form.name }]);
            setForm({ name: '' });
        });
    };

    const handleDelete = (id) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this project?");
        if (isConfirmed) {
            axios.delete(apiUrl, { data: { id } }).then(() => {
                setProjects(projects.filter((project) => project.id !== id));
            }).catch(error => {
                console.error("Error deleting project:", error);
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

    return (
        <div className="container min-h-screen py-12">
            <div className='flex items-center gap-x-2'>
                <h1 className="text-2xl font-bold">Design Test Energeek</h1> 
                <ModeToggle />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4 mt-6">
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
            <Table className='dark:bg-black border shadow-sm'>
                <TableCaption>A list of your design test projects.</TableCaption>
                <TableHeader>
                    <TableRow className='bg-stone-100 dark:bg-stone-800'>
                        <TableHead className="w-full">Project</TableHead>
                        <TableHead className="text-center w-[200px]">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell className="space-x-2 flex text-right w-full">
                                <Button size='icon' variant='ghost' onClick={() => handleDelete(project.id)}>
                                    <Trash2 className="h-4 w-4 text-rose-500" />
                                </Button>
                                <Button variant="outline" onClick={() => handleEdit(project)}>
                                    Edit
                                </Button>
                                <Link to={`/tasks/${project.id}`}>
                                    <Button variant='outline'>Detail <ArrowUpRight className="h-4 w-4 ml-1" /></Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
    );
};

export default Home;
