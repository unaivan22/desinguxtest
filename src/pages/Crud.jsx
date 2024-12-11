import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Crud = () => {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ name: '', description: '' });

    const apiUrl = 'http://localhost/crud-api/index.php';

    useEffect(() => {
        axios.get(apiUrl).then((res) => setItems(res.data));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(apiUrl, form).then((res) => {
            setItems([...items, { ...form, id: res.data.id }]);
            setForm({ name: '', description: '' });
        });
    };

    const handleDelete = (id) => {
        axios.delete(apiUrl, { data: { id } }).then(() => {
            setItems(items.filter((item) => item.id !== id));
        });
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">CRUD App</h1>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 mb-8"
            >
                <input
                    className="p-2 border"
                    type="text"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <textarea
                    className="p-2 border"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                ></textarea>
                <button className="p-2 bg-blue-500 text-white">Add Item</button>
            </form>
            <ul>
                {items.map((item) => (
                    <li key={item.id} className="flex justify-between p-2 border-b">
                        <div>
                            <h2 className="font-bold">{item.name}</h2>
                            <p>{item.description}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Crud;
