import { useFetcher, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";
import mongoose from "mongoose";
import { useEffect, useRef } from "react";

export async function loader() {
  const entries = await mongoose.models.Entry.find();
  return entries;
}

export default function Index() {
  const fetcher = useFetcher();
  const textareaRef = useRef();
  const entries = useLoaderData();

  const entriesByWeek = entries.reduce((memo, entry) => {
    const sunday = startOfWeek(parseISO(entry.date));
    const sundayString = format(sunday, "yyyy-MM-dd");

    memo[sundayString] ||= [];
    memo[sundayString].push(entry);

    return memo;
  }, {});

  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "learning",
      ),
      interestingThings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "interesting-thing",
      ),
    }));

  useEffect(() => {
    if (fetcher.state === "idle" && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [fetcher.state]);

  return (
    <div className="p-10 dark:text-gray-200">
      <h1 className="text-5xl">Work Journal</h1>
      <p className="mt-2 text-lg text-gray-400 dark:text-gray-500">
        Learnings and doings. Updated weekly.
      </p>

      <div className="my-8 border p-3 dark:border-gray-700">
        <p className="italic">Create a new entry</p>

        <fetcher.Form method="post" className="mt-2">
          <fieldset
            className="disabled:opacity-70"
            disabled={fetcher.state === "submitting"}
          >
            <div className="mb-4">
              <input
                type="date"
                name="date"
                required
                className="text-gray-900 dark:bg-gray-700 dark:text-gray-300"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            <div className="mb-4 flex space-x-4">
              {["work", "learning", "interesting-thing"].map((type, index) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    required
                    type="radio"
                    className="text-blue-600 dark:bg-gray-800 dark:checked:bg-blue-600"
                    name="type"
                    value={type}
                    defaultChecked={index === 0}
                  />
                  <span>
                    {type
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              placeholder="Type your entry..."
              name="text"
              className="w-full text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              required
            />
            <div className="mt-4 text-right">
              <button
                type="submit"
                className="bg-blue-500 px-4 py-2 font-semibold text-white dark:bg-blue-600"
              >
                {fetcher.state === "submitting" ? "Saving..." : "Save"}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

      <div className="space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString} className="mt-12">
            <p className="font-bold text-lg">
              Week of {format(parseISO(week.dateString), "MMMM do")}
            </p>
            <div className="space-y-4 mt-4">
              {["work", "learnings", "interestingThings"].map(
                (category) =>
                  week[category].length > 0 && (
                    <div key={category}>
                      <p className="text-xl capitalize">
                        {category.replace(/s$/, "").replace(/-/g, " ")}
                      </p>
                      <ul className="ml-8 list-disc dark:text-gray-400">
                        {week[category].map((entry) => (
                          <li key={entry._id}>{entry.text}</li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const { date, type, text } = Object.fromEntries(formData);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (
    typeof date !== "string" ||
    typeof type !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Bad request");
  }

  return await mongoose.models.Entry.create({
    date: new Date(date),
    type,
    text,
  });
}
