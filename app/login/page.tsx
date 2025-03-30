"use client";

import { Header } from "@/components/header";
import { ParticlesBackground } from "@/components/particles-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Importez le hook pour la navigation

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        console.error("Erreur de connexion");
        return;
      }
  
      const data = await response.json();
      console.log("Données utilisateur reçues :", data);
  
      // Stocker les informations utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify({ email: data.user.email }));
  
      // Rediriger vers la page de profil
      router.push("/profile");
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
    }
  };

  return (
    <main className="min-h-screen">
      <ParticlesBackground />
      <Header />
      
      <div className="pt-24 pb-12 container mx-auto px-4 flex justify-center items-center">
        <motion.div
          className="w-full max-w-md bg-card p-8 rounded-lg border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button type="submit" className="w-full">
                Se connecter
              </Button>
            </motion.div>
            <a href="/register" className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-700">
              Pas encore de compte ? Inscrivez-vous
            </a>
          </form>
        </motion.div>
      </div>
    </main>
  )
}