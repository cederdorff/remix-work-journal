import { Link, useLoaderData } from "@remix-run/react";

export default function EntryListItem({ entry }) {
  const { session } = useLoaderData();

  // Convert the image buffer to a Base64 string if the image exists
  const imageString = entry.image?.data
    ? `data:${entry.image.contentType};base64,${entry.image.data.toString("base64")}`
    : null;

  return (
    <li className="group leading-7">
      {entry.text}
      {entry.image && (
        <img
          src={imageString}
          alt={entry.text}
          className="max-w-xs mt-2 rounded-lg"
        />
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
