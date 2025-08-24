"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Loader2 } from "lucide-react"
import Link from "next/link"

import { api } from "@/lib/api"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState(1) // 1: enter email and send OTP, 2: verify OTP
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        try {
            await api.forgotPassword({ email })
            setStep(2)
        } catch (err: any) {
            setError(err.message || "Failed to send OTP. Please check if the email exists and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length !== 6) {
            setError("OTP must be 6 digits")
            return
        }
        setIsLoading(true)
        setError("")
        try {
            const { resetToken } = await api.verifyOtp({ email, otp })
            router.push(`/auth/reset-password?token=${resetToken}`)
        } catch (err: any) {
            setError(err.message || "Invalid or expired OTP. Please try again.")
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
                        <CardTitle className="text-xl sm:text-2xl font-bold">Reset Password</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {step === 1 ? "Enter your email to receive an OTP" : "Enter the 6-digit OTP sent to your email"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-10 sm:h-11"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-10 sm:h-11"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-sm">
                                        OTP
                                    </Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                                        required
                                        maxLength={6}
                                        className="h-10 sm:h-11"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-10 sm:h-11"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Remember your password? </span>
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