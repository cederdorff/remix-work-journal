import { useFetcher, useLoaderData } from "@remix-run/react";
import { format, parseISO, startOfWeek } from "date-fns";
import mongoose from "mongoose";
import { useEffect, useRef } from "react";

export async function loader() {
  const entries = await mongoose.models.Entry.find();
  console.log(entries);
  return entries;
}

export default function Index() {
  let fetcher = useFetcher();
  let textareaRef = useRef();
  let entries = useLoaderData();

  let entriesByWeek = entries.reduce((memo, entry) => {
    let sunday = startOfWeek(parseISO(entry.date));
    let sundayString = format(sunday, "yyyy-MM-dd");

    memo[sundayString] ||= [];
    memo[sundayString].push(entry);

    return memo;
  }, {});

  let weeks = Object.keys(entriesByWeek)
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
    <div className="p-10">
      <h1 className="text-5xl">Work Journal</h1>
      <p className="mt-2 text-lg text-gray-400">
        Learnings and doings. Updated weekly.
      </p>

      <div className="my-8 border p-3">
        <p className="italic">Create a new entry</p>

        <fetcher.Form method="post" className="mt-2">
          <fieldset
            className="disabled:opacity-70"
            disabled={fetcher.state === "submitting"}
          >
            <div>
              <div>
                <input
                  type="date"
                  name="date"
                  required
                  className="text-gray-900"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="mt-4 space-x-4">
                <label className="inline-block">
                  <input
                    required
                    type="radio"
                    defaultChecked
                    className="mr-1"
                    name="type"
                    value="work"
                  />
                  Work
                </label>
                <label className="inline-block">
                  <input
                    type="radio"
                    className="mr-1"
                    name="type"
                    value="learning"
                  />
                  Learning
                </label>
                <label className="inline-block">
                  <input
                    type="radio"
                    className="mr-1"
                    name="type"
                    value="interesting-thing"
                  />
                  Interesting thing
                </label>
              </div>
            </div>
            <div className="mt-4">
              <textarea
                ref={textareaRef}
                placeholder="Type your entry..."
                name="text"
                className="w-full text-gray-700"
                required
              />
            </div>
            <div className="mt-2 text-right">
              <button
                type="submit"
                className="bg-blue-500 px-4 py-1 font-semibold text-white"
              >
                {fetcher.state === "submitting" ? "Saving..." : "Save"}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              Week of {format(parseISO(week.dateString), "MMMM do")}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <li key={entry._id}>{entry.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learning</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <li key={entry._id}>{entry.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <li key={entry._id}>{entry.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function action({ request }) {
  let formData = await request.formData();
  let { date, type, text } = Object.fromEntries(formData);

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
    type: type,
    text: text,
  });
}
