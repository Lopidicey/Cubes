const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

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
    const query = 'SELECT * FROM cubes'; // Remplacez "cubes" par le nom de votre table
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
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

    // Assurez-vous que les noms des colonnes correspondent à votre table
    const query = 'SELECT id, prenom AS firstName, nom AS lastName, email FROM utilisateurs WHERE email = ? AND mdp = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification de l\'utilisateur :', err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // Si l'utilisateur est trouvé, renvoyer ses informations
        const user = results[0];
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

        // Insérer le nouvel utilisateur
        const insertQuery = 'INSERT INTO utilisateurs (prenom, nom, email, mdp) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [firstName, lastName, email, password], (err, results) => {
            if (err) {
                console.error('Erreur lors de l\'insertion dans la base de données :', err);
                return res.status(500).json({ message: "Erreur serveur." });
            }
            res.status(201).json({ message: "Utilisateur enregistré avec succès.", user: { firstName, lastName, email } });
        });
    });
});

app.get('/api/user', (req, res) => {
    const email = req.headers['x-user-email'];

    if (!email) {
        return res.status(400).json({ message: "Email utilisateur manquant." });
    }

    const query = 'SELECT id, prenom AS firstName, nom AS lastName, email FROM utilisateurs WHERE email = ?';
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

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});