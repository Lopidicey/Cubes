"use client";

import { useEffect, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { Engine, Render, World, Bodies, Mouse, MouseConstraint, Runner, Body, Events } from "matter-js";
import { Header } from "@/components/header";
import { ParticlesBackground } from "@/components/particles-background";
import axios from "axios";

export default function Home() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<{ id: number; firstName: string; lastName: string; value: number }[]>([]);

  useEffect(() => {
    // Récupérer les utilisateurs depuis l'API
    axios.get("http://localhost:5000/api/cubes/with-stats")
      .then((response) => {
        const fetchedUsers = response.data.map((user: any) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          value: user.publicRepos, // ou `user.gameCount` si Steam par exemple
        }));
        setUsers(fetchedUsers);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      });
  }, []);

  useLayoutEffect(() => {

    if (users.length === 0) return;
    if (!sceneRef.current) return;

    const getInitials = (firstName: string, lastName: string) => {
      const first = firstName?.[0]?.toUpperCase() || "";
      const last = lastName?.[0]?.toUpperCase() || "";
      return first + last;
    };    

    const engine = Engine.create();
    engine.world.gravity.y = 0; // Activer la gravité

    if (!sceneRef.current) return;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
      },
    });

    // Positionner le canvas plein écran
    render.canvas.style.position = "absolute";
    render.canvas.style.top = "0";
    render.canvas.style.left = "0";

    // Murs invisibles
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 20, window.innerWidth, 40, {
      isStatic: true,
      render: { visible: false },
    });
    const ceiling = Bodies.rectangle(window.innerWidth / 2, -20, window.innerWidth, 40, {
      isStatic: true,
      render: { visible: false },
    });
    const leftWall = Bodies.rectangle(-20, window.innerHeight / 2, 40, window.innerHeight, {
      isStatic: true,
      render: { visible: false },
    });
    const rightWall = Bodies.rectangle(window.innerWidth + 20, window.innerHeight / 2, 40, window.innerHeight, {
      isStatic: true,
      render: { visible: false },
    });

    // Définir la taille des cubes
    const baseSize = 75; // Taille de base des cubes
    const multiplier = 5; // Facteur multiplicateur pour ajuster la taille

    // Fonction pour générer une position aléatoire
    const getRandomPosition = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.5, // Limiter à la moitié supérieure
    });

    const createInitialsTexture = (initials: string) => {
      const canvas = document.createElement("canvas");
      const size = 128;
      canvas.width = size;
      canvas.height = size;
    
      const ctx = canvas.getContext("2d")!;
      
      // Fond
      ctx.fillStyle = "#007bff";
      ctx.fillRect(0, 0, size, size);
    
      // Texte
      ctx.font = "bold 48px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials, size / 2, size / 2);
    
      return canvas.toDataURL();
    };
    

    // Fonction pour ajouter un cube avec un délai aléatoire
    const addCubeWithDelay = (user: {
      value: number; id: number; firstName: string; lastName: string 
}, index: number) => {
      const delay = Math.random() * 2000;
      setTimeout(() => {
        const position = getRandomPosition();
    
        const initials = getInitials(user.firstName, user.lastName);
        const texture = createInitialsTexture(initials);
        const value = typeof user.value === "number" && !isNaN(user.value) ? user.value : 0;
        console.log("Valeur de l'utilisateur :", value);
        const cubeSize = baseSize + value * multiplier; // Modifier cette valeur pour ajuster la taille des cubes
    
        const cube = Bodies.rectangle(position.x, position.y, cubeSize, cubeSize, {
          restitution: 0.8,
          friction: -0.25,
          render: {
            sprite: {
              texture: texture,
              xScale: cubeSize / 128,
              yScale: cubeSize / 128,
            },
          },
        });
    
        Body.setVelocity(cube, {
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
        });
    
        World.add(engine.world, cube);
      }, delay);
    };

    // Ajouter les cubes avec des délais aléatoires
    users.forEach((user, index) => addCubeWithDelay(user, index));

    // Souris
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });

    render.mouse = mouse;

    // Ajouter tout au monde
    World.add(engine.world, [ground, ceiling, leftWall, rightWall, mouseConstraint]);

    // Lancer la simulation avec Runner
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Nettoyage
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    
      if (render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    
      render.textures = {};
    };
  }, [users]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <ParticlesBackground />
      <Header />
      <div className="pt-24 pb-12 container mx-auto px-4">
        <motion.h1 
          className="text-4xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Bienvenue sur Cubes.
        </motion.h1>
      </div>
      <div
        ref={sceneRef}
        className="w-full h-full"
      />
    </main>
  );
}