"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import moment from "moment";
import { toast } from "sonner";
import { ProjectListsApiResponse } from "./project-list-data-type";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ClaudePagination from "@/components/ui/claude-pagination";

const ProjectList = () => {
  const session = useSession();
  const token = (session?.data?.user as { accessToken?: string })?.accessToken;

  console.log("token", token);

  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery<ProjectListsApiResponse>(
    {
      queryKey: ["insight-engine-list", page],
      queryFn: async () => {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/participant/projects?page=${page}&limit=${limit}`,
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
    },
  );

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/insight-engine/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete project");
      }

      toast.success("Project deleted successfully");
      setDeleteId(null);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  const projectLists = data?.data?.items || [];
  const paginationInfo = data?.data?.paginationInfo;

  return (
    <div>
      {/* header part  */}
      <div className="w-full flex items-center justify-between pb-6">
        <h4 className="text-2xl font-semibold leading-normal text-[#00253E]">
          Project List
        </h4>
        <Link href="/participants/add-new-project">
          <button className="h-[56px] flex items-center gap-2 bg-primary font-medium leading-normal text-[#00253E] px-8 py-4 rounded-[8px] transition-all duration-200 active:scale-95 hover:scale-[1.02]">

            <Plus className="h-4 w-4" />
            Add New Project
          </button>
        </Link>
      </div>

      {/* project list part */}

      <div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[90px] w-full rounded-[8px] bg-[#00253E]/30" />
            ))}
          </div>
        ) : projectLists.length === 0 ? (
          <div className="w-full h-fit flex items-center justify-center pt-20">
            <div className="w-full text-center py-10 bg-gray-50 border rounded-lg text-gray-500">
            No projects found.
          </div>
          </div>
        ) : (
          projectLists?.map((project) => {
            return (
              <div key={project?._id} className="relative group">
                <Link
                  href={`/participants/${project?._id}`}
                  className="block"
                >
                  <div className="border border-primary bg-[#00253E] rounded-[8px] shadow-[0_0_10px_0_#0000001A] p-4 mb-4 cursor-pointer hover:bg-[#003456] transition-all duration-200 pr-16">
                    <h4 className="notranslate text-xl md:text-2xl text-white font-semibold leading-normal pb-1 truncate">
                      {project.projectTitle || "Untitled Project"}
                    </h4>
                    <p className="text-base text-gray-300 font-normal leading-normal">
                      Created Date : {moment(project.createdAt).format("DD-MM-YYYY")}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteId(project._id);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-[6px] opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {
        paginationInfo && paginationInfo.totalPages > 1 && (
          <div className="mt-12 mb-10 flex flex-row items-center justify-between border-t border-gray-100 pt-10 pb-6 px-4">
            <div className="text-[20px] font-semibold text-[#00253E]">
              Showing {(Number(paginationInfo.currentPage) - 1) * limit + 1} to {Math.min(Number(paginationInfo.currentPage) * limit, Number(paginationInfo.totalData))} of {Number(paginationInfo.totalData)} results
            </div>
            <div className="flex-shrink-0">
              <ClaudePagination
                currentPage={Number(paginationInfo.currentPage)}
                totalPages={Number(paginationInfo.totalPages)}
                onPageChange={setPage}
              />
            </div>
          </div>
        )
      }

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#00253E]">Delete Project</DialogTitle>
            <DialogDescription className="text-gray-500">
              Are you sure you want to delete this project? This action cannot be undone and will permanently delete all insight engine data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="text-[#00253E]" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (deleteId) handleDelete(deleteId);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectList;
