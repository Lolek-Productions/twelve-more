"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { OrganizationTable } from "./organization-table";
import { createOrganization, deleteOrganization, getOrganizations } from "@/lib/actions/organization";
import {Breadcrumb} from "@/components/ui/breadcrumb";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

export default function AdminOrganizationsPage() {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const organizations = await getOrganizations();
      setData(organizations); // Add owner enrichment if needed
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch organizations" });
    }
  }

  const deleteEntity = async (id) => {
    try {
      await deleteOrganization(id);
      toast({ title: "Organization Deleted", description: "The organization has been deleted successfully." });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete organization" });
    }
  };

  const createForm = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: "" },
  });

  const onCreateSubmit = async (formData) => {
    setIsSaving(true);
    const response = await createOrganization(formData);
    setServerResponse(response);
    if (response?.success) {
      createForm.reset();
      fetchData();
      toast({ title: "Success", description: "Organization created successfully" });
    } else {
      toast({ variant: "destructive", title: "Error", description: response?.error || "Unknown error" });
    }
    setModalOpen(false);
    setIsSaving(false);
  };

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { label: `Organizations` }, // Last item, no href
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Organizations</h3>
          <p className="text-sm text-muted-foreground">Globally manage the TwelveMore organizations.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New Organization</Button>
      </div>
      <div className="mt-3">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Organization</DialogTitle>
              <DialogDescription>This organization will be managed by the specified owner.</DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Organization Name"
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
        <OrganizationTable data={data} deleteEntity={deleteEntity} />
      </div>
    </div>
  );
}