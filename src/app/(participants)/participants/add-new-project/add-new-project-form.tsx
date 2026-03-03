// "use client";

// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
// import { useForm } from "react-hook-form";
// import { ChevronsRight, Plus, Scroll, User } from "lucide-react";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";
// import { ProjectListsApiResponse } from "../_components/project-list-data-type";
// import moment from "moment";

// type NameFormValues = {
//   participantName: string;
// };

// type ProjectFormValues = {
//   projectTitle: string;
// };

// type Project = {
//   id: string;
//   name: string;
//   createdAt: string;
// };

// export default function AddNewProjectForm() {
//   const session = useSession();
//   const token = (session?.data?.user as { accessToken?: string })?.accessToken;
//   const [step, setStep] = useState(1);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [savedName, setSavedName] = useState("");

//   // Load name from localStorage on mount
//   useEffect(() => {
//     const name = localStorage.getItem("userName") || "";
//     setSavedName(name);
//   }, []);

//   // ----------------- Step 1: Name Form -----------------
//   const nameForm = useForm<NameFormValues>({
//     defaultValues: { participantName: savedName },
//   });

//   const handleNameSubmit = (values: NameFormValues) => {
//     localStorage.setItem("userName", values.participantName);
//     setSavedName(values.participantName);
//     setStep(2);
//   };

//   // ----------------- Step 2: Project Form -----------------
//   const projectForm = useForm<ProjectFormValues>({
//     defaultValues: { projectTitle: "" },
//   });

//     const { data, isLoading, isError, error } = useQuery<ProjectListsApiResponse>(
//     {
//       queryKey: ["projects"],
//       queryFn: async () => {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );
//         if (!res.ok) {
//           throw new Error("Failed to fetch projects");
//         }
//         return res.json();
//       },
//     },
//   );

//   console.log("isLoading", isLoading);
//   console.log("isError", isError);
//   console.log("error", error);

//   console.log("project data", data);

//   const projectLists = data?.data?.items || [];

//   // -----------------post API Mutation -----------------
//   const { mutate: addProjectMutate, isPending } = useMutation({
//     mutationKey: ["addProject"],
//     mutationFn: async (projectTitle: string) => {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/submit`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           participantName: savedName,
//           projectTitle,
//         }),
//       });

//       if (!res.ok) {
//         throw new Error("Failed to add project");
//       }

//       return res.json();
//     },
//   });

//   const handleProjectSubmit = (values: ProjectFormValues) => {
//     if (!savedName) {
//       alert("Please enter your name first.");
//       setStep(1);
//       return;
//     }

//     addProjectMutate(values.projectTitle, {
//       onSuccess: (data) => {
//         // Update UI with new project
//         const newProject: Project = {
//           id: data.id || Date.now().toString(), // use returned id if available
//           name: values.projectTitle,
//           createdAt: new Date().toISOString(),
//         };
//         setProjects((prev) => [...prev, newProject]);
//         projectForm.reset();
//         setStep(3);
//       },
//       onError: (err: Error) => {
//         alert(err.message || "Something went wrong");
//       },
//     });
//   };

//   // ----------------- Step 3: Show Projects -----------------
//   const handleAddFurtherProject = () => {
//     setStep(2);
//   };

//   return (
//     <div className="max-w-2xl mt-10 space-y-6">
//       {step === 1 && (
//         <Form {...nameForm}>
//           <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
//             <FormField
//               control={nameForm.control}
//               name="participantName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xl md:text-2xl font-normal text-[#00253E] leading-normal">
//                     <User className="inline -mt-1 mr-1" /> Enter your name
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       className="h-[48px] border border-[#00253E] rounded-[8px] p-4 placeholder:text-[#666666] text-base font-medium text-[#00253E]"
//                       placeholder="Enter your name"
//                       {...field}
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             <div className="flex items-center justify-end">
//               <button
//                 type="submit"
//                 className="h-[50px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px]"
//               >
//                 Continue
//                 <ChevronsRight className="h-4 w-4" />
//               </button>
//             </div>
//           </form>
//         </Form>
//       )}

//       {step === 2 && (
//         <Form {...projectForm}>
//           <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)} className="space-y-4">
//             <FormField
//               control={projectForm.control}
//               name="projectTitle"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-xl md:text-2xl font-normal text-[#00253E] leading-normal">
//                     <Scroll className="inline -mt-1 mr-1" /> Enter the name of the change project
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       className="h-[48px] border border-[#00253E] rounded-[8px] p-4 placeholder:text-[#666666] text-base font-medium text-[#00253E]"
//                       placeholder="Enter your project name"
//                       {...field}
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             <div className="flex items-center justify-between">
//               <button
//                 type="button"
//                 className="h-[50px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px]"
//                 onClick={() => setStep(1)}
//               >
//                 Back
//                 <ChevronsRight className="h-4 w-4" />
//               </button>
//               <button
//                 type="submit"
//                 disabled={isPending}
//                 className="h-[50px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px]"
//               >
//                 {isPending ? "Adding..." : "Add"}
//                 <ChevronsRight className="h-4 w-4" />
//               </button>
//             </div>
//           </form>
//         </Form>
//       )}

