export async function uploadImage(imageFile) {
  const imageData = await imageFile.arrayBuffer(); // Convert the image file to ArrayBuffer
  const buffer = Buffer.from(imageData); // Convert ArrayBuffer to Node.js Buffer

  const url = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_PROJECT_ID}.appspot.com/o/${imageFile.name}`; // URL to upload image to Firebase Storage

  // POST request to upload image
  const response = await fetch(url, {
    method: "POST",
    body: buffer,
    headers: { "Content-Type": imageFile.type },
  });
  const data = await response.json();

  if (!data) {
    throw new Error("Image upload failed");
  }

  const imageUrl = `${url}?alt=media`;

  return imageUrl;
}
