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
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Tasks = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null); // Store project details
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({ name: '' });

    const apiUrl = 'http://localhost/crud-api/index.php';

    useEffect(() => {
        // Fetch project details
        axios.get(`${apiUrl}?id=${projectId}`).then((res) => {
            if (res.data.length > 0) {
                setProject(res.data[0]);
            }
        });

        // Fetch tasks for the project
        axios.get(`${apiUrl}?project_id=${projectId}`).then((res) => setTasks(res.data));
    }, [projectId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(apiUrl, { ...form, project_id: projectId }).then((res) => {
            setTasks([...tasks, { id: res.data.id, name: form.name, status: 'pending' }]);
            setForm({ name: '' });
        });
    };

    const handleStatusChange = (id, status) => {
        axios.put(apiUrl, { id, status }).then(() => {
            setTasks(tasks.map((task) =>
                task.id === id ? { ...task, status } : task
            ));
        });
    };

    const handleDelete = (id) => {
        axios.delete(apiUrl, { data: { id, project_id: projectId } }).then(() => {
            setTasks(tasks.filter((task) => task.id !== id));
        });
    };

    return (
        <div className="container min-h-screen">
            <h1 className="text-2xl font-bold mb-4 my-12">Design Tasks {project ? project.name : '...'}</h1>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <Input
                    className="p-2 border rounded-xl"
                    type="text"
                    placeholder="Task Name"
                    value={form.name}
                    onChange={(e) => setForm({ name: e.target.value })}
                />
                <Button className="rounded-2xl">Add</Button>
            </form>
            <Table className='bg-white rounded-2xl border'>
                <TableCaption>A list of {project ? project.name : '...'} design tasks.</TableCaption>
                <TableHeader>
                <TableRow>
                    <TableHead className="text-center w-[50px]">*</TableHead>
                    <TableHead className="w-full">Project</TableHead>
                    <TableHead className="text-center w-[200px]">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tasks.map((task) => (
                    <TableRow key={task.id}>
                        <TableCell className="font-medium">
                            <div
                            className={`w-3 h-3 rounded-full ${
                                task.status === 'completed' ? 'bg-green-500' : 'bg-stone-300'
                            }`}>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">{task.name}
                            {/* show image attachemnt here */}
                            <img src='' />
                        </TableCell>
                        <TableCell className="space-x-2 flex text-right w-full">
                            <Button size='icon' variant='ghost' onClick={() => handleDelete(task.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                            <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className="p-2 border rounded"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                            <Link to={`/tasks/${task.id}`}><Button variant='ghost'>Detail <ArrowUpRight className="h-4 w-4 ml-1" /></Button></Link>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default Tasks;
