import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ChangePasswordForm = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate(); // react-router-dom v6+

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!passwordData.confirmPassword || !passwordData.currentPassword || !passwordData.newPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        setIsSubmitting(true);

        const response = await fetch("/api/change-password", {
            method: "PUT",  // Assuming you have an API endpoint to handle password changes
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                userId: localStorage.getItem("userId")
            })
        });

        const result = await response.json();
        alert(result.message);
        // Simulate API call
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsSubmitting(false);
        navigate("/profile"); // Redirect to profile page after successful password change
    };

    const handlePasswordChange = (e: any) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsSubmitting(false);
        navigate("/profile");
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Change Your Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                    </label>
                    <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange(e)}
                        className="w-full"
                    />
                </div>

                {/* New Password */}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange(e)}
                        className="w-full"
                    />
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                    </label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange(e)}
                        className="w-full"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="rounded-xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-instagram-primary hover:bg-instagram-primary/90 rounded-xl"
                    >
                        {isSubmitting ? "Changing..." : "Change Password"}
                    </Button>
                </div>
            </form>
        </div>
    );
};
