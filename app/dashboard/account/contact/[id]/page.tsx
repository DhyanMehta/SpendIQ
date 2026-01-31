"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Mail, Upload, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  type: "CUSTOMER" | "VENDOR";
  isPortalUser: boolean;
  imageUrl: string;
  tags: string[];
}

export default function ContactFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const contactId = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    type: "CUSTOMER",
    isPortalUser: false,
    imageUrl: "",
    tags: [],
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});

  useEffect(() => {
    if (isEdit) {
      fetchContact();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const contact = await apiRequest(`/contacts/${contactId}`);
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        street: contact.street || "",
        city: contact.city || "",
        state: contact.state || "",
        country: contact.country || "",
        pincode: contact.pincode || "",
        type: contact.type || "CUSTOMER",
        isPortalUser: contact.isPortalUser || false,
        imageUrl: contact.imageUrl || "",
        tags: contact.tags?.map((t: any) => t.tag?.name || t.name) || [],
      });
      if (contact.imageUrl) {
        setImagePreview(contact.imageUrl);
      }
    } catch (error) {
      console.error("Failed to load contact:", error);
      alert("Failed to load contact");
      router.push("/dashboard/account/contact");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Contact name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }

    try {
      setSaving(true);

      // Remove empty optional fields to avoid validation errors
      const payload: any = {
        name: formData.name,
        email: formData.email,
        type: formData.type,
      };

      // Only add optional fields if they have values
      if (formData.phone) payload.phone = formData.phone;
      if (formData.street) payload.street = formData.street;
      if (formData.city) payload.city = formData.city;
      if (formData.state) payload.state = formData.state;
      if (formData.country) payload.country = formData.country;
      if (formData.pincode) payload.pincode = formData.pincode;
      if (formData.imageUrl) payload.imageUrl = formData.imageUrl;
      if (formData.tags.length > 0) payload.tags = formData.tags;

      console.log("[ContactForm] Submitting payload:", payload);

      if (isEdit) {
        const result = await apiRequest(`/contacts/${contactId}`, {
          method: "PATCH",
          body: payload,
        });
        console.log("[ContactForm] Update response:", result);
        alert("Contact updated successfully");
      } else {
        const result = await apiRequest("/contacts", {
          method: "POST",
          body: payload,
        });
        console.log("[ContactForm] Create response:", result);
        alert("Contact created successfully");
      }

      router.push("/dashboard/account/contact");
    } catch (error: any) {
      console.error("[ContactForm] Failed to save contact:", error);
      console.error("[ContactForm] Error details:", {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
      });
      alert(`Failed to save contact: ${error?.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSendPortalInvite = async () => {
    if (!confirm(`Send portal invitation to ${formData.email}?`)) return;

    try {
      await apiRequest(`/contacts/${contactId}/portal-access`, {
        method: "POST",
      });
      alert("Portal invitation sent successfully");
      fetchContact(); // Refresh to show updated portal status
    } catch (error) {
      console.error("Failed to send portal invitation:", error);
      alert("Failed to send portal invitation");
    }
  };

  const handleChange = (
    field: keyof ContactFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/account/contact")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Contact" : "New Contact"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit ? "Update contact information" : "Create a new contact"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {isEdit && !formData.isPortalUser && (
            <Button variant="outline" onClick={handleSendPortalInvite}>
              <Mail className="mr-2 h-4 w-4" />
              Send Portal Invite
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Contact Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter contact name"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="contact@example.com"
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Contact Type <span className="text-destructive">*</span>
                </Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    handleChange(
                      "type",
                      e.target.value as "CUSTOMER" | "VENDOR",
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Contact preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tag (e.g., B2B, Retail, Premium)"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or click Add to create a tag. Tags help categorize contacts.
            </p>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                placeholder="123 Main St, Apt 4B"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="New York"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="NY"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="United States"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Postal Code</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portal Access */}
        {isEdit && formData.isPortalUser && (
          <Card>
            <CardHeader>
              <CardTitle>Portal Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ✓ Portal access is enabled for this contact
              </p>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
