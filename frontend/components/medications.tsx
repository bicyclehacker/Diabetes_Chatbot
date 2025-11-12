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
}

export function Medications() {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);

    const [newMedication, setNewMedication] = useState({
        name: '',
        dosage: '',
        frequency: '',
        times: [''],
        notes: '',
    });

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingMedication, setEditingMedication] =
        useState<Medication | null>(null);

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
            // newMedication.times is already string[]
            const timesArray = newMedication.times.filter((t) => t !== '');

            const created = await api.addMedication({
                name: newMedication.name,
                dosage: newMedication.dosage,
                frequency: newMedication.frequency,
                times: timesArray,
                notes: newMedication.notes || undefined,
            });

            setMedications((prev) => [created, ...prev]);

            setNewMedication({
                name: '',
                dosage: '',
                frequency: '',
                times: [''], // reset to array with one empty string
                notes: '',
            });

            setIsAddOpen(false);
        } catch (err) {
            console.error('Failed to add medication:', err);
        }
    };

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

    const handleOpenEdit = (med: Medication) => {
        // Set the state to the med you clicked on and open the dialog
        setEditingMedication(med);
        setIsEditOpen(true);
    };

    const handleUpdateMedication = async () => {
        if (!editingMedication) return;

        try {
            const timesArray = editingMedication.times.filter((t) => t);

            // Call your existing API function
            const updated = await api.updateMedication(editingMedication._id, {
                name: editingMedication.name,
                dosage: editingMedication.dosage,
                frequency: editingMedication.frequency,
                times: timesArray,
                notes: editingMedication.notes || undefined,
            });

            // Update the medication in the main list
            setMedications((prev) =>
                prev.map((med) => (med._id === updated._id ? updated : med))
            );

            // Close the dialog and clear the state
            setIsEditOpen(false);
            setEditingMedication(null);
        } catch (err) {
            console.error('Failed to update medication:', err);
        }
    };

    function formatTimeWithAmPm(time24: string) {
        if (
            time24.toUpperCase().includes('AM') ||
            time24.toUpperCase().includes('PM')
        ) {
            return time24;
        }
        const [hourStr, minute] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12; // convert 0 to 12 for 12 AM
        return `${hour}:${minute} ${ampm}`;
    }

    const takenToday = medications.filter((med) => med.taken).length;
    const totalMedications = medications.length;
    const adherenceRate =
        totalMedications > 0
            ? Math.round((takenToday / totalMedications) * 100)
            : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
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
                            <CardTitle>My Medications</CardTitle>
                            <CardDescription>
                                Manage your daily medications and track
                                adherence
                            </CardDescription>
                        </div>
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
                                    {/* 8. Moved your "Add Form" JSX inside here */}
                                    <div className="p-4 bg-white space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                                            <div className="space-y-2">
                                                <Label>Times</Label>
                                                {newMedication.times.map(
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
                                                                value={time}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const updatedTimes =
                                                                        [
                                                                            ...newMedication.times,
                                                                        ];
                                                                    updatedTimes[
                                                                        index
                                                                    ] =
                                                                        e.target.value;
                                                                    setNewMedication(
                                                                        {
                                                                            ...newMedication,
                                                                            times: updatedTimes,
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                            {newMedication.times
                                                                .length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const updatedTimes =
                                                                            newMedication.times.filter(
                                                                                (
                                                                                    _,
                                                                                    i
                                                                                ) =>
                                                                                    i !==
                                                                                    index
                                                                            );
                                                                        setNewMedication(
                                                                            {
                                                                                ...newMedication,
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
                                                        setNewMedication({
                                                            ...newMedication,
                                                            times: [
                                                                ...newMedication.times,
                                                                '',
                                                            ],
                                                        })
                                                    }
                                                >
                                                    Add Time
                                                </button>
                                            </div>
                                        </div>
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
                                                // 9. Update Cancel button to close dialog
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

                            {/* --- Edit Medication Dialog --- */}
                            <Dialog
                                open={isEditOpen}
                                onOpenChange={setIsEditOpen}
                            >
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Edit Medication
                                        </DialogTitle>
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
                                                        value={
                                                            editingMedication.name
                                                        }
                                                        onChange={(e) =>
                                                            setEditingMedication(
                                                                {
                                                                    ...editingMedication,
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
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
                                                        value={
                                                            editingMedication.dosage
                                                        }
                                                        onChange={(e) =>
                                                            setEditingMedication(
                                                                {
                                                                    ...editingMedication,
                                                                    dosage: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
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
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setEditingMedication(
                                                                {
                                                                    ...editingMedication,
                                                                    frequency:
                                                                        value as any, // Cast to match type
                                                                }
                                                            )
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
                                                                Three Times
                                                                Daily
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
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    gap: 8,
                                                                }}
                                                            >
                                                                <input
                                                                    type="time"
                                                                    value={time}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
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
                                                                {editingMedication
                                                                    .times
                                                                    .length >
                                                                    1 && (
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
                                                            setEditingMedication(
                                                                {
                                                                    ...editingMedication,
                                                                    times: [
                                                                        ...editingMedication.times,
                                                                        '',
                                                                    ],
                                                                }
                                                            )
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
                                                        editingMedication.notes ||
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        setEditingMedication({
                                                            ...editingMedication,
                                                            notes: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            </div>
                                            {/* Buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={
                                                        handleUpdateMedication
                                                    }
                                                >
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setIsEditOpen(false)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>

                            {/* --- Upload Prescription Dialog --- */}
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
                                    {/* 10. Render Prescription component and pass function to close dialog */}
                                    <Prescription
                                        onUploadSuccess={() => {
                                            setIsUploadOpen(false); // Close dialog
                                            fetchMedications(); // Re-fetch list
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Medications List */}
                    <div className="space-y-3">
                        {medications.map((medication) => (
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
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm sm:text-base">
                                            {medication.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            {medication.dosage} -{' '}
                                            {medication.frequency}
                                        </p>

                                        <div className="text-xs text-gray-400">
                                            <span className="ml-1 flex flex-wrap gap-1">
                                                {medication.times.length > 0 ? (
                                                    medication.times.map(
                                                        (time, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {formatTimeWithAmPm(
                                                                    time
                                                                )}
                                                            </Badge>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-gray-500 italic">
                                                        No times set
                                                    </span>
                                                )}
                                            </span>

                                            <span className="flex gap-4 shrink-0">
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
