"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  updateCommunity,
  getCommunityById,
  deleteCommunities,
  changeOrganizationOfCommunity
} from "@/lib/actions/community.js";
import {useParams, useRouter} from 'next/navigation'
import {useEffect, useState, useRef} from "react";
import {Breadcrumb} from "@/components/ui/breadcrumb.jsx";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreVertical, Search, Loader2 } from "lucide-react";
import {useApiToast} from "@/lib/utils.js";
import {searchOrganizations} from "@/lib/actions/organization.js";

const communityFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "Community name must be at least 3 characters.",
    })
    .max(50, {
      message: "Community name must not be longer than 50 characters.",
    }),
  purpose: z
    .string()
    .min(10, {
      message: "Purpose must be at least 10 characters.",
    })
    .max(500, {
      message: "Purpose must not be longer than 500 characters.",
    }),
  visibility: z
    .string({
      required_error: "Please select a visibility option.",
    })
    .refine((val) => ["public", "private"].includes(val), {
      message: "Visibility must be 'public' or 'private'.",
    }),
});

// Default values for the form
const defaultValues = {
  name: "",
  purpose: "",
  visibility: "",
};

export default function EditCommunityPage() {
  const[data, setData] = useState({});
  const[organizations, setOrganizations] = useState([]);
  const[loading, setLoading] = useState(false);
  const[searchLoading, setSearchLoading] = useState(false);
  const[searchTerm, setSearchTerm] = useState("");
  const[showOrgModal, setShowOrgModal] = useState(false);
  const[selectedOrganization, setSelectedOrganization] = useState(null);
  const searchTimerRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const communityId = params.communityId;
  const { showResponseToast, showErrorToast } = useApiToast();

  const form = useForm({
    resolver: zodResolver(communityFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (formData) => {
    const updatedData = {
      ...formData, // Spread existing formData (id, name, purpose, visibility)
      id: communityId,
    };

    const response = await updateCommunity(updatedData)

    if(!response.success) {
      showErrorToast(response.error);
      return console.error(response.error);
    }

    showResponseToast(response);
  }

  const performSearch = async (query) => {
    if (query.length < 2) {
      setOrganizations([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await searchOrganizations(query);

      if (response.success) {
        setOrganizations(response.data);
      } else {
        console.error("Search failed:", response.message);
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error searching organizations:", error);
      setOrganizations([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input changes with setTimeout-based debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear any existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Set a new timer
    searchTimerRef.current = setTimeout(() => {
      if (value && value.length >= 2) {
        performSearch(value);
      } else {
        setOrganizations([]);
      }
    }, 300); // 300ms debounce time
  };

  // Clear the timer when component unmounts
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  // Initialize search when modal opens
  useEffect(() => {
    if (showOrgModal && searchTerm.length >= 2) {
      performSearch(searchTerm);
    }
  }, [showOrgModal]);

  useEffect(() => {
    if (!communityId) return;

    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const response = await getCommunityById(communityId);
        console.log('getCommunityById', response);

        setData(response.community);

        form.reset({
          name: response.community.name || "",
          purpose: response.community.purpose || "",
          visibility: response.community.visibility || "",
        });
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId, form]);

  const onDeleteCommunity = async () => {
    const response = await deleteCommunities(communityId);
    if(response.success) {
      router.push("/developer/communities")
    }
    console.log('deleting', communityId);
  }

  const handleChangeOrganization = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      const response = await changeOrganizationOfCommunity(selectedOrganization.id, communityId);

      if (!response.success) {
        return showErrorToast(response.message);
      }

      showResponseToast(response);

      // Refresh community data
      const updatedCommunity = await getCommunityById(communityId);
      setData(updatedCommunity.community);

      // Close the modal and reset selection
      setShowOrgModal(false);
      setSelectedOrganization(null);
      setSearchTerm("");

    } catch (error) {
      console.error("Error changing organization:", error);
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { href: "/developer", label: "Developer" },
    { href: "/developer/communities", label: `Communities` },
    { label: `${data.name}` },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex items-center justify-between">
        <h2 className='py-2 text-lg sm:text-xl font-bold'>Edit the Community: {data.name || ''}</h2>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowOrgModal(true)}>
              Change Organization
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              if (window.confirm('Are you sure you want to delete this community?')) {
                onDeleteCommunity();
              }
            }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete Community
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <div className="text-sm text-gray-600">Organization:</div>
        {data.organization?.id ? (
          <Link href={`/developer/organizations/${data.organization?.id}`} className="text-blue-500 hover:underline">
            {data.organization?.name}
          </Link>
        ) : (
          <span className="text-gray-500">No organization assigned</span>
        )}
      </div>

      {/* Organization Selection Modal */}
      <Dialog open={showOrgModal} onOpenChange={(open) => {
        setShowOrgModal(open);
        if (!open) {
          setSearchTerm("");
          setOrganizations([]);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Organization</DialogTitle>
            <DialogDescription>
              Select a new organization for this community
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center border rounded-md px-3 py-2 mb-4">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <Input
              className="border-0 p-0 shadow-none focus-visible:ring-0"
              placeholder="Type to search organizations (min 2 characters)..."
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
            />
            {searchLoading && <Loader2 className="h-4 w-4 text-gray-400 ml-2 animate-spin" />}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {organizations.length > 0 ? (
              <div className="space-y-1">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrganization(org)}
                    className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                      selectedOrganization?.id === org.id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium">{org.name}</div>
                      {org.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">{org.description}</div>
                      )}
                    </div>
                    {selectedOrganization?.id === org.id && (
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {searchLoading
                  ? 'Searching for organizations...'
                  : (searchTerm.length >= 2
                    ? 'No organizations found matching your search'
                    : 'Type at least 2 characters to search')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOrgModal(false);
                setSelectedOrganization(null);
                setSearchTerm("");
                setOrganizations([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeOrganization}
              disabled={!selectedOrganization || loading}
            >
              {loading ? "Updating..." : "Change Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Community Name */}
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Community Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Community" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name of your community. It should be unique and
                    descriptive.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            {/* Community Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about the purpose of your community..."
                      className="resize-none"
                      rows="6"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of the purpose of your community.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            {/* Community Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose who can see and join your community:{" "}
                    <span className="block">Public: Anyone can view and join.</span>
                    <span className="block">Private: Only invited members can view and join.</span>
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <Button type="submit">Save Community</Button>
          </form>
        </Form>
      </div>
    </>
  );
}