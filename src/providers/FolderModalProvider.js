"use client";

import React, { createContext, useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUserClient } from "@/providers/UserProvider";
import { useFolders } from "@/hooks/use-folders";

const FolderModalContext = createContext(null);

export function FolderModalProvider({ children }) {
  const userClient = useUserClient();
  const { createFolder, updateFolder, deleteFolder } = useFolders();

  const [showDialog, setShowDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  const schema = z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().optional(),
    parent_id: z.string().nullable().optional(),
    color: z
      .string()
      .regex(/^#?[0-9A-Fa-f]{6}$/)
      .transform((c) => (c.startsWith("#") ? c : `#${c}`)),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366F1",
      parent_id: null,
    },
  });
  const watchedColor = form.watch("color");

  const openNewFolder = () => {
    setEditingFolder(null);
    form.reset({
      name: "",
      description: "",
      color: "#6366F1",
      parent_id: null,
    });
    setShowDialog(true);
  };

  const openNewFolderWithParent = (parentId) => {
    setEditingFolder(null);
    form.reset({
      name: "",
      description: "",
      color: "#6366F1",
      parent_id: parentId || null,
    });
    setShowDialog(true);
  };

  const openEditFolder = (folder) => {
    setEditingFolder(folder);
    form.reset({
      name: folder.name,
      description: folder.description || "",
      color: folder.color || "#6366F1",
      parent_id: folder.parent_id || null,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (values) => {
    if (editingFolder) {
      await updateFolder(editingFolder.id, values);
    } else {
      // ensure parent_id is either null or a string id
      const payload = { ...values, user: userClient.user?.id };
      if (!payload.parent_id) payload.parent_id = null;
      await createFolder(payload);
    }
    setShowDialog(false);
    setEditingFolder(null);
    form.reset();
    userClient.refresh();
  };

  const handleDelete = async (id) => {
    await deleteFolder(id);
    userClient.refresh();
  };

  return (
    <FolderModalContext.Provider
      value={{
        openNewFolder,
        openNewFolderWithParent,
        openEditFolder,
        showDialog,
        setShowDialog,
        editingFolder,
        form,
        handleDelete,
      }}
    >
      {children}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {editingFolder ? "Edit Folder" : "Create New Folder"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Business Travel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What is this folder for?"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Folder</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? String(field.value) : "__none"}
                        onValueChange={(v) =>
                          field.onChange(v === "__none" ? null : v)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="No parent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">No parent</SelectItem>
                          {userClient.folders
                            .filter(
                              (f) => !editingFolder || f.id !== editingFolder.id
                            )
                            .map((f) => (
                              <SelectItem key={f.id} value={String(f.id)}>
                                {f.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Folder Color</FormLabel>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[
                    "#6366F1",
                    "#8B5CF6",
                    "#EC4899",
                    "#EF4444",
                    "#F97316",
                    "#10B981",
                    "#3B82F6",
                    "#14B8A6",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => form.setValue("color", c)}
                      className={`w-full h-12 rounded-lg transition-all duration-200 ${
                        watchedColor === c
                          ? "ring-4 ring-offset-2 ring-indigo-500 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-pressed={watchedColor === c}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {editingFolder ? "Update Folder" : "Create Folder"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </FolderModalContext.Provider>
  );
}

export function useFolderModal() {
  const ctx = useContext(FolderModalContext);
  if (!ctx)
    throw new Error("useFolderModal must be used within FolderModalProvider");
  return ctx;
}

export default FolderModalProvider;
