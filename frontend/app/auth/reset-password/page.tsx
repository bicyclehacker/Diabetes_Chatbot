"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

import { api } from "@/lib/api"

export default function ResetPassword() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    // If no token, redirect to signin
    if (!token) {
        router.push("/auth/signin")
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (password.length < 6) {  // Basic validation, adjust as needed
            setError("Password must be at least 6 characters")
            return
        }
        setIsLoading(true)
        setError("")
        try {
            await api.resetPassword({ token, password })
            setSuccess(true)
            setTimeout(() => router.push("/auth/signin"), 3000)  // Redirect after 3s
        } catch (err: any) {
            setError(err.message || "Failed to reset password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-md space-y-4 sm:space-y-6">
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            DiabetesAI
                        </span>
                    </Link>
                </div>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-1 text-center px-4 sm:px-6 py-4 sm:py-6">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Set New Password</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Enter and confirm your new password
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert variant="default">
                                <AlertDescription>Password reset successful! Redirecting to sign in...</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-10 sm:h-11 pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-10 sm:h-11 px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Re-enter new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-10 sm:h-11 pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-10 sm:h-11 px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-10 sm:h-11"
                                disabled={isLoading || success}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Back to </span>
                            <Link href="/auth/signin" className="text-blue-600 hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}