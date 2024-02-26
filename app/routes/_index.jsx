import { Link, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";
import mongoose from "mongoose";
import EntryForm from "~/components/entry-form";
import { getSession } from "~/session";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("cookie"));

  const entries = await mongoose.models.Entry.find().sort({ date: -1 }).lean();

  return {
    session: session.data,
    entries: entries.map((entry) => ({
      ...entry,
      date: entry.date.toISOString().substring(0, 10),
      // Convert the image buffer to a Base64 string if the image exists
      image: entry.image?.data
        ? `data:${entry.image.contentType};base64,${entry.image.data.toString("base64")}`
        : null,
    })),
  };
}

export default function Index() {
  const { session, entries } = useLoaderData();

  const entriesByWeek = entries.reduce((memo, entry) => {
    const sunday = startOfWeek(parseISO(entry.date));
    const sundayString = format(sunday, "yyyy-MM-dd");

    memo[sundayString] ||= [];
    memo[sundayString].push(entry);

    return memo;
  }, {});

  const weeks = Object.keys(entriesByWeek).map((dateString) => ({
    dateString,
    work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
    learnings: entriesByWeek[dateString].filter(
      (entry) => entry.type === "learning",
    ),
    interestingThings: entriesByWeek[dateString].filter(
      (entry) => entry.type === "interesting-thing",
    ),
  }));

  return (
    <div>
      {session.isAdmin && (
        <div className="mb-8 rounded-lg border border-gray-700/30 bg-gray-800/50 p-4 lg:mb-20 lg:p-6">
          <p className="text-sm font-medium text-gray-500 lg:text-base">
            New entry
          </p>

          <EntryForm />
        </div>
      )}

      <div className="mt-12 space-y-12 border-l-2 border-sky-500/[.15] pl-5 lg:space-y-20 lg:pl-8">
        {weeks.map((week) => (
          <div key={week.dateString} className="relative">
            <div className="absolute left-[-34px] rounded-full bg-gray-900 p-2 lg:left-[-46px]">
              <div className="h-[10px] w-[10px] rounded-full border border-sky-500 bg-gray-900" />
            </div>

            <p className="pt-[5px] text-xs font-semibold uppercase tracking-wider text-sky-500 lg:pt-[3px] lg:text-sm">
              Week of {format(parseISO(week.dateString), "MMMM d, yyyy")}
            </p>

            <div className="mt-6 space-y-8 lg:space-y-12">
              <EntryList entries={week.work} label="Work" />
              <EntryList entries={week.learnings} label="Learnings" />
              <EntryList
                entries={week.interestingThings}
                label="Interesting things"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function action({ request }) {
  const session = await getSession(request.headers.get("cookie"));
  if (!session.data.isAdmin) {
    throw new Response("Not authenticated", {
      status: 401,
      statusText: "Not authenticated",
    });
  }

  const formData = await request.formData();
  // Correctly extract fields and files
  const date = formData.get("date");
  const type = formData.get("type"); // Get the type field
  const text = formData.get("text"); // Get the text field
  const imageFile = formData.get("image"); // Get the image file

  // Simulate a delay (if needed)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check for the presence and types of the text fields
  if (
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string" ||
    !imageFile // Directly check for file presence, no need to check type
  ) {
    throw new Error("Bad request");
  }

  // Assuming imageFile is a File object now, we can properly work with it
  if (imageFile instanceof File) {
    // Ensure imageFile is handled as a File
    const imageData = await imageFile.arrayBuffer(); // Convert the image file to ArrayBuffer
    const buffer = Buffer.from(imageData); // Convert ArrayBuffer to Node.js Buffer
    const contentType = imageFile.type; // Get the MIME type of the image

    const entry = new mongoose.models.Entry({
      date: new Date(date),
      type,
      text,
      image: {
        data: buffer,
        contentType,
      },
    });

    await entry.save();
  } else {
    throw new Error("Image file is missing or invalid");
  }

  return null;
}

function EntryList({ entries, label }) {
  return entries.length > 0 ? (
    <div>
      <p className="font-semibold text-white">{label}</p>

      <ul className="mt-4 space-y-6">
        {entries.map((entry) => (
          <EntryListItem key={entry._id} entry={entry} />
        ))}
      </ul>
    </div>
  ) : null;
}

function EntryListItem({ entry }) {
  const { session } = useLoaderData();

  return (
    <li className="group leading-7">
      {entry.text}
      {entry.image && (
        <img src={entry.image} alt={entry.text} className="max-w-xs mt-2" />
      )}

      {session.isAdmin && (
        <Link
          to={`/entries/${entry._id}/edit`}
          className="ml-2 text-sky-500 opacity-0 group-hover:opacity-100"
        >
          Edit
        </Link>
      )}
    </li>
  );
}
