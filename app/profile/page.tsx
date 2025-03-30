"use client";

import { Header } from "@/components/header";
import { ParticlesBackground } from "@/components/particles-background";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  
    const storedUser = localStorage.getItem("user");
    console.log("Contenu brut de storedUser :", storedUser);
  
    if (!storedUser) {
      setError("Utilisateur non connecté.");
      return;
    }
  
    try {
      const user = JSON.parse(storedUser);
      console.log("Utilisateur parsé :", user);
  
      if (!user.email) {
        setError("Utilisateur non connecté.");
        return;
      }
  
      const fetchUser = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/user", {
            headers: {
              "x-user-email": user.email,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            setError("Impossible de récupérer les données utilisateur.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Une erreur est survenue lors de la récupération des données.");
        }
      };
  
      fetchUser();
    } catch (err) {
      console.error("Erreur lors du parsing de storedUser :", err);
      setError("Utilisateur non connecté.");
    }
  }, []);

  if (!isMounted) {
    return null; // Empêche le rendu côté serveur
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!user) {
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
            <h1 className="text-2xl font-bold text-center mb-6">Profil</h1>
            <p className="text-center">Chargement...</p>
          </motion.div>
        </div>
      </main>
    );
  }

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
          <h1 className="text-2xl font-bold text-center mb-6">Profil</h1>
          <p><strong>Prénom :</strong> {user.firstName}</p>
          <p><strong>Nom :</strong> {user.lastName}</p>
          <p><strong>Email :</strong> {user.email}</p>
        </motion.div>
      </div>
    </main>
  );
}