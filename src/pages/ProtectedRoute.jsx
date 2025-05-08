import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const ProtectedRoute = ({ children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cek apakah sudah login di localStorage
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '3n3rg33k') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true'); // Simpan di localStorage
    } else {
      alert('Wrong password!');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>
            <div className='flex flex-col gap-4'>
            <img className='w-12' src='/e.svg' />
            <p className='mb-1'>Masuk Dulu</p>
            </div>
          </CardTitle>
          <CardDescription>Masukkan password, jika lupa tanya designer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <p className="block mb-2 text-sm opacity-80 font-light">Password:</p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className='py-4'>
              <Button type="submit" className="rounded-full w-full">
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtectedRoute;