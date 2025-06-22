import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Fetch } from '../lib/api';

type loginResponse = {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
        baseId: string;
    };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
        const response = await Fetch<loginResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        })

        sessionStorage.setItem("token", response.token);
        toast.success("Login successful!");
        navigate("/");
    }catch (error) {
        toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="bg-zinc-800 min-h-screen">
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="mb-30">
          <h1 className="text-3xl font-bold text-white mb-4">
            Mili-Tech Asset Managment
          </h1>
        </div>
        <Card className="w-[30vw]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin} className="space-y-6">
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
