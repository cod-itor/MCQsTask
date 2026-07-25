'use client'

import { useState } from 'react'
import { signup } from '../login/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowRight, Lock, Mail, Sparkles, Eye, EyeOff, Loader2, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setServerError(null)
    
    const formData = new FormData()
    formData.append('username', data.username)
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await signup(formData)
    
    if (result?.error) {
      setServerError(result.error)
      setIsLoading(false)
    } else if (result?.success) {
      toast.success(result.message)
      router.push('/login')
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      
      {/* Floating subtle particles / grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4 py-8"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
            className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20 backdrop-blur-md"
          >
            <Sparkles className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Join DITOR
          </h1>
          <p className="text-slate-400">Create an account to save your progress.</p>
        </div>

        <Card className="w-full border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          <CardHeader className="space-y-1 text-center pb-6 border-b border-slate-800/60">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your details to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
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
                <Label htmlFor="username" className="text-slate-300 ml-1">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    {...register("username")}
                    className={`pl-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 h-11 transition-all ${errors.username ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 ml-1">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={`pl-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 h-11 transition-all ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`pl-10 pr-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 h-11 transition-all ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300 ml-1">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`pl-10 pr-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 h-11 transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</p>}
              </div>
              
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 font-medium shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500">Or</span>
                  </div>
                </div>

                <Link href="/login" className="w-full">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full bg-transparent border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-11 transition-all"
                  >
                    Already have an account? Sign in
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
