'use client'

import { useState } from 'react'
import { login } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight, Lock, Mail, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { useDarkMode } from '@/lib/dark-mode-context'

export default function LoginPage() {
  const { darkMode } = useDarkMode()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setServerError(null)
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)
    
    if (result?.error) {
      setServerError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${darkMode ? "bg-slate-950" : "bg-gray-50"}`}>
      {/* Dynamic Background Elements */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none ${darkMode ? "bg-blue-600/30" : "bg-blue-400/20"}`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none ${darkMode ? "bg-indigo-600/20" : "bg-indigo-400/20"}`} />
      
      {/* Floating subtle particles / grid */}
      <div className={`absolute inset-0 bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none ${darkMode ? "bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]" : "bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]"}`} />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
            className={`inline-flex items-center justify-center p-3 rounded-2xl mb-4 border backdrop-blur-md ${darkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}
          >
            <Sparkles className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
          </motion.div>
          <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Welcome Back
          </h1>
          <p className={`${darkMode ? "text-slate-400" : "text-gray-600"}`}>Master your MCQs and ace your exams.</p>
        </div>

        <Card className={`w-full backdrop-blur-xl shadow-2xl overflow-hidden relative ${darkMode ? "border-slate-800 bg-slate-900/60" : "border-gray-200 bg-white/60"}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <CardHeader className={`space-y-1 text-center pb-6 border-b ${darkMode ? "border-slate-800/60" : "border-gray-200"}`}>
            <CardTitle className={`text-2xl font-bold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>Sign In</CardTitle>
            <CardDescription className={`${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              Enter your email and password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {serverError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-md text-center"
                >
                  {serverError}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={`ml-1 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>Email address</Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-2.5 h-5 w-5 ${darkMode ? "text-slate-500" : "text-gray-400"}`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={`pl-10 h-11 transition-all ${darkMode ? "bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"} focus-visible:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className={`${darkMode ? "text-slate-300" : "text-gray-700"}`}>Password</Label>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-2.5 h-5 w-5 ${darkMode ? "text-slate-500" : "text-gray-400"}`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`pl-10 pr-10 h-11 transition-all ${darkMode ? "bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"} focus-visible:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-2.5 transition-colors ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 font-medium shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${darkMode ? "border-slate-800" : "border-gray-300"}`}></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className={`px-2 ${darkMode ? "bg-slate-900 text-slate-500" : "bg-white text-gray-500"}`}>Or</span>
                  </div>
                </div>

                <Link href="/register" className="w-full">
                  <Button 
                    type="button"
                    variant="outline" 
                    className={`w-full h-11 transition-all ${darkMode ? "bg-transparent border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    Create an account
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