//       {step === 3 && (
//         <div className="space-y-4">
//           <h2 className="text-xl md:text-2xl text-[#00253E] leading-normal font-medium">
//             <Scroll className="inline -mt-1 mr-1" /> Projects
//           </h2>
//           {/* {projects.map((project) => (
//             <div key={project.id} className="p-4 bg-blue-900 text-white rounded">
//               <p className="font-medium">{project.name}</p>
//               <p className="text-sm">Created Date : {new Date(project.createdAt).toLocaleDateString("en-GB")}</p>
//             </div>
//           ))} */}
//           <div>
//              {projectLists?.map((project) => {
//                       return (
//                         <div
//                           key={project?._id}
//                           className="border border-primary bg-[#00253E] rounded-[8px] shadow-[0_0_10px_0_#0000001A] p-4 mb-4"
//                         >
//                           <h4 className="text-xl md:text-2xl text-white font-semibold leading-normal pb-1">
//                             {project.projectTitle || ""}
//                           </h4>
//                           <p className="text-base text-white font-normal leading-normal">
//                             Created Date : {moment(project.createdAt).format("DD-MM-YYYY")}
//                           </p>
//                         </div>
//                       );
//                     })}
//           </div>

//           <button
//             onClick={handleAddFurtherProject}
//             className="h-[56px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px]"
//           >
//             Add (further projects )
//             <Plus className="h-4 w-4" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { ChevronsRight, Scroll, User } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { ProjectListsApiResponse } from '../_components/project-list-data-type'

import { useRouter } from 'next/navigation'

type NameFormValues = {
  participantName: string
}

type ProjectFormValues = {
  projectTitle: string
}

export default function AddNewProjectForm() {
  const session = useSession()
  const token = (session?.data?.user as { accessToken?: string })?.accessToken
  const [step, setStep] = useState(1)
  const [savedName, setSavedName] = useState('')
  const queryClient = useQueryClient()
  const router = useRouter()

  // Load name from localStorage on mount
  useEffect(() => {
    const name = localStorage.getItem('userName') || ''
    setSavedName(name)
  }, [])

  // ----------------- Step 1: Name Form -----------------
  const nameForm = useForm<NameFormValues>({
    defaultValues: { participantName: savedName },
  })

  const handleNameSubmit = (values: NameFormValues) => {
    localStorage.setItem('userName', values.participantName)
    setSavedName(values.participantName)
    setStep(2)
  }

  // ----------------- Step 2: Project Form -----------------
  const projectForm = useForm<ProjectFormValues>({
    defaultValues: { projectTitle: '' },
  })

  // ----------------- Fetch All Projects -----------------
  const { isLoading, isError, error } = useQuery<ProjectListsApiResponse>({
    queryKey: ['insight-engine-list'],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/participant/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (!res.ok) {
        throw new Error('Failed to fetch projects')
      }
      return res.json()
    },
    staleTime: 0,
  })

  console.log('isLoading', isLoading)
  console.log('isError', isError)
  console.log('error', error)

  // const projectLists = data?.data?.items || []

  // ----------------- Add Project Mutation -----------------
  const { mutate: addProjectMutate, isPending } = useMutation({
    mutationKey: ['addProject'],
    mutationFn: async (projectTitle: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            participantName: savedName,
            projectTitle,
          }),
        },
      )

      if (!res.ok) {
        throw new Error('Failed to add project')
      }

      return res.json()
    },
    onSuccess: () => {
      // Refetch projects after adding new
      queryClient.invalidateQueries({ queryKey: ['insight-engine-list'] })
      projectForm.reset()
      router.push('/participants')
      router.refresh()
    },
    onError: (err: Error) => {
      alert(err.message || 'Something went wrong')
    },
  })

  const handleProjectSubmit = (values: ProjectFormValues) => {
    if (!savedName) {
      alert('Please enter your name first.')
      setStep(1)
      return
    }

    addProjectMutate(values.projectTitle)
  }

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
                      <User className="inline -mt-1 mr-1" /> Enter your name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-[48px] border border-[#00253E] rounded-[8px] p-4 placeholder:text-[#666666] text-base font-medium text-[#00253E]"
                        placeholder="Enter your name"
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
                  Continue
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
                      <Scroll className="inline -mt-1 mr-1" /> Enter the name of
                      the change project
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-[48px] border border-[#00253E] rounded-[8px] p-4 placeholder:text-[#666666] text-base font-medium text-[#00253E]"
                        placeholder="Enter your project name"
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
                  Back
                  <ChevronsRight className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-[50px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px] transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                >
                  {isPending ? 'Adding...' : 'Add'}
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </Form>
        )}
      </div>

      {/* third part - Removed as redirected to list page instead */}
    </div>
  )
}
