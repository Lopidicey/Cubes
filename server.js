require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: 'localhost', // Adresse du serveur MySQL
    user: 'root',      // Nom d'utilisateur MySQL
    password: '',      // Mot de passe MySQL
    database: 'cubes-db' // Nom de la base de données
});

// Vérifier la connexion
db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL.');
});

// Route de test
app.get('/', (req, res) => {
    res.send('Serveur Node.js opérationnel !');
});

// Exemple : Récupérer des données depuis MySQL
app.get('/api/cubes', (req, res) => {
    const query = 'SELECT id, prenom AS firstName, nom AS lastName FROM utilisateurs'; // Utiliser la table "utilisateurs"
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des données :', err);
            res.status(500).send('Erreur lors de la récupération des données.');
        } else {
            res.json(results);
        }
    });
});

// Route pour connecter un utilisateur
app.post('/api/login', (req, res) => {
    console.log("Requête reçue sur /api/login :", req.body);
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }
  
    const query = 'SELECT id, prenom AS firstName, nom AS lastName, email, mdp FROM utilisateurs WHERE email = ?';
    
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification de l\'utilisateur :', err);
        return res.status(500).json({ message: "Erreur serveur." });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect." });
      }
  
      const user = results[0];
  
      // 💡 Comparer le mot de passe fourni avec le hash
      const bcrypt = require('bcryptjs');
      const passwordMatch = await bcrypt.compare(password, user.mdp);
  
      if (!passwordMatch) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect." });
      }
  
      res.status(200).json({
        message: "Connexion réussie.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    });
  });
  

// Route pour enregistrer un utilisateur
app.post('/api/register', (req, res) => {
    console.log("Requête reçue sur /api/register :", req.body);
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si l'email existe déjà
    const checkEmailQuery = 'SELECT * FROM utilisateurs WHERE email = ?';
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'email :', err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // Hacher le mot de passe
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("Erreur lors du hachage du mot de passe :", err);
                return res.status(500).json({ message: "Erreur serveur." });
            }

            // Insérer le nouvel utilisateur avec le mot de passe haché
            const insertQuery = 'INSERT INTO utilisateurs (prenom, nom, email, mdp) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [firstName, lastName, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion dans la base de données :', err);
                    return res.status(500).json({ message: "Erreur serveur." });
                }
                res.status(201).json({ message: "Utilisateur enregistré avec succès.", user: { firstName, lastName, email } });
            });
        });
    });
});

app.get('/api/user', (req, res) => {
    const email = req.headers['x-user-email'];

    if (!email) {
        return res.status(400).json({ message: "Email utilisateur manquant." });
    }

    const query = 'SELECT id, prenom AS firstName, nom AS lastName, email, github_username FROM utilisateurs WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des informations utilisateur :', err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json(results[0]);
    });
});

app.patch('/api/user', (req, res) => {
    const email = req.headers['x-user-email'];
    const { github_username } = req.body;
  
    if (!email || !github_username) {
      return res.status(400).json({ message: "Email ou pseudo GitHub manquant." });
    }
  
    const query = 'UPDATE utilisateurs SET github_username = ? WHERE email = ?';
    db.query(query, [github_username, email], (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du pseudo GitHub :", err);
        return res.status(500).json({ message: "Erreur serveur." });
      }
  
      res.status(200).json({ message: "Pseudo GitHub mis à jour avec succès." });
    });
  });

  app.get('/api/cubes/with-stats', async (req, res) => {
    const query = 'SELECT id, prenom AS firstName, nom AS lastName, github_username FROM utilisateurs';
    db.query(query, async (err, results) => {
        if (err) return res.status(500).send("Erreur MySQL");

        // Fetch GitHub stats pour chaque utilisateur
        const usersWithStats = await Promise.all(results.map(async (user) => {
            if (!user.github_username) return { ...user, publicRepos: 0 };

            try {
                // Ajoute le token GitHub à l'en-tête de la requête
                const githubRes = await axios.get(`https://api.github.com/users/${user.github_username}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // Utilisation du token GitHub
                        'User-Agent': 'MyApp', // Un User-Agent pour GitHub
                    }
                });
                return { ...user, publicRepos: githubRes.data.public_repos };
            } catch (err) {
                console.error("Erreur lors de la récupération des stats GitHub :", err);
                return { ...user, publicRepos: 0 }; // fallback si erreur GitHub
            }
        }));

        res.json(usersWithStats);
    });
});


app.delete('/api/user', (req, res) => {
    const email = req.headers['x-user-email'];

    if (!email) {
        return res.status(400).json({ message: "Email utilisateur manquant." });
    }

    const query = 'DELETE FROM utilisateurs WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression de l'utilisateur :", err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json({ message: "Compte supprimé avec succès." });
    });
});

app.get('/api/github/repos/:username', async (req, res) => {
    const username = req.params.username;

    if (!process.env.GITHUB_TOKEN) {
        return res.status(500).json({ message: "Token GitHub non configuré." });
    }

    try {
        const githubRes = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // Utilisation du token GitHub
                'User-Agent': 'MyApp', // Un User-Agent pour GitHub
            }
        });
        res.json(githubRes.data);
    } catch (err) {
        console.error("Erreur GitHub API :", err.response?.data || err.message);
        res.status(500).json({ message: "Erreur lors de l'appel à l'API GitHub." });
    }
});



// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});