"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import {Breadcrumb} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {UserTable} from "@/app/developer/users/user-table";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToast} from "@/hooks/use-toast";
import {z} from "zod";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsers() {
      const userList = await getUsers();
      setUsers(userList.users || []);
    }
    fetchUsers();
  }, []);

  const onCreateSubmit = async (formData) => {
    setIsSaving(true);
    const response = await createUser(formData);
    setServerResponse(response);
    if (response?.success) {
      createForm.reset();
      fetchData();
      toast({ title: "Success", description: "User created successfully" });
    } else {
      toast({ variant: "destructive", title: "Error", description: response?.error || "Unknown error" });
    }
    setModalOpen(false);
    setIsSaving(false);
  };

  const userSchema = z.object({
    name: z.string().min(1, "User name is required"),
  });

  const createForm = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "" },
  });

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { label: `Users` },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems}/>
      <div className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Users</h3>
          <p className="text-sm text-muted-foreground">Globally manage the 12More users.</p>
        </div>
        {/*<Button onClick={() => setModalOpen(true)}>New User</Button>*/}
      </div>
      <div className="mt-3">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="User Name"
                  {...createForm.register("name")}
                />
                {createForm.formState.errors.name && (
                  <p className="text-red-500 text-sm">{createForm.formState.errors.name.message}</p>
                )}
              </div>
              {serverResponse?.error && <p className="text-red-500 text-sm">{serverResponse.error}</p>}
              {serverResponse?.success && <p className="text-green-500 text-sm">{serverResponse.message}</p>}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <UserTable data={users} />
      </div>
    </>
  );
}