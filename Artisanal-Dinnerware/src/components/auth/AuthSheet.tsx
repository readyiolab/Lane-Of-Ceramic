import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2 } from "lucide-react"

export function AuthSheet() {
  const { isAuthSheetOpen, closeAuthSheet, sendOtp, verifyOtp } = useAuth()
  
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    try {
      await sendOtp(email)
      setStep("otp")
    } catch (error) {
      // Error handled by context (toast)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) return
    setIsLoading(true)
    try {
      await verifyOtp(email, otp)
      // On success, close sheet and reset
      closeAuthSheet()
      setTimeout(() => {
        setStep("email")
        setEmail("")
        setOtp("")
      }, 300)
    } catch (error) {
      // Error handled by context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={isAuthSheetOpen} onOpenChange={closeAuthSheet}>
      <DrawerContent className="bg-[#FAF9F6]">
        <div className="mx-auto w-full max-w-sm pb-8 pt-4">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-serif text-[#3E3A06]">
              {step === "email" ? "Welcome Back" : "Verify Email"}
            </DrawerTitle>
            <DrawerDescription className="text-stone-600">
              {step === "email"
                ? "Enter your email to receive a 6-digit login code."
                : `We've sent a code to ${email}`}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4">
            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-stone-300 focus-visible:ring-[#3E3A06]"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#3E3A06] hover:bg-[#2A2704] text-white"
                  disabled={isLoading || !email}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue with Email"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                <Button 
                  type="submit" 
                  className="w-full bg-[#3E3A06] hover:bg-[#2A2704] text-white"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Login"}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="text-stone-500 hover:text-[#3E3A06] mt-2"
                  onClick={() => {
                    setStep("email")
                    setOtp("")
                  }}
                >
                  Use a different email
                </Button>
              </form>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
