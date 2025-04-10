import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 install with: npm install react-icons
import { profileApi } from "@/lib/api";

export const ChangePasswordForm = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handlePasswordChange = (e: any) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const toggleVisibility = (field: "current" | "new" | "confirm") => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handlePasswordSubmit = async (e: any) => {
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

        const response = await profileApi.changePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            userId : localStorage.getItem("userId")
        });

        const result = await response.json();
        alert(result.message);

        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setIsSubmitting(false);
        navigate("/profile");
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

    const renderPasswordInput = (
        id: string,
        label: string,
        field: keyof typeof passwordData,
        show: keyof typeof showPassword
    ) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <Input
                    id={id}
                    name={field}
                    type={showPassword[show] ? "text" : "password"}
                    value={passwordData[field]}
                    onChange={handlePasswordChange}
                    className="w-full pr-10"
                />
                <button
                    type="button"
                    onClick={() => toggleVisibility(show)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
                >
                    {showPassword[show] ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Change Your Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {renderPasswordInput("currentPassword", "Current Password", "currentPassword", "current")}
                {renderPasswordInput("newPassword", "New Password", "newPassword", "new")}
                {renderPasswordInput("confirmPassword", "Confirm New Password", "confirmPassword", "confirm")}

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
