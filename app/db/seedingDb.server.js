import mongoose from "mongoose";

export default async function seedDb() {
  const entryCount = await mongoose.models.Entry.countDocuments();
  if (entryCount === 0) {
    console.log("Seeding database...");
    insertData();
  }
}

async function insertData() {
  const entries = [
    {
      date: new Date("2024-01-01"),
      type: "work",
      text: "I'm working",
    },
    {
      date: new Date("2024-01-15"),
      type: "learning",
      text: "I'm learning",
    },
    {
      date: new Date("2024-02-01"),
      type: "interesting-thing",
      text: "I'm doing something interesting",
    },
    {
      date: new Date("2024-02-15"),
      type: "learning",
      text: "Remix Auth with FormStrategy and Post App",
    },
    {
      date: new Date("2024-02-22"),
      type: "work",
      text: "Remix Work Journal",
    },
  ];
  await mongoose.models.Entry.insertMany(entries);
}
