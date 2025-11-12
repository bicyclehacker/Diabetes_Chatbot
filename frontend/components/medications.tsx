'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Plus,
    Pill,
    Clock,
    CheckCircle,
    AlertCircle,
    TrashIcon,
    Upload,
    Pencil,
    Search, // Added Search
} from 'lucide-react';

import Prescription from './Prescription';

import { api } from '@/lib/api';

export interface Medication {
    _id: string;
    name: string;
    dosage: string;
    frequency: 'Once Daily' | 'Twice Daily' | 'Three Times Daily' | 'As Needed';
    times: string[];
    taken: boolean;
    lastTaken?: string;
    notes?: string;
    createdAt: string;
    isNotification: boolean; // <-- 1. ADDED FIELD TO INTERFACE
}

export function Medications() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);

    // State for "Add" dialog
    const [newMedication, setNewMedication] = useState({
        name: '',
        dosage: '',
        frequency: '',
        times: [''],
        notes: '',
    });
    const [addNotification, setAddNotification] = useState(true); // <-- 2. ADDED STATE FOR ADD SWITCH

    // State for "Edit" dialog
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingMedication, setEditingMedication] =
        useState<Medication | null>(null);

    // State for other UI
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Added Search state

    const fetchMedications = () => {
        setLoading(true);
        api.getMedications()
            .then((data) => {
                setMedications(data);
            })
            .catch((err) => console.error('Failed to load medications:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchMedications();
    }, []);

    const handleAddMedication = async () => {
        try {
            const timesArray = newMedication.times.filter((t) => t !== '');

            const created = await api.addMedication({
                name: newMedication.name,
                dosage: newMedication.dosage,
                frequency: newMedication.frequency as any,
                times: timesArray,
                notes: newMedication.notes || undefined,
                isNotification: addNotification, // <-- 3. PASS SWITCH STATE
            });

            setMedications((prev) => [created, ...prev]);

            // Reset form
            setNewMedication({
                name: '',
                dosage: '',
                frequency: '',
                times: [''],
                notes: '',
            });
            setAddNotification(true); // Reset switch
            setIsAddOpen(false); // Close dialog
        } catch (err) {
            console.error('Failed to add medication:', err);
        }
    };

    // --- 4. ADDED BACK EDIT/UPDATE FUNCTIONS ---
    const handleOpenEdit = (med: Medication) => {
        setEditingMedication(med);
        setIsEditOpen(true);
    };

    const handleUpdateMedication = async () => {
        if (!editingMedication) return;

        try {
            const timesArray = editingMedication.times.filter((t) => t);

            // Call API with all editable fields, including isNotification
            const updated = await api.updateMedication(editingMedication._id, {
                name: editingMedication.name,
                dosage: editingMedication.dosage,
                frequency: editingMedication.frequency,
                times: timesArray,
                notes: editingMedication.notes || undefined,
                isNotification: editingMedication.isNotification,
            });

            // Update list in UI
            setMedications((prev) =>
                prev.map((med) => (med._id === updated._id ? updated : med))
            );

            // Close dialog
            setIsEditOpen(false);
            setEditingMedication(null);
        } catch (err) {
            console.error('Failed to update medication:', err);
        }
    };
    // --- END OF ADDED FUNCTIONS ---

    const toggleMedicationTaken = async (id: string, currentTaken: boolean) => {
        try {
            const updated = await api.updateMedication(id, {
                taken: !currentTaken,
                lastTaken: !currentTaken ? new Date().toISOString() : undefined,
            });
            setMedications((prev) =>
                prev.map((med) => (med._id === id ? updated : med))
            );
        } catch (error) {
            console.error('Failed to toggle taken:', error);
        }
    };

    const handleDeleteMedication = async (id: string) => {
        try {
            await api.deleteMedication(id);
            setMedications((prev) => prev.filter((med) => med._id !== id));
        } catch (err) {
            console.error('Failed to delete medication:', err);
        }
    };

    function formatTimeWithAmPm(time24: string) {
        if (!time24 || time24.includes('AM') || time24.includes('PM'))
            return time24;
        const [hourStr, minute] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // convert 0 to 12 for 12 AM
        return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
    }

    const takenToday = medications.filter((med) => med.taken).length;
    const totalMedications = medications.length;
    const adherenceRate =
        totalMedications > 0
            ? Math.round((takenToday / totalMedications) * 100)
            : 0;

    // Filter logic for search
    const filteredMedications = medications.filter((med) =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add this new helper function
    function formatTimeForInput(timeStr: string): string {
        if (!timeStr) return '';

        let hour = 0;
        let minute = 0;

        // Check if it's 12-hour format (e.g., "02:30 PM")
        const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (ampmMatch) {
            hour = parseInt(ampmMatch[1], 10);
            minute = parseInt(ampmMatch[2], 10);
            const ampm = ampmMatch[3].toUpperCase();

            if (ampm === 'PM' && hour !== 12) {
                hour += 12;
            }
            if (ampm === 'AM' && hour === 12) {
                hour = 0; // Midnight case
            }
        }
        // Check if it's 24-hour format (e.g., "14:30")
        else {
            const [hourStr, minuteStr] = timeStr.split(':');
            hour = parseInt(hourStr, 10);
            minute = parseInt(minuteStr, 10);
        }

        if (isNaN(hour) || isNaN(minute)) return '';

        // Return in "HH:mm" format
        return `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')}`;
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards (Unchanged) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Adherence
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {adherenceRate}%
                        </div>
                        <p className="text-xs text-gray-600">
                            {takenToday} of {totalMedications} medications taken
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Medications
                        </CardTitle>
                        <Pill className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {totalMedications}
                        </div>
                        <p className="text-xs text-gray-600">
                            Currently prescribed
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Next Dose
                        </CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            20:00
                        </div>
                        <p className="text-xs text-gray-600">Metformin 500mg</p>
                    </CardContent>
                </Card>
            </div>

            {/* Medications List */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Medications</CardTitle>
                            <CardDescription>
                                Manage your daily medications and track
                                adherence
                            </CardDescription>
                        </div>
                        {/* Buttons section (unchanged) */}
                        <div className="flex justify-end m-4 space-x-2">
                            {/* --- Add Medication Dialog --- */}
                            <Dialog
                                open={isAddOpen}
                                onOpenChange={setIsAddOpen}
                            >
                                <DialogTitle></DialogTitle>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Medication
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Add New Medication
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="p-4 bg-white space-y-4">
                                        {/* ... (Your form inputs: Name, Dosage, Frequency, Times) ... */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="med-name">
                                                    Medication Name
                                                </Label>
                                                <Input
                                                    id="med-name"
                                                    placeholder="Enter medication name"
                                                    value={newMedication.name}
                                                    onChange={(e) =>
                                                        setNewMedication({
                                                            ...newMedication,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            {/* Dosage */}
                                            <div className="space-y-2">
                                                <Label htmlFor="dosage">
                                                    Dosage
                                                </Label>
                                                <Input
                                                    id="dosage"
                                                    placeholder="e.g., 500mg, 10 units"
                                                    value={newMedication.dosage}
                                                    onChange={(e) =>
                                                        setNewMedication({
                                                            ...newMedication,
                                                            dosage: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            {/* Frequency */}
                                            <div className="space-y-2">
                                                <Label htmlFor="frequency">
                                                    Frequency
                                                </Label>
                                                <Select
                                                    value={
                                                        newMedication.frequency
                                                    }
                                                    onValueChange={(value) =>
                                                        setNewMedication({
                                                            ...newMedication,
                                                            frequency: value,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Once Daily">
                                                            Once Daily
                                                        </SelectItem>
                                                        <SelectItem value="Twice Daily">
                                                            Twice Daily
                                                        </SelectItem>
                                                        <SelectItem value="Three Times Daily">
                                                            Three Times Daily
                                                        </SelectItem>
                                                        <SelectItem value="As Needed">
                                                            As Needed
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {/* Times */}
                                            <div className="space-y-2">
                                                {/* ... (your times map logic) ... */}
                                            </div>
                                        </div>
                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <Label htmlFor="med-notes">
                                                Notes (Optional)
                                            </Label>
                                            <Input
                                                id="med-notes"
                                                placeholder="Special instructions"
                                                value={newMedication.notes}
                                                onChange={(e) =>
                                                    setNewMedication({
                                                        ...newMedication,
                                                        notes: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* --- 5. ADDED SWITCH FOR NOTIFICATIONS --- */}
                                        <div className="flex items-center justify-between space-x-2 pt-2">
                                            <Label
                                                htmlFor="add-notification"
                                                className="font-medium"
                                            >
                                                Enable Email Notifications
                                            </Label>
                                            <Switch
                                                id="add-notification"
                                                checked={addNotification}
                                                onCheckedChange={
                                                    setAddNotification
                                                }
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleAddMedication}
                                                disabled={
                                                    !newMedication.name ||
                                                    !newMedication.dosage ||
                                                    !newMedication.frequency
                                                }
                                            >
                                                Add Medication
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setIsAddOpen(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* --- Upload Prescription Dialog (Unchanged) --- */}
                            <Dialog
                                open={isUploadOpen}
                                onOpenChange={setIsUploadOpen}
                            >
                                <DialogTitle></DialogTitle>

                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Prescription
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md p-0">
                                    <Prescription
                                        onUploadSuccess={() => {
                                            setIsUploadOpen(false);
                                            fetchMedications();
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* --- 6. ADDED SEARCH BAR --- */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search medications by name..."
                            className="pl-8 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* --- 7. ADDED BACK EDIT DIALOG --- */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTitle></DialogTitle>

                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Medication</DialogTitle>
                            </DialogHeader>
                            {/* Check if editingMedication exists before rendering form */}
                            {editingMedication && (
                                <div className="p-4 bg-white space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-med-name">
                                                Medication Name
                                            </Label>
                                            <Input
                                                id="edit-med-name"
                                                value={editingMedication.name}
                                                onChange={(e) =>
                                                    setEditingMedication({
                                                        ...editingMedication,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        {/* Dosage */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-dosage">
                                                Dosage
                                            </Label>
                                            <Input
                                                id="edit-dosage"
                                                value={editingMedication.dosage}
                                                onChange={(e) =>
                                                    setEditingMedication({
                                                        ...editingMedication,
                                                        dosage: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        {/* Frequency */}
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-frequency">
                                                Frequency
                                            </Label>
                                            <Select
                                                value={
                                                    editingMedication.frequency
                                                }
                                                onValueChange={(value) =>
                                                    setEditingMedication({
                                                        ...editingMedication,
                                                        frequency: value as any, // Cast to match type
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Once Daily">
                                                        Once Daily
                                                    </SelectItem>
                                                    <SelectItem value="Twice Daily">
                                                        Twice Daily
                                                    </SelectItem>
                                                    <SelectItem value="Three Times Daily">
                                                        Three Times Daily
                                                    </SelectItem>
                                                    <SelectItem value="As Needed">
                                                        As Needed
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Times */}
                                        <div className="space-y-2">
                                            <Label>Times</Label>
                                            {editingMedication.times.map(
                                                (time, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: 8,
                                                        }}
                                                    >
                                                        <input
                                                            type="time"
                                                            // Apply the new function here:
                                                            value={formatTimeForInput(
                                                                time
                                                            )}
                                                            onChange={(e) => {
                                                                const updatedTimes =
                                                                    [
                                                                        ...editingMedication.times,
                                                                    ];
                                                                updatedTimes[
                                                                    index
                                                                ] =
                                                                    e.target.value;
                                                                setEditingMedication(
                                                                    {
                                                                        ...editingMedication,
                                                                        times: updatedTimes,
                                                                    }
                                                                );
                                                            }}
                                                        />
                                                        {editingMedication.times
                                                            .length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updatedTimes =
                                                                        editingMedication.times.filter(
                                                                            (
                                                                                _,
                                                                                i
                                                                            ) =>
                                                                                i !==
                                                                                index
                                                                        );
                                                                    setEditingMedication(
                                                                        {
                                                                            ...editingMedication,
                                                                            times: updatedTimes,
                                                                        }
                                                                    );
                                                                }}
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingMedication({
                                                        ...editingMedication,
                                                        times: [
                                                            ...editingMedication.times,
                                                            '',
                                                        ],
                                                    })
                                                }
                                            >
                                                Add Time
                                            </button>
                                        </div>
                                    </div>
                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-med-notes">
                                            Notes (Optional)
                                        </Label>
                                        <Input
                                            id="edit-med-notes"
                                            value={
                                                editingMedication.notes || ''
                                            }
                                            onChange={(e) =>
                                                setEditingMedication({
                                                    ...editingMedication,
                                                    notes: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* --- 8. ADDED SWITCH TO EDIT DIALOG --- */}
                                    <div className="flex items-center justify-between space-x-2 pt-2">
                                        <Label
                                            htmlFor="edit-notification"
                                            className="font-medium"
                                        >
                                            Enable Email Notifications
                                        </Label>
                                        <Switch
                                            id="edit-notification"
                                            checked={
                                                editingMedication.isNotification
                                            }
                                            onCheckedChange={(checked) =>
                                                setEditingMedication({
                                                    ...editingMedication,
                                                    isNotification: checked,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleUpdateMedication}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* --- 9. UPDATED LIST TO USE filteredMedications AND SHOW EDIT BUTTON --- */}
                    <div className="space-y-3">
                        {loading && <p>Loading medications...</p>}
                        {!loading && filteredMedications.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                No medications found.
                            </p>
                        )}
                        {filteredMedications.map((medication) => (
                            <div
                                key={medication._id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-white space-y-3 sm:space-y-0"
                            >
                                <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1">
                                    <div className="flex items-center space-x-2 shrink-0">
                                        <Switch
                                            checked={medication.taken}
                                            onCheckedChange={() =>
                                                toggleMedicationTaken(
                                                    medication._id,
                                                    medication.taken
                                                )
                                            }
                                        />
                                        {medication.taken ? (
                                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-0">
                                        <p className="font-medium text-sm sm:text-base">
                                            {medication.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            {medication.dosage} -{' '}
                                            {medication.frequency}
                                        </p>

                                        {/* --- 10. REPLACED BADGE/BUTTON LOGIC --- */}
                                        <div className="text-xs text-gray-400 mt-2 flex items-center ">
                                            <span className="ml-1 flex flex-wrap gap-1">
                                                {/* Use flatMap to split strings that might contain commas */}
                                                {medication.times.length > 0 &&
                                                    medication.times
                                                        .flatMap((t) =>
                                                            t.split(',')
                                                        )
                                                        .filter(
                                                            (time) =>
                                                                time.trim() !==
                                                                ''
                                                        )
                                                        .map((time, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {/* Trim whitespace just in case */}
                                                                {formatTimeWithAmPm(
                                                                    time.trim()
                                                                )}
                                                            </Badge>
                                                        ))}

                                                {/* Show "No times set" only if the array is truly empty */}
                                                {medication.times.length ===
                                                    0 && (
                                                    <span className="text-gray-500 italic">
                                                        No times set
                                                    </span>
                                                )}
                                            </span>

                                            <span className="flex gap-1 shrink-0">
                                                <Button
                                                    variant="outline"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() =>
                                                        handleOpenEdit(
                                                            medication
                                                        )
                                                    }
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() =>
                                                        handleDeleteMedication(
                                                            medication._id
                                                        )
                                                    }
                                                >
                                                    <TrashIcon className="h-3 w-3" />
                                                </Button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end sm:text-right space-x-2 sm:space-y-1 sm:space-x-0 sm:flex-col">
                                    {medication.notes && (
                                        <p className="text-xs sm:text-sm text-gray-600 max-w-xs truncate flex-1 sm:flex-none">
                                            {medication.notes}
                                        </p>
                                    )}
                                    {medication.lastTaken && (
                                        <p className="text-xs text-gray-400 hidden sm:block">
                                            Last taken:{' '}
                                            {medication.lastTaken && (
                                                <>
                                                    {new Date(
                                                        medication.lastTaken
                                                    ).toLocaleDateString()}{' '}
                                                    at{' '}
                                                    {new Date(
                                                        medication.lastTaken
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </>
                                            )}
                                        </p>
                                    )}
                                    <Badge
                                        variant={
                                            medication.taken
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="shrink-0"
                                    >
                                        {medication.taken ? 'Taken' : 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
