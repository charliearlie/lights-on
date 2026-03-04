import { useEffect, useState } from "react";
import { redirect, useFetcher, useSearchParams } from "react-router";
import type { Route } from "./+types/studio.order";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { studioPackages } from "../data/studio-packages";
import { getPackageWithPriceId } from "../data/studio-packages.server";
import {
  createCustomer,
  createCheckoutSession,
} from "../services/stripe.server";
import { getSupabaseAdmin } from "../services/supabase.server";
import { getSupabase } from "../services/supabase.client";
import { StepIndicator } from "../components/studio/wizard/StepIndicator";
import { StepPackage } from "../components/studio/wizard/StepPackage";
import { StepDetails } from "../components/studio/wizard/StepDetails";
import { StepUpload } from "../components/studio/wizard/StepUpload";
import { StepReview } from "../components/studio/wizard/StepReview";
import { StepSuccess } from "../components/studio/wizard/StepSuccess";

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const packageId = formData.get("packageId") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const brief = formData.get("brief") as string;
  const sendLater = formData.get("sendLater") === "true";
  const uploadedPaths = JSON.parse(
    (formData.get("uploadedPaths") as string) || "[]",
  );

  // Validate
  if (!packageId || !email || !name) {
    return { error: "Missing required fields" };
  }

  const pkg = getPackageWithPriceId(packageId);
  const supabase = getSupabaseAdmin();

  // Create service_order
  const { data: order, error: orderError } = await supabase
    .from("service_orders")
    .insert({
      package: packageId,
      status: "pending",
      amount_paid: pkg.price,
      brief: {
        email,
        name,
        description: brief,
        images: uploadedPaths,
        sendLater,
      },
    })
    .select()
    .single();

  if (orderError || !order) {
    return { error: "Failed to create order. Please try again." };
  }

  // Create Stripe customer + checkout session
  const customer = await createCustomer({ email, name });
  const origin = new URL(request.url).origin;
  const session = await createCheckoutSession({
    customerId: customer.id,
    priceId: pkg.resolvedPriceId,
    mode: "payment",
    successUrl: `${origin}/studio/order?success=true&order=${order.id}&email=${encodeURIComponent(email)}`,
    cancelUrl: `${origin}/studio/order?cancelled=true`,
    metadata: { order_id: order.id },
  });

  if (!session.url) {
    return { error: "Stripe checkout session did not return a redirect URL." };
  }
  return redirect(session.url);
}

// ---------------------------------------------------------------------------
// Client component
// ---------------------------------------------------------------------------

export default function StudioOrderPage() {
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const isCancelled = searchParams.get("cancelled") === "true";
  const initialPackage = searchParams.get("package");
  const orderIdParam = searchParams.get("order");

  const [step, setStep] = useState(1);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [state, setState] = useState({
    packageId: initialPackage || (null as string | null),
    email: "",
    name: "",
    brief: "",
    files: [] as File[],
    uploadedPaths: [] as string[],
    sendLater: false,
  });

  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";

  // If package pre-selected via query param, start on step 2
  useEffect(() => {
    if (
      initialPackage &&
      studioPackages.some(
        (p) => p.id === initialPackage && p.id !== "enterprise",
      )
    ) {
      setStep(2);
    }
  }, []);

  // If cancelled, jump to review step
  useEffect(() => {
    if (isCancelled) {
      setStep(4);
    }
  }, [isCancelled]);

  const updateField = (field: string, value: string | File[] | string[] | boolean) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!state.packageId) return;

    let uploadedPaths: string[] = [];

    // Upload files to Supabase Storage if any
    if (state.files.length > 0 && !state.sendLater) {
      const supabase = getSupabase();
      const failedUploads: string[] = [];
      for (const file of state.files) {
        const filePath = `orders/${crypto.randomUUID()}/${file.name}`;
        const { error } = await supabase.storage
          .from("order-uploads")
          .upload(filePath, file);
        if (error) {
          failedUploads.push(file.name);
        } else {
          uploadedPaths.push(filePath);
        }
      }
      if (failedUploads.length > 0 && uploadedPaths.length === 0) {
        setUploadError(`Failed to upload: ${failedUploads.join(", ")}. Please try again.`);
        return;
      }
    }

    // Submit to server action via fetcher
    const formData = new FormData();
    formData.set("packageId", state.packageId);
    formData.set("email", state.email);
    formData.set("name", state.name);
    formData.set("brief", state.brief);
    formData.set("sendLater", String(state.sendLater));
    formData.set("uploadedPaths", JSON.stringify(uploadedPaths));

    fetcher.submit(formData, { method: "post" });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <StepSuccess orderId={orderIdParam} email={searchParams.get("email") || state.email} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light transition-colors duration-300 dark:bg-surface-dark">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Step indicator */}
        <div className="mb-12">
          <StepIndicator currentStep={step} />
        </div>

        {/* Cancelled banner */}
        {isCancelled && step === 4 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            Payment was cancelled. Please try again.
          </div>
        )}

        {/* Upload error banner */}
        {uploadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {uploadError}
          </div>
        )}

        {/* Action error banner */}
        {fetcher.data && "error" in fetcher.data && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {fetcher.data.error}
          </div>
        )}

        {/* Wizard steps */}
        {step === 1 && (
          <StepPackage
            selectedId={state.packageId}
            onSelect={(id) => updateField("packageId", id)}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepDetails
            email={state.email}
            name={state.name}
            brief={state.brief}
            onChange={(field, value) => updateField(field, value)}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepUpload
            files={state.files}
            sendLater={state.sendLater}
            onFilesChange={(files) => updateField("files", files)}
            onSendLaterChange={(sendLater) =>
              updateField("sendLater", sendLater)
            }
            onBack={() => setStep(2)}
            onContinue={() => setStep(4)}
          />
        )}

        {step === 4 && state.packageId && (
          <StepReview
            packageId={state.packageId}
            email={state.email}
            name={state.name}
            brief={state.brief}
            files={state.files}
            sendLater={state.sendLater}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
