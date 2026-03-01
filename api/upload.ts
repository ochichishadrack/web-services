import type { NextApiRequest, NextApiResponse } from "next";
import type { Fields, Files, File } from "formidable";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  const form = formidable({ keepExtensions: true });

  return new Promise((resolve, reject) => {
    form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { files } = await parseForm(req);

    const imageField = files.image;
    let image: File | undefined;

    if (Array.isArray(imageField)) {
      image = imageField[0];
    } else if (imageField !== undefined) {
      image = imageField;
    }

    if (!image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const fileExt = path.extname(image.originalFilename ?? ".jpg");
    const fileName = `${uuidv4()}${fileExt}`;

    // Replace with actual upload logic (e.g., upload to S3, Cloudinary, etc.)
    const uploadedImageUrl = `https://your-storage-bucket.com/${fileName}`;

    // Optionally delete the local temporary file
    await fs.promises.unlink(image.filepath);

    return res.status(200).json({ url: uploadedImageUrl });
  } catch (err) {
    console.error("Image upload failed:", err);
    return res.status(500).json({ error: "Image upload failed" });
  }
}
