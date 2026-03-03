"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronsRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface KickOffDateFormProps {
    onNext: (date: Date) => void;
    projectTitle: string;
    initialDate?: Date;
}

export default function KickOffDateForm({ onNext, projectTitle, initialDate }: KickOffDateFormProps) {
    const [date, setDate] = useState<Date | undefined>(initialDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (date) {
            onNext(date);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="space-y-2">
                <h1 className="text-[32px] font-semibold text-[#00253E] leading-tight">
                    {projectTitle}
                </h1>
                <div className="flex items-center gap-2 text-[#00253E]">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-[18px] font-medium">Kick off Date</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="flex flex-col gap-2 max-w-2xl">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-[56px] justify-start text-left font-normal border-[#00253E]/20 rounded-[8px] text-lg px-4 hover:scale-100 active:scale-100 transition-all hover:border-[#00253E]/40 hover:bg-white",
                                    !date && "text-[#666666]"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-5 w-5 opacity-50" />
                                {date ? format(date, "dd - MM - yyyy") : <span>mm - dd - yyyy</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border border-gray-100 shadow-xl bg-white" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center justify-between max-w-2xl">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-[#00253E]/20 text-[#00253E] hover:bg-gray-50"
                        onClick={() => window.history.back()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={!date}
                        className="h-[48px] px-10 rounded-[8px] bg-primary text-[#00253E] font-semibold hover:bg-primary/90 transition-all duration-200 active:scale-95 flex items-center gap-2"
                    >
                        Continue
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
