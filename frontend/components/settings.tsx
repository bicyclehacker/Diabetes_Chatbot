"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    User as UserIcon,
    Bell,
    Shield,
    Globe,
    Moon,
    Sun,
    Save,
    Trash2,
} from "lucide-react";

import { api } from "@/lib/api";

export interface User {
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    diabetesType?: string;
    diagnosisDate?: string;
    emergencyContact?: string;
    preferences?: {
        glucoseUnit?: string;
        timeFormat?: string;
        language?: string;
        theme?: string;
        timezone?: string;
    };
    notifications?: {
        medicationReminders?: boolean;
        glucoseAlerts?: boolean;
        appointmentReminders?: boolean;
        weeklyReports?: boolean;
        emergencyAlerts?: boolean;
        pushNotifications?: boolean;
        emailNotifications?: boolean;
        smsNotifications?: boolean;
    };
    privacy?: {
        shareDataWithDoctor?: boolean;
        anonymousAnalytics?: boolean;
        marketingEmails?: boolean;
        dataExport?: boolean;
    };
    // timestamps etc...
}

export function Settings() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Profile, Preferences, Notifications, Privacy
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        diabetesType: "",
        diagnosisDate: "",
        emergencyContact: "",
    });
    const [preferences, setPreferences] = useState({
        glucoseUnit: "mg-dl",
        timeFormat: "12-hour",
        language: "en",
        timezone: "Asia/Kolkata", // default
        theme: "light",
    });
    const [notifications, setNotifications] = useState({
        medicationReminders: true,
        glucoseAlerts: true,
        appointmentReminders: true,
        weeklyReports: false,
        emergencyAlerts: true,
        pushNotifications: true,
        emailNotifications: false,
        smsNotifications: true,
    });
    const [privacy, setPrivacy] = useState({
        shareDataWithDoctor: true,
        anonymousAnalytics: false,
        marketingEmails: false,
        dataExport: true,
    });

    // saving states per toggle to avoid double updates and show disabled state
    const [savingNotifications, setSavingNotifications] = useState<Record<string, boolean>>({});
    const [savingPrivacy, setSavingPrivacy] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await api.getUser();
                if (!userData) throw new Error("User not found");

                setUser(userData);

                setProfile({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    dateOfBirth: userData.dateOfBirth
                        ? userData.dateOfBirth.split("T")[0]
                        : "",
                    diabetesType: userData.diabetesType || "",
                    diagnosisDate: userData.diagnosisDate
                        ? userData.diagnosisDate.split("T")[0]
                        : "",
                    emergencyContact: userData.emergencyContact || "",
                });

                setPreferences({
                    glucoseUnit: userData.preferences?.glucoseUnit || "mg-dl",
                    timeFormat: userData.preferences?.timeFormat || "12-hour",
                    language: userData.preferences?.language || "en",
                    timezone: userData.preferences?.timezone || "Asia/Kolkata",
                    theme: userData.preferences?.theme || "light",
                });

                setNotifications({
                    medicationReminders:
                        userData.notifications?.medicationReminders ?? true,
                    glucoseAlerts: userData.notifications?.glucoseAlerts ?? true,
                    appointmentReminders:
                        userData.notifications?.appointmentReminders ?? true,
                    weeklyReports: userData.notifications?.weeklyReports ?? false,
                    emergencyAlerts: userData.notifications?.emergencyAlerts ?? true,
                    pushNotifications: userData.notifications?.pushNotifications ?? true,
                    emailNotifications:
                        userData.notifications?.emailNotifications ?? false,
                    smsNotifications: userData.notifications?.smsNotifications ?? true,
                });

                setPrivacy({
                    shareDataWithDoctor:
                        userData.privacy?.shareDataWithDoctor ?? true,
                    anonymousAnalytics: userData.privacy?.anonymousAnalytics ?? false,
                    marketingEmails: userData.privacy?.marketingEmails ?? false,
                    dataExport: userData.privacy?.dataExport ?? true,
                });
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to load user");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Generic persist helper for nested objects (notifications / privacy)
    const persistNestedField = async <T extends object>(
        topLevelKey: "notifications" | "privacy",
        newObject: T,
        keyBeingSaved: string,
        setSavingMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
        revertCallback: () => void
    ) => {
        try {
            // mark saving for this key
            setSavingMap((s) => ({ ...s, [keyBeingSaved]: true }));

            const payload = { [topLevelKey]: newObject } as Partial<User>;
            const updatedUser = await api.updateUser(payload);

            if (updatedUser) {
                setUser(updatedUser);
                if (topLevelKey === "notifications") {
                    setNotifications((_) => ({
                        ...notifications,
                        ...(updatedUser.notifications || (newObject as any)),
                    }));
                } else {
                    setPrivacy((_) => ({
                        ...privacy,
                        ...(updatedUser.privacy || (newObject as any)),
                    }));
                }
            }
        } catch (err) {
            console.error(`Failed to persist ${topLevelKey}`, err);
            // revert UI
            revertCallback();
            // small user-friendly feedback
            alert("Failed to save changes. Please try again.");
        } finally {
            // clear saving flag
            setSavingMap((s) => {
                const copy = { ...s };
                delete copy[keyBeingSaved];
                return copy;
            });
        }
    };

    // Notification toggle handler - optimistic update + persist
    const handleToggleNotification = async (
        key:
            | "medicationReminders"
            | "glucoseAlerts"
            | "appointmentReminders"
            | "weeklyReports"
            | "emergencyAlerts"
            | "pushNotifications"
            | "emailNotifications"
            | "smsNotifications",
        value: boolean
    ) => {
        const prevValue = notifications[key];
        const newNotifications = { ...notifications, [key]: value };

        // optimistic UI update
        setNotifications(newNotifications);

        await persistNestedField(
            "notifications",
            newNotifications,
            `notifications.${key}`,
            setSavingNotifications,
            () => setNotifications({ ...notifications, [key]: prevValue })
        );
    };

    // Privacy toggle handler - optimistic update + persist
    const handleTogglePrivacy = async (
        key: "shareDataWithDoctor" | "anonymousAnalytics" | "marketingEmails" | "dataExport",
        value: boolean
    ) => {
        const prevValue = (privacy as any)[key];
        const newPrivacy = { ...privacy, [key]: value };

        setPrivacy(newPrivacy);

        await persistNestedField(
            "privacy",
            newPrivacy,
            `privacy.${key}`,
            setSavingPrivacy,
            () => setPrivacy({ ...privacy, [key]: prevValue })
        );
    };

    // Save profile (explicit)
    const handleSaveProfile = async () => {
        try {
            const updated = await api.updateUser({ ...profile });
            if (updated) {
                setUser(updated);
                alert("Profile updated successfully!");
            } else {
                alert("Profile updated (no fresh data returned).");
            }
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Error updating profile.");
        }
    };

    // Save preferences (explicit)
    const handleSavePreferences = async () => {
        try {
            const updated = await api.updateUser({ preferences });
            if (updated) {
                setUser(updated);
                setPreferences(updated.preferences || preferences);
                alert("Preferences updated successfully!");
            } else {
                alert("Preferences updated (no fresh data returned).");
            }
        } catch (err) {
            console.error("Failed to update preferences", err);
            alert("Error updating preferences.");
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        const confirmDelete = confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );
        if (!confirmDelete) return;

        try {
            await api.deleteUser();
            alert("Account deleted successfully.");
            localStorage.clear();
            window.location.href = "/";
        } catch (err) {
            console.error("Failed to delete account", err);
            alert("Failed to delete account. Please try again.");
        }
    };

    if (loading) {
        return <div>Loading settings...</div>;
    }

    if (error) {
        return <div className="text-red-600">Error loading settings: {error}</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Profile Settings */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Manage your personal information and medical details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm">
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) =>
                                    setProfile({ ...profile, name: e.target.value })
                                }
                                className="h-9 sm:h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                onChange={(e) =>
                                    setProfile({ ...profile, email: e.target.value })
                                }
                                className="h-9 sm:h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={profile.phone}
                                onChange={(e) =>
                                    setProfile({ ...profile, phone: e.target.value })
                                }
                                className="h-9 sm:h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob" className="text-sm">
                                Date of Birth
                            </Label>
                            <Input
                                id="dob"
                                type="date"
                                value={profile.dateOfBirth}
                                onChange={(e) =>
                                    setProfile({ ...profile, dateOfBirth: e.target.value })
                                }
                                className="h-9 sm:h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diabetes-type" className="text-sm">
                                Diabetes Type
                            </Label>
                            <Select
                                value={profile.diabetesType}
                                onValueChange={(value) =>
                                    setProfile({ ...profile, diabetesType: value })
                                }
                            >
                                <SelectTrigger className="h-9 sm:h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="type-1">Type 1</SelectItem>
                                    <SelectItem value="type-2">Type 2</SelectItem>
                                    <SelectItem value="gestational">Gestational</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="diagnosis-date" className="text-sm">
                                Diagnosis Date
                            </Label>
                            <Input
                                id="diagnosis-date"
                                type="date"
                                value={profile.diagnosisDate}
                                onChange={(e) =>
                                    setProfile({ ...profile, diagnosisDate: e.target.value })
                                }
                                className="h-9 sm:h-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="emergency-contact" className="text-sm">
                            Emergency Contact
                        </Label>
                        <Input
                            id="emergency-contact"
                            placeholder="Name - Phone Number"
                            value={profile.emergencyContact}
                            onChange={(e) =>
                                setProfile({ ...profile, emergencyContact: e.target.value })
                            }
                            className="h-9 sm:h-10"
                        />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full sm:w-auto" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                    </Button>
                </CardContent>
            </Card>

            {/* App Preferences */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                        App Preferences
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Customize your app experience
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="glucose-unit" className="text-sm">
                                Glucose Unit
                            </Label>
                            <Select
                                value={preferences.glucoseUnit}
                                onValueChange={(value) =>
                                    setPreferences({ ...preferences, glucoseUnit: value })
                                }
                            >
                                <SelectTrigger className="h-9 sm:h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mg-dl">mg/dL</SelectItem>
                                    <SelectItem value="mmol-l">mmol/L</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time-format" className="text-sm">
                                Time Format
                            </Label>
                            <Select
                                value={preferences.timeFormat}
                                onValueChange={(value) =>
                                    setPreferences({ ...preferences, timeFormat: value })
                                }
                            >
                                <SelectTrigger className="h-9 sm:h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="12-hour">12 Hour</SelectItem>
                                    <SelectItem value="24-hour">24 Hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="language" className="text-sm">
                                Language
                            </Label>
                            <Select
                                value={preferences.language}
                                onValueChange={(value) =>
                                    setPreferences({ ...preferences, language: value })
                                }
                            >
                                <SelectTrigger className="h-9 sm:h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="theme" className="text-sm">
                                Theme
                            </Label>
                            <Select
                                value={preferences.theme}
                                onValueChange={(value) =>
                                    setPreferences({ ...preferences, theme: value })
                                }
                            >
                                <SelectTrigger className="h-9 sm:h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center">
                                            <Sun className="h-4 w-4 mr-2" />
                                            Light
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center">
                                            <Moon className="h-4 w-4 mr-2" />
                                            Dark
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleSavePreferences} className="w-full sm:w-auto" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                    </Button>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription className="text-sm">Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Medication Reminders</Label>
                                <p className="text-xs text-gray-500">Get notified when it's time to take your medication</p>
                            </div>
                            <Switch
                                checked={notifications.medicationReminders}
                                onCheckedChange={(checked: boolean) => handleToggleNotification("medicationReminders", checked)}
                                disabled={!!savingNotifications["notifications.medicationReminders"]}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Glucose Alerts</Label>
                                <p className="text-xs text-gray-500">Alerts for high or low glucose readings</p>
                            </div>
                            <Switch
                                checked={notifications.glucoseAlerts}
                                onCheckedChange={(checked: boolean) => handleToggleNotification("glucoseAlerts", checked)}
                                disabled={!!savingNotifications["notifications.glucoseAlerts"]}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Appointment Reminders</Label>
                                <p className="text-xs text-gray-500">Reminders for upcoming medical appointments</p>
                            </div>
                            <Switch
                                checked={notifications.appointmentReminders}
                                onCheckedChange={(checked: boolean) => handleToggleNotification("appointmentReminders", checked)}
                                disabled={!!savingNotifications["notifications.appointmentReminders"]}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Push Notifications</Label>
                                <p className="text-xs text-gray-500">Receive notifications on your device</p>
                            </div>
                            <Switch
                                checked={notifications.pushNotifications}
                                onCheckedChange={(checked: boolean) => handleToggleNotification("pushNotifications", checked)}
                                disabled={!!savingNotifications["notifications.pushNotifications"]}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Email Notifications</Label>
                                <p className="text-xs text-gray-500">Receive notifications via email</p>
                            </div>
                            <Switch
                                checked={notifications.emailNotifications}
                                onCheckedChange={(checked: boolean) => handleToggleNotification("emailNotifications", checked)}
                                disabled={!!savingNotifications["notifications.emailNotifications"]}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                        Privacy & Security
                    </CardTitle>
                    <CardDescription className="text-sm">Control your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Share Data with Doctor</Label>
                                <p className="text-xs text-gray-500">Allow your healthcare provider to access your data</p>
                            </div>
                            <Switch
                                checked={privacy.shareDataWithDoctor}
                                onCheckedChange={(checked: boolean) => handleTogglePrivacy("shareDataWithDoctor", checked)}
                                disabled={!!savingPrivacy["privacy.shareDataWithDoctor"]}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Anonymous Analytics</Label>
                                <p className="text-xs text-gray-500">Help improve the app with anonymous usage data</p>
                            </div>
                            <Switch
                                checked={privacy.anonymousAnalytics}
                                onCheckedChange={(checked: boolean) => handleTogglePrivacy("anonymousAnalytics", checked)}
                                disabled={!!savingPrivacy["privacy.anonymousAnalytics"]}
                            />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Data Export</Label>
                                <p className="text-xs text-gray-500">Allow exporting your health data</p>
                            </div>
                            <Switch
                                checked={privacy.dataExport}
                                onCheckedChange={(checked: boolean) => handleTogglePrivacy("dataExport", checked)}
                                disabled={!!savingPrivacy["privacy.dataExport"]}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-0 shadow-lg border-red-200">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-red-600">
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-sm">Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-3 sm:p-4 border border-red-200 rounded-lg bg-red-50">
                            <h3 className="font-medium text-red-800 text-sm sm:text-base">Delete Account</h3>
                            <p className="text-xs sm:text-sm text-red-600 mt-1">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <Button variant="destructive" onClick={handleDeleteAccount} className="mt-3" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
