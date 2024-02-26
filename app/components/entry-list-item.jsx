import { Link, useLoaderData } from "@remix-run/react";

export default function EntryListItem({ entry }) {
  const { session } = useLoaderData();

  return (
    <li className="group leading-7">
      {entry.text}
      {entry.image && (
        <img
          src={entry.image}
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
