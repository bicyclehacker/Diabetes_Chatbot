'use client';

import { Calendar } from '@/components/ui/calendar';
import { CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isSameDay, isToday } from 'date-fns';
import { CheckCircle2, Circle, Mail, Repeat } from 'lucide-react';
import { useState } from 'react';

const DayEvents = () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        undefined
    );
    const datesWithEvents = [new Date()]; // Example array of dates with events

    const getEventsForDate = (date: Date) => {
        // Example function to get events for a date
        return [];
    };

    const getEventColor = (eventType: string) => {
        // Example function to get event color based on type
        return 'bg-blue-100';
    };

    const getEventIcon = (eventType: string) => {
        // Example function to get event icon based on type
        return null;
    };

    const toggleTaskCompletion = (taskId: string) => {
        // Example function to toggle task completion
    };

    return (
        <CardContent>
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                    if (
                        date &&
                        (!selectedDate || !isSameDay(selectedDate, date))
                    ) {
                        setSelectedDate(date);
                    }
                }}
                modifiers={{
                    hasEvents: datesWithEvents,
                }}
                modifiersClassNames={{
                    hasEvents: 'font-bold',
                }}
                showOutsideDays={false}
                className="rounded-md border p-3"
                classNames={{
                    day: 'h-full w-full p-0 text-left align-top relative',
                    day_selected:
                        'bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground',
                    day_today: 'bg-accent text-accent-foreground font-semibold',
                    day_range_middle:
                        'aria-selected:bg-primary aria-selected:text-primary-foreground',
                }}
                components={{
                    DayContent: ({ date, activeModifiers }) => {
                        const dayEvents = getEventsForDate(date);
                        const isCurrentDay = isToday(date);
                        const isSelected = activeModifiers.selected;

                        return (
                            <div className="w-full h-full flex flex-col p-2 pointer-events-auto">
                                <div
                                    className={`text-sm font-medium mb-1 ${
                                        isSelected
                                            ? 'text-primary-foreground'
                                            : isCurrentDay
                                            ? 'text-accent-foreground font-bold'
                                            : 'text-foreground'
                                    }`}
                                >
                                    {format(date, 'd')}
                                </div>
                                <ScrollArea className="h-16">
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div
                                                key={event.id}
                                                className={`text-xs p-1 rounded border ${
                                                    isSelected
                                                        ? 'bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground'
                                                        : getEventColor(
                                                              event.type
                                                          )
                                                } flex items-center gap-1`}
                                            >
                                                {event.isTask && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTaskCompletion(
                                                                event.id
                                                            );
                                                        }}
                                                        className="flex-shrink-0"
                                                    >
                                                        {event.completed ? (
                                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                        ) : (
                                                            <Circle className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                )}
                                                {getEventIcon(event.type)}
                                                <span
                                                    className={`truncate ${
                                                        event.completed
                                                            ? 'line-through opacity-60'
                                                            : ''
                                                    }`}
                                                >
                                                    {event.title}
                                                </span>
                                                {event.emailReminder && (
                                                    <Mail className="h-2 w-2 ml-auto" />
                                                )}
                                                {event.frequency !== 'once' && (
                                                    <Repeat className="h-2 w-2 ml-auto" />
                                                )}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div
                                                className={`text-xs text-center ${
                                                    isSelected
                                                        ? 'text-primary-foreground/70'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                + {dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        );
                    },
                }}
            />
        </CardContent>
    );
};

export default DayEvents;
