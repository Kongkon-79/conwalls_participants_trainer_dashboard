/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ChevronLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSystemSettings } from "@/hooks/use-system-settings";
import { Measure } from "./measure-types";
import aiIcon from "../../../../../../public/assets/images/ai.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { parseCookies } from "nookies";
import Image from "next/image";
import Link from "next/link";

interface MeasureFormProps {
  projectId: string;
  stakeholderId: string;
  initialData?: Measure | null;
  onCancel: () => void;
  onSuccess: () => void;
}

type MeasureFormValues = {
  category: string;
  type: string;
  name: string;
  startWeeks: number;
  timing: string;
};

const COOKIE_NAME = "googtrans";
export default function MeasureForm({
  projectId,
  stakeholderId,
  initialData,
  onCancel,
  onSuccess,
}: MeasureFormProps) {
  const cookie = parseCookies()[COOKIE_NAME];
  const lang = cookie?.split("/")?.[2] || "de";
  const session = useSession();
  const token = (session?.data?.user as { accessToken?: string })?.accessToken;
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState<"en" | "de">("de");

  useEffect(() => {
    const cookies = parseCookies();
    const googtrans = cookies.googtrans;
    if (googtrans) {
      const lang = googtrans.split("/")[2];
      if (lang === "de" || lang === "en") {
        setLanguage(lang as "en" | "de");
      }
    }
  }, []);

  const { data: systemSettings } = useSystemSettings();
  const categories = systemSettings?.categoryTypes || [];
  const allMeasureTypes = systemSettings?.measureTypes || [];

  const getLocalizedLabel = (item?: {
    name: string;
    labels?: { en: string; de: string };
  }) => {
    if (!item) return "";
    return lang === "de"
      ? item.labels?.de || item.labels?.en || item.name
      : item.labels?.en || item.name;
  };

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<MeasureFormValues>({
      defaultValues: {
        category: initialData?.category || "",
        type: initialData?.type || "",
        name: initialData?.name || "",
        startWeeks: initialData?.startWeeks || 0,
        timing: initialData?.timing || "pre",
      },
    });

  const selectedCategory = watch("category");
  const timingValue = watch("timing");
  const typeValue = watch("type");
  const filteredMeasureTypes =
    categories.find((category) => category.name === selectedCategory)
      ?.measureTypes || allMeasureTypes;

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category || "",
        type: initialData.type || "",
        name: initialData.name || "",
        startWeeks: initialData.startWeeks || 0,
        timing: initialData.timing || "pre",
      });
    }
  }, [initialData, reset]);

  const submitMutation = useMutation({
    mutationFn: async (values: MeasureFormValues) => {
      const isEditing = !!initialData;
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/measure/${initialData._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/measure/${projectId}/stakeholders/${stakeholderId}`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (!res.ok)
        throw new Error(`Failed to ${isEditing ? "update" : "create"} measure`);
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        `Measure ${initialData ? "updated" : "created"} successfully`,
      );
      queryClient.invalidateQueries({
        queryKey: ["measures", projectId, stakeholderId],
      });
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (values: MeasureFormValues) => {
    submitMutation.mutate({
      ...values,
      startWeeks: Number(values.startWeeks),
    });
  };

  return (
    <div className="w-full space-y-8 pb-10">
      <div className="space-y-0">
        <h1 className="text-[32px] font-semibold text-[#00253E]">
          {initialData
            ? lang === "de"
              ? "Maßnahme bearbeiten"
              : "Edit Measure"
            : lang === "de"
              ? "Maßnahme hinzufügen"
              : "Add Measure"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category */}
        {/* <div className="space-y-3">
          <label className="text-[20px] font-medium text-[#00253E]">
            Category
          </label>
          <Select
            value={selectedCategory}
            onValueChange={(v) => {
              setValue("category", v);
              setValue("type", ""); 
            }}
          >
            <SelectTrigger className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[48px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl placeholder:text-[#616161]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white ">
              {categories?.map((c) => (
                <SelectItem key={c.name} value={c.name} className="notranslate">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        {/* Type */}
        {/* <div className="space-y-3 ">
          <label className="text-[20px] font-medium text-[#00253E]">Type</label>
          <Select value={typeValue} onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[48px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl placeholder:text-[#616161]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {allMeasureTypes?.map((t) => (
                <SelectItem key={t?.name} value={t?.name} className="notranslate">
                  {t?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        <div className="space-y-3">
          <label className="text-[20px] font-medium text-[#00253E] notranslate">
            {lang === "de" ? "Kategorie" : "Category"}
          </label>

          <Select
            value={selectedCategory}
            onValueChange={(v) => {
              setValue("category", v);
              setValue("type", "");
            }}
          >
            <SelectTrigger className="notranslate w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[48px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl placeholder:text-[#616161]">
              <SelectValue
                placeholder={lang === "de" ? "Kategorie" : "Category"}
              />
            </SelectTrigger>
            <SelectContent className="bg-white notranslate">
              {categories?.map((c) => (
                <SelectItem key={c.name} value={c.name} className="notranslate">
                  {getLocalizedLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-[20px] font-medium text-[#00253E] notranslate">
            {lang === "de" ? "Typ" : "Type"}
          </label>

          <Select value={typeValue} onValueChange={(v) => setValue("type", v)}>
            <SelectTrigger className="notranslate w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[48px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl placeholder:text-[#616161]">
              <SelectValue
                placeholder={lang === "de" ? "Typ auswählen" : "Select Type"}
              />
            </SelectTrigger>
            <SelectContent className="bg-white notranslate">
              {filteredMeasureTypes?.map((t) => (
                <SelectItem
                  key={t?.name}
                  value={t?.name}
                  className="notranslate"
                >
                  {getLocalizedLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Name */}
        <div className="space-y-3 ">
          <label className="text-[20px] font-medium text-[#00253E]">Name</label>
          <Input
            {...register("name", { required: true })}
            placeholder="Enter Measures Name"
            className="w-full !rounded-[8px] border border-[#00253E] px-4 py-3 min-h-[48px] text-[#00253E] font-normal leading-[110%] text-lg md:text-xl placeholder:text-[#616161]"
          />
        </div>

        {/* Start Weeks */}
        <div className="space-y-3">
          <label className="text-[20px] font-medium text-[#00253E]">
            Start
          </label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0"
              {...register("startWeeks", { required: true })}
              className="w-24 h-[48px] border-[#00253E] text-[18px] rounded-[4px] text-center focus-visible:ring-primary shadow-sm"
            />
            <span className="text-lg md:text-xl font-normal text-[#00253E] leading-normal">
              Weeks
            </span>
          </div>
        </div>

        {/* Timing */}
        <div className="flex items-center justify-between space-y-3 pt-6 ">
          <div className="flex items-center gap-4">
            <RadioGroup
              className="flex items-center gap-6 border border-[#00253E] rounded-[8px] px-4 py-3"
              value={timingValue}
              onValueChange={(v: string) => setValue("timing", v)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="pre"
                  id="pre"
                  className="text-primary border-primary w-5 h-5"
                />
                <label
                  htmlFor="pre"
                  className="text-lg md:text-xl font-normal leading-normal text-[#001B31] notranslate"
                >
                  Pre
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="post"
                  id="post"
                  className="text-primary border-primary w-5 h-5"
                />
                <label
                  htmlFor="post"
                  className="text-lg md:text-xl font-normal leading-normal text-[#001B31] notranslate"
                >
                  Post
                </label>
              </div>
            </RadioGroup>
            <p className="text-lg md:text-xl font-normal text-[#00253E] leading-normal notranslate">
              kick off
            </p>
          </div>
          <div>
            <Link
              // href={`/participants/${projectId}/kick-off-story`}
              href={{
                pathname: `/participants/${projectId}/kick-off-story`,
                query: {
                  projectId: projectId,
                  stakeholderId: stakeholderId,
                  type: typeValue,
                },
              }}
            >
              <button className="flex items-center gap-1 bg-[#00253E] rounded-[8px] py-4 px-6 text-base text-white leading-[110%] font-medium notranslate">
                <Image
                  src={aiIcon}
                  alt="AI Icon"
                  className="w-5 h-5 mr-2 object-contain"
                />{" "}
                AI <ChevronsRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 ">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-[48px] px-8 rounded-[8px] flex items-center gap-2 border-primary font-medium text-[#00253E] hover:bg-gray-50 bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </Button>

          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="bg-[#B5CC2E] hover:bg-[#A3B829] text-[#00253E] px-8 h-[48px] rounded-[8px] flex items-center gap-2 font-semibold transition-all duration-200"
          >
            {submitMutation.isPending
              ? lang === "de"
                ? "Speichern..."
                : "Saving..."
              : lang === "de"
                ? "Weiter"
                : "Continue"}
            {!submitMutation.isPending && <ChevronsRight className="w-5 h-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
