"use client";

import { Header } from "@/components/header";
import { ParticlesBackground } from "@/components/particles-background";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; github_username?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string>("");

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
            setGithubUsername(data.github_username || ""); // Charger le pseudo GitHub
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

  const handleSaveGithub = async () => {
    if (!user) return;

    try {
      const response = await fetch("http://localhost:5000/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": user.email,
        },
        body: JSON.stringify({ github_username: githubUsername }),
      });

      if (response.ok) {
        alert("Pseudo GitHub sauvegardé !");
      } else {
        alert("Erreur lors de la sauvegarde du pseudo GitHub.");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du pseudo GitHub :", error);
      alert("Une erreur est survenue.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.");
    if (!confirmDelete) return;

    try {
        const response = await fetch("http://localhost:5000/api/user", {
            method: "DELETE",
            headers: {
                "x-user-email": user.email,
            },
        });

        if (response.ok) {
            alert("Compte supprimé avec succès.");
            localStorage.removeItem("user"); // Supprimer les données utilisateur du localStorage
            window.location.href = "/"; // Rediriger vers la page d'accueil
        } else {
            alert("Erreur lors de la suppression du compte.");
        }
    } catch (error) {
        console.error("Erreur lors de la suppression du compte :", error);
        alert("Une erreur est survenue.");
    }
};

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

          {/* Champ pour le pseudo GitHub */}
          <div className="mt-4">
            <label htmlFor="github" className="block text-sm font-medium text-gray-700">
              Pseudo GitHub (optionnel) :
            </label>
            <input
              id="github"
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Entrez votre pseudo GitHub"
            />
            <button
              onClick={handleSaveGithub}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sauvegarder
            </button>
          </div>

          {/* Affichage du pseudo GitHub s'il existe */}
          {githubUsername && (
            <p className="mt-4 text-sm text-gray-600">
              <strong>Pseudo GitHub :</strong> {githubUsername}
            </p>
          )}

          {/* Bouton pour supprimer le compte */}
          <div className="mt-6">
              <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                  Supprimer mon compte
              </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}