import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { ArrowUpRight, Trash2 } from 'lucide-react';

const Home = () => {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState({ name: '' });

    const apiUrl = 'http://localhost/crud-api/index.php';

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
        axios.delete(apiUrl, { data: { id } }).then(() => {
            setProjects(projects.filter((project) => project.id !== id));
        });
    };

    return (
        <div className="container min-h-screen">
            <h1 className="text-2xl font-bold mb-4 my-12">Design Test Energeek</h1>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <Input
                    className="p-2 border rounded-xl"
                    type="text"
                    placeholder="Project Name"
                    value={form.name}
                    onChange={(e) => setForm({ name: e.target.value })}
                />
                <Button className="rounded-2xl">Tambah</Button>
            </form>
            <Table className='bg-white rounded-2xl border'>
                <TableCaption>A list of your recent projects.</TableCaption>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-full">Project</TableHead>
                    <TableHead className="text-center w-[200px]">Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {projects.map((project) => (
                    <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell className="space-x-2 flex text-right w-full">
                            <Button size='icon' variant='ghost' onClick={() => handleDelete(project.id)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>
                            <Link to={`/tasks/${project.id}`}><Button variant='outline'>Detail <ArrowUpRight className="h-4 w-4 ml-1" /></Button></Link>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
                {/* <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                </TableRow>
                </TableFooter> */}
            </Table>
            {/* <ul>
                {projects.map((project) => (
                    <li key={project.id} className="flex justify-between p-2 border-b">
                        <Link to={`/tasks/${project.id}`} className="text-blue-500">{project.name}</Link>
                        <button
                            onClick={() => handleDelete(project.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul> */}
        </div>
    );
};

export default Home;
