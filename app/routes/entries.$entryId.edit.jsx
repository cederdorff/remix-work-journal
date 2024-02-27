import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import EntryForm from "~/components/entry-form";
import { getSession } from "~/session";

export async function loader({ params, request }) {
  if (typeof params.entryId !== "string") {
    throw new Response("Not found", { status: 404, statusText: "Not found" });
  }

  const entry = await mongoose.models.Entry.findById(params.entryId).lean();

  if (!entry) {
    throw new Response("Not found", { status: 404, statusText: "Not found" });
  }

  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  };
}

export default function EditPage() {
  const entry = useLoaderData();

  function handleSubmit(e) {
    if (!confirm("Are you sure?")) {
      e.preventDefault();
    }
  }

  return (
    <div className="mt-4">
      <div className="mb-8 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:mb-20 lg:p-6">
        <p className="text-sm font-medium text-gray-500 lg:text-base">
          Edit entry
        </p>

        <EntryForm entry={entry} />
      </div>

      <div className="mt-8">
        <Form method="post" onSubmit={handleSubmit}>
          <button
            name="_action"
            value="delete"
            className="text-sm text-gray-600 underline"
          >
            Delete this entry...
          </button>
        </Form>
      </div>
    </div>
  );
}

export async function action({ request, params }) {
  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  if (typeof params.entryId !== "string") {
    throw new Response("Not found", { status: 404, statusText: "Not found" });
  }

  const formData = await request.formData();

  const { _action, date, type, text, image } = Object.fromEntries(formData); // Destructure imageFile from formData

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (_action === "delete") {
    await mongoose.models.Entry.findByIdAndDelete(params.entryId);

    return redirect("/");
  } else {
    if (
      typeof date !== "string" ||
      typeof type !== "string" ||
      typeof text !== "string" ||
      !image // Directly check for file presence, no need to check type
    ) {
      throw new Error("Bad request");
    }

    const entry = await mongoose.models.Entry.findById(params.entryId);

    entry.date = new Date(date);
    entry.type = type;
    entry.text = text;

    if (image instanceof File) {
      // Ensure imageFile is handled as a File
      const imageData = await image.arrayBuffer(); // Convert the image file to ArrayBuffer
      const buffer = Buffer.from(imageData); // Convert ArrayBuffer to Node.js Buffer
      const contentType = image.type; // Get the MIME type of the image

      entry.image = {
        data: buffer,
        contentType,
      };
    }

    await entry.save();

    return redirect("/");
  }
}
