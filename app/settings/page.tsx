"use client";

import { Header } from "@/components/header"
import { ParticlesBackground } from "@/components/particles-background"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

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
          <h1 className="text-2xl font-bold text-center mb-6">Paramètres</h1>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Mode sombre</Label>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch id="notifications" />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Son</Label>
              <Switch id="sound" />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}