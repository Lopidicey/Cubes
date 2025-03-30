"use client";

import { Header } from "@/components/header"
import { ParticlesBackground } from "@/components/particles-background"
import { motion } from "framer-motion"

const placeholderCubes = Array(0).fill(null).map((_, i) => ({
  id: i,
  title: `Cube ${i + 1}`,
  description: "Créez le votre !",
}))

export default function Home() {
  return (
    <main className="min-h-screen">
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
        
        <motion.div 
          className="cube-grid"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {placeholderCubes.map((cube) => (
            <motion.div
              key={cube.id}
              className="cube-card aspect-square p-6 flex flex-col justify-center items-center text-center"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                show: { opacity: 1, scale: 1 }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h2 className="text-xl font-semibold mb-2">{cube.title}</h2>
              <p className="text-sm text-muted-foreground">{cube.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  )
}