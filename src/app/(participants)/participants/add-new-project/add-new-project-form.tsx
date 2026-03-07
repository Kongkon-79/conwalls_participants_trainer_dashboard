

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ChevronsLeft, ChevronsRight, Scroll, User } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ProjectListsApiResponse } from "../_components/project-list-data-type";

import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";

type NameFormValues = {
  participantName: string;
};

type ProjectFormValues = {
  projectTitle: string;
};

const COOKIE_NAME = "googtrans";

export default function AddNewProjectForm() {
  const cookie = parseCookies()[COOKIE_NAME];
  const lang = cookie?.split("/")?.[2] || "en";
  const session = useSession();
  const token = (session?.data?.user as { accessToken?: string })?.accessToken;
  const [step, setStep] = useState(1);
  const [savedName, setSavedName] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();

  // Load name from localStorage on mount
  useEffect(() => {
    const name = localStorage.getItem("userName") || "";
    setSavedName(name);
  }, []);

  // ----------------- Step 1: Name Form -----------------
  const nameForm = useForm<NameFormValues>({
    defaultValues: { participantName: savedName },
  });

  const handleNameSubmit = (values: NameFormValues) => {
    localStorage.setItem("userName", values.participantName);
    setSavedName(values.participantName);
    setStep(2);
  };

  // ----------------- Step 2: Project Form -----------------
  const projectForm = useForm<ProjectFormValues>({
    defaultValues: { projectTitle: "" },
  });

  // ----------------- Fetch All Projects -----------------
  const { isLoading, isError, error } = useQuery<ProjectListsApiResponse>({
    queryKey: ["insight-engine-list"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/participant/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) {
        throw new Error("Failed to fetch projects");
      }
      return res.json();
    },
    staleTime: 0,
  });

  console.log("isLoading", isLoading);
  console.log("isError", isError);
  console.log("error", error);

  // const projectLists = data?.data?.items || []

  // ----------------- Add Project Mutation -----------------
  const { mutate: addProjectMutate, isPending } = useMutation({
    mutationKey: ["addProject"],
    mutationFn: async (projectTitle: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            participantName: savedName,
            projectTitle,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to add project");
      }

      return res.json();
    },
    onSuccess: () => {
      // Refetch projects after adding new
      queryClient.invalidateQueries({ queryKey: ["insight-engine-list"] });
      projectForm.reset();
      router.push("/participants");
      router.refresh();
    },
    onError: (err: Error) => {
      alert(err.message || "Something went wrong");
    },
  });

  const handleProjectSubmit = (values: ProjectFormValues) => {
    if (!savedName) {
      alert("Please enter your name first.");
      setStep(1);
      return;
    }

    addProjectMutate(values.projectTitle);
  };

  // ----------------- Step 3: Show Projects -----------------
  // const handleAddFurtherProject = () => {
  //   setStep(2)
  // }

  return (
    <div className=" mt-10 space-y-6">
      {/* first form  */}
      <div className="max-w-2xl">
        {step === 1 && (
          <Form {...nameForm}>
            <form
              onSubmit={nameForm.handleSubmit(handleNameSubmit)}
              className="space-y-4"
            >
              <FormField
                control={nameForm.control}
                name="participantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl md:text-2xl font-normal text-[#00253E] leading-normal">
                      <User className="inline -mt-1 mr-1" />{" "}
                      {lang === "de"
                        ? "Geben Sie Ihren Namen ein"
                        : "Enter your name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-[48px] border border-[#00253E] rounded-[8px] p-4 placeholder:text-[#666666] text-base font-medium text-[#00253E]"
                        placeholder={`${lang === "de" ? "Geben Sie Ihren Namen ein" : "Enter you name"}`}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="h-[50px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px] transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                >
                  {lang === "de" ? "weiter" : "Continue"}

                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </Form>
        )}
      </div>

      {/* second form  */}

      <div className="max-w-2xl">
        {step === 2 && (
          <Form {...projectForm}>
            <form
              onSubmit={projectForm.handleSubmit(handleProjectSubmit)}
              className="space-y-4"
            >
              <FormField
                control={projectForm.control}
                name="projectTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl md:text-2xl font-normal text-[#00253E] leading-normal">
                      <Scroll className="inline -mt-1 mr-1" />
                      {lang === "de"
                        ? "Geben Sie den Projektnamen ein"
                        : "Enter the name of the change project"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-[48px] border border-[#00253E] rounded-[8px] p-4 placeholder:text-[#666666] text-base font-medium text-[#00253E]"
                        placeholder={`${lang === "de" ? "Geben Sie den Projektnamen ein" : "Enter your project name"}`}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="h-[50px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px] transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                  onClick={() => setStep(1)}
                >
                  {lang !== "de" && <ChevronsLeft className="h-4 w-4" />}
                  {lang === "de" ? "zurück" : "Back"}
                  {lang !== "de" && <ChevronsRight className="h-4 w-4" />}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="notranslate h-[50px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px] transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                >
                  {isPending
                    ? lang === "de"
                      ? "Wird hinzugefügt..."
                      : "Adding..."
                    : lang === "de"
                      ? "Hinzufügen"
                      : "Add"}
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </Form>
        )}
      </div>

    </div>
  );
}
