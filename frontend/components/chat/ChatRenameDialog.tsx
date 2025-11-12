'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatRenameDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (newTitle: string) => void;
    initialTitle: string;
}

export function ChatRenameDialog({
    isOpen,
    onOpenChange,
    onSubmit,
    initialTitle,
}: ChatRenameDialogProps) {
    const [title, setTitle] = useState(initialTitle);

    // Reset title when dialog opens with a new initial title
    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
        }
    }, [isOpen, initialTitle]);

    const handleSubmit = () => {
        if (title.trim()) {
            onSubmit(title.trim());
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rename Chat</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter new chat title..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                        className="w-full"
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!title.trim()}>
                        Rename
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
