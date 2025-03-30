"use client";

import { useCallback } from "react"
import Particles from "react-particles"
import type { Container, Engine } from "tsparticles-engine"
import { loadFull } from "tsparticles"

export function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine)
  }, [])

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles chargées")
  }, [])

  return (
    <Particles
      className="particles-container"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        particles: {
          color: {
            value: ["#FFFFFF", "#3B82F6"], // White and blue colors for stars
          },
          links: {
            enable: false, // Disable links between particles
          },
          move: {
            enable: true,
            outModes: {
              default: "out", // Particles move out of bounds
            },
            random: true, // Random movement
            speed: 0.5, // Slower speed for a star-like effect
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 150, // Increased number of particles for a starry effect
          },
          opacity: {
            value: { min: 0.1, max: 0.8 }, // Varying opacity for realism
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 0.5, max: 2 }, // Smaller sizes for star-like particles
          },
        },
        detectRetina: true,
      }}
    />
  )
}