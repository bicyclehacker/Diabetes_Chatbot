'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { api } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type PrescriptionProps = {
    onUploadSuccess?: () => void;
};

const Prescription: React.FC<PrescriptionProps> = ({ onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const [inputKey, setInputKey] = useState(Date.now());

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            // Find the first item that is an image
            const imageItem = Array.from(items).find(
                (item) => item.type.indexOf('image') !== -1
            );

            if (imageItem) {
                const imageFile = imageItem.getAsFile();

                if (imageFile) {
                    // Stop the browser from its default paste behavior
                    event.preventDefault();

                    // We have the file! Set state just like in handleFileChange
                    setFile(imageFile);
                    setPreview(URL.createObjectURL(imageFile));

                    toast.success('Image pasted from clipboard!');
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const uploaded = e.target.files?.[0];
        if (uploaded) {
            setFile(uploaded);
            setPreview(URL.createObjectURL(uploaded));
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please upload a prescription image first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        console.log('Form Data1: ', formData.get('file'));

        try {
            setLoading(true);

            // 'data' will contain your JSON: { message: '...', file: '...' }
            const data = await api.uploadPrescription(formData);

            toast.success(data.message);
            setFile(null);
            setPreview(null);
            setInputKey(Date.now());

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center mt-10">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-center">
                        Upload Prescription
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">Prescription Image</Label>
                        <p className="text-xs text-center text-gray-500">
                            Click to browse, or paste an image (Ctrl+V)
                        </p>
                        <Input
                            key={inputKey}
                            id="file"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="file:rounded-md file:border-0 file:text-sm file:font-medium 
                                    file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 
                                    cursor-pointer"
                        />
                    </div>

                    {preview && (
                        <div className="flex justify-center">
                            <img
                                src={preview}
                                alt="Prescription Preview"
                                className="w-48 h-48 object-cover rounded-lg border"
                            />
                        </div>
                    )}

                    <Button
                        className="w-full mt-4"
                        onClick={handleUpload}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Process
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Prescription;
