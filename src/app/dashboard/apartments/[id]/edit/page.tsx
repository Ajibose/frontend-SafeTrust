"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewApartmentForm } from
  "@/components/dashboard/apartments/NewApartmentForm";

// TODO: replace with Hasura query → public.apartments WHERE id = $id
const STUB_APARTMENT = {
  id: "1",
  name: "La Sabana Sur Studio",
  location: "San José",
  price: 1200,
  status: "inhabited",
  promoted: true,
};

export default function EditApartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const handleSubmit = () => {
    // TODO: wire to Hasura mutation → UPDATE public.apartments WHERE id = $id
    router.push("/dashboard/apartments");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Link
        href="/dashboard/apartments"
        className="flex items-center gap-2 text-sm
                   text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Apartments
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Apartment
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the details for apartment #{id}
        </p>
      </div>

      {/* Reuse NewApartmentForm with pre-filled stub data */}
      {/* TODO: pass real apartment data once Hasura query is wired */}
      <NewApartmentForm
        initialData={STUB_APARTMENT}
        onSubmit={handleSubmit} 
        title="Edit apartment"
        submitLabel="Save changes" 
      />
    </div>
  );
}
