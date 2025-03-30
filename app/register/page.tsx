"use client";

import { Header } from "@/components/header"
import { ParticlesBackground } from "@/components/particles-background"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"; // Importez le hook pour la navigation

export default function RegisterPage() {
  const router = useRouter(); // Initialisez le routeur
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Une erreur est survenue.");
        return;
      }

      const data = await response.json();
      console.log("Utilisateur enregistré avec succès :", data);

      // Stocker les informations utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify({ firstName, lastName, email }));

      // Rediriger vers la page de profil
      router.push("/profile");
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
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
          <h1 className="text-2xl font-bold text-center mb-6">Inscription</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">Prénom</Label>
              <Input
                id="first-name"
                type="text"
                placeholder="Votre prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">Nom</Label>
              <Input
                id="last-name"
                type="text"
                placeholder="Votre nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmez le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button type="submit" className="w-full">
                S'inscrire
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </main>
  )
}