"use client";

import { Header } from "@/components/header";
import { ParticlesBackground } from "@/components/particles-background";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; github_username?: string; profileImage?: string; publicRepos?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

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
            console.log("Données utilisateur récupérées :", data); // Vérifiez que profileImage est présent
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

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && file.type.match('image.*')) {
    setImage(file);
  } else {
    alert("Veuillez télécharger un fichier image (PNG, JPG, GIF).");
  }
};

const handleUpload = async () => {
  if (image) {
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/api/upload-profile-image", {
        method: "POST",
        headers: {
          "x-user-email": user?.email || "", // Assurez-vous que l'email de l'utilisateur est présent
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.message === "Image téléchargée avec succès") {
        // Affichage d'une alerte pour confirmer l'upload réussi
        alert("Image de profil mise à jour !");

        // Mise à jour de l'image de profil dans l'état utilisateur
        setUser((prevUser) => ({
          ...prevUser!,
          profileImage: data.imagePath, // Mise à jour du chemin de l'image
        }));

      } else {
        alert("Erreur lors de l'upload de l'image.");
      }
    } catch (err) {
      console.error("Erreur lors de l'upload :", err);
      alert("Erreur lors de l'upload.");
    }
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
          <p><strong>Votre taille :</strong> {user.publicRepos !== undefined ? user.publicRepos : "Chargement..."}</p>

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
            <p className="mt-4 mb-4 text-sm text-gray-600">
              <strong>Pseudo GitHub :</strong> {githubUsername}
            </p>
          )}

          {/* Champ pour uploader une image de profil */}
          <div>
            <label htmlFor="file-upload" className="cursor-pointer underline">Téléchargez votre image de profil</label>
            <input 
              id="file-upload"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            {user.profileImage && (
              <img
                src={user.profileImage} // Utilisez user.profileImage pour afficher l'image actuelle
                alt="Image de profil"
                className="mt-4 w-32 h-32 rounded-full object-cover"
              />
            )}
            {image && <p className="mt-4 text-sm text-gray-600">{image.name}</p>}
            <button onClick={handleUpload} 
            className="mt-2 px-4 py-2 bg-black-500 text-white rounded border border-white hover:bg-gray-600">
              Mettre à jour l'image</button>
          </div>

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