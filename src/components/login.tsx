'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

export default function Login({ onLogin }: { onLogin: () => void }) {
	const [userId, setUserId] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!userId || !password) return
		onLogin()
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader>
					<CardTitle className="text-center text-xl text-red-700">Log In to Dashboard</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="userId">User ID</Label>
							<Input
								id="userId"
								type="text"
								value={userId}
								onChange={(e) => setUserId(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="showPassword"
								checked={showPassword}
								onCheckedChange={(checked: boolean) => setShowPassword(checked)}
							/>
							<Label htmlFor="showPassword">Show Password</Label>
						</div>
						<Button
							type="submit"
							className="w-full bg-red-600 hover:bg-red-700 text-white"
							disabled={!userId || !password}
						>
							Log In
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
