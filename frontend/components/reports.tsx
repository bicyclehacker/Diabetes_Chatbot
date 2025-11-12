'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    FileText,
    Download,
    CalendarIcon,
    TrendingUp,
    Activity,
    Pill,
    Apple,
    BarChart3,
    TrashIcon,
} from 'lucide-react';
import { format } from 'date-fns';

import { Report } from '@/types/report';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
    const [selectedType, setSelectedType] = useState('comprehensive');
    const [date, setDate] = useState<Date>();
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchReports = () => {
        setLoading(true);
        api.getReports()
            .then(setReports)
            .catch((err) => console.error('Failed to fetch reports:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        // 1. Check if any report in our current list is generating
        const isAnyReportGenerating = reports.some(
            (r) => r.status === 'generating'
        );

        if (isAnyReportGenerating) {
            // 2. If yes, set up an interval to check for updates every 5 seconds
            const intervalId = setInterval(() => {
                console.log('Polling for report updates...');
                // We just call the same fetchReports function again
                api.getReports()
                    .then(setReports)
                    .catch((err) =>
                        console.error('Failed to poll reports:', err)
                    );
            }, 5000); // 5000ms = 5 seconds

            // 3. Clear the interval when the component unmounts
            //    or when the 'reports' state changes
            return () => clearInterval(intervalId);
        }

        // 4. If no reports are generating, this effect does nothing.
    }, [reports]); // This effect re-runs every time the 'reports' state changes

    const handleGenerateReport = async () => {
        setIsGenerating(true);

        let dateRangeText = '';

        if (selectedPeriod === 'custom') {
            if (!date) {
                toast.error('Please select a custom date.');
                setIsGenerating(false);
                return;
            }
            dateRangeText = `Custom: ${format(date, 'PPP')}`;
        } else {
            const periodTextMap = {
                'last-7-days': 'Last 7 Days',
                'last-30-days': 'Last 30 Days',
                'last-90-days': 'Last 90 Days',
            };
            dateRangeText =
                periodTextMap[selectedPeriod as keyof typeof periodTextMap];
        }

        try {
            const newReport = await api.generateReport({
                type: selectedType,
                period: selectedPeriod,
                dateRangeText: dateRangeText,
                customDate: selectedPeriod === 'custom' ? date : undefined,
            });

            setReports((prev) => [newReport, ...prev]);
            toast.success('Generate report successfully');
        } catch (err) {
            const errorMessage =
                (err as Error)?.message || 'An unknown error occurred';
            toast.error(`Failed to generate report: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async (report: Report) => {
        try {
            // We can't use res.download directly with a fetch.
            // The easiest way is to use a direct link, but this won't send auth headers.
            // The *correct* way for SPAs is to fetch the file as a blob.

            const blob = await api.downloadReport(report._id);

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary a-tag to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.title.replace(/ /g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            console.error('Failed to download report:', err);
        }
    };

    const handleView = async (report: Report) => {
        if (report.status !== 'ready') {
            toast.info('This report is still generating.');
            return; // Don't do anything if not ready
        }

        try {
            const blob = await api.downloadReport(report._id);

            const url = window.URL.createObjectURL(blob);

            window.open(url, '_blank');
        } catch (err) {
            console.error('Failed to view report:', err);
            toast.error('Failed to open report for viewing.');
        }
    };

    const handleDelete = async (report: Report) => {
        try {
            await api.deleteReport(report._id);
            // Remove the report from the state
            setReports((prev) => prev.filter((r) => r._id !== report._id));
            toast.success('Report deleted successfully');
        } catch (err) {
            console.error('Failed to delete report:', err);
            const errorMessage =
                (err as Error)?.message || 'An unknown error occurred';
            toast.error(`Failed to delete report: ${errorMessage}`);
        }
    };

    const getReportIcon = (type: string) => {
        const icons = {
            glucose: <Activity className="h-4 w-4 text-blue-500" />,
            medication: <Pill className="h-4 w-4 text-purple-500" />,
            meals: <Apple className="h-4 w-4 text-orange-500" />,
            comprehensive: <BarChart3 className="h-4 w-4 text-green-500" />,
        };
        return icons[type as keyof typeof icons];
    };

    const getStatusColor = (status: string) => {
        const colors = {
            ready: 'bg-green-100 text-green-800',
            generating: 'bg-yellow-100 text-yellow-800',
            scheduled: 'bg-blue-100 text-blue-800',
        };
        return colors[status as keyof typeof colors];
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Generate New Report */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">
                        Generate New Report
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Create detailed health reports for your records
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Report Type
                            </label>
                            <Select
                                value={selectedType}
                                onValueChange={setSelectedType}
                            >
                                <SelectTrigger className="h-9 sm:h-10">
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="comprehensive">
                                        Comprehensive Report
                                    </SelectItem>
                                    <SelectItem value="glucose">
                                        Glucose Trends
                                    </SelectItem>
                                    <SelectItem value="medication">
                                        Medication Adherence
                                    </SelectItem>
                                    <SelectItem value="meals">
                                        Meal Summary
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Time Period
                            </label>
                            <Select
                                value={selectedPeriod}
                                onValueChange={setSelectedPeriod}
                            >
                                <SelectTrigger className="h-9 sm:h-10">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="last-7-days">
                                        Last 7 Days
                                    </SelectItem>
                                    <SelectItem value="last-30-days">
                                        Last 30 Days
                                    </SelectItem>
                                    <SelectItem value="last-90-days">
                                        Last 90 Days
                                    </SelectItem>
                                    <SelectItem value="custom">
                                        Custom Range
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedPeriod === 'custom' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Custom Date Range
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal h-9 sm:h-10 bg-transparent"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date
                                            ? format(date, 'PPP')
                                            : 'Pick a date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    <Button
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">
                        Recent Reports
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Download and view your generated health reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div
                                key={report._id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-white space-y-2 sm:space-y-0"
                            >
                                <div className="flex items-start space-x-3 min-w-0 flex-1">
                                    <div className="shrink-0 mt-0.5">
                                        {getReportIcon(report.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-medium text-sm sm:text-base">
                                            {report.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            {report.dateRange}
                                        </p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Badge
                                                className={getStatusColor(
                                                    report.status
                                                )}
                                                variant="secondary"
                                            >
                                                {report.status}
                                            </Badge>
                                            <span className="text-xs text-gray-400">
                                                {report.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {report.status === 'ready' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs bg-transparent"
                                            onClick={() =>
                                                handleDownload(report)
                                            }
                                        >
                                            <Download className="h-3 w-3 mr-1" />
                                            Download
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 text-xs"
                                        onClick={() => handleView(report)}
                                        disabled={report.status !== 'ready'}
                                    >
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        View
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(report)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
