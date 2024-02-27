import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";

export default function EntryForm({ entry }) {
  const fetcher = useFetcher();
  const textareaRef = useRef(null);
  const isIdle = fetcher.state === "idle";
  const isInit = isIdle && fetcher.data == null;

  const [image, setImage] = useState(entry?.image ? entry?.image : null);

  useEffect(() => {
    if (!isInit && isIdle && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isInit, isIdle]);

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file.size < 500000) {
      // image file size must be below 0,5MB
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Image size must be less than 0.5MB.");
      event.target.value = "";
    }
  }

  return (
    <fetcher.Form method="post" className="mt-4" encType="multipart/form-data">
      <fieldset
        className="disabled:opacity-70"
        disabled={fetcher.state !== "idle"}
      >
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:order-2">
            <input
              type="date"
              name="date"
              required
              style={{ colorScheme: "dark" }}
              className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600 hover:cursor-pointer"
              defaultValue={entry?.date ?? format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          <div className="mt-6 flex space-x-4 text-sm lg:mt-0 lg:space-x-6 lg:text-base">
            {[
              { label: "Work", value: "work" },
              { label: "Learning", value: "learning" },
              { label: "Interesting thing", value: "interesting-thing" },
            ].map((option) => (
              <label
                key={option.value}
                className="inline-block text-white hover:cursor-pointer"
              >
                <input
                  required
                  type="radio"
                  className="mr-2 border-gray-700 bg-gray-800 text-sky-600  focus:ring-sky-600 focus:ring-offset-gray-900 hover:cursor-pointer"
                  name="type"
                  value={option.value}
                  defaultChecked={option.value === (entry?.type ?? "work")}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <label className="block mb-2 text-white" htmlFor="file_input">
            Image
          </label>
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            name="image"
            type="file"
            required
            onChange={handleImageChange}
          />
          {image && <img src={image} alt="" className="mt-2 rounded-lg" />}
        </div>

        <div className="mt-6">
          <textarea
            ref={textareaRef}
            placeholder="Type your entry..."
            name="text"
            className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
            required
            rows={3}
            defaultValue={entry?.text}
          />
        </div>

        <div className="mt-6 text-right">
          <button
            type="submit"
            className="w-full rounded-md cursor-pointer bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900 lg:w-auto lg:py-2.5 lg:px-6"
          >
            {fetcher.state !== "idle" ? "Saving..." : "Save"}
          </button>
        </div>
      </fieldset>
    </fetcher.Form>
  );
}
