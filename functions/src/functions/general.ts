import { Request, Response } from "express";
import { bucket, db } from "..";


export const uploadImage = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.files) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
    const file = bucket.file(`uploads/${Date.now()}_${imageFile.name}`);
    const stream = file.createWriteStream({
      metadata: {
        contentType: imageFile.mimetype.toString(),
      },
    });

    stream.on("error", (err) => {
      console.error("Upload Error:", err);
      return res.status(500).json({ error: "Upload failed", details: err.message });
    });

    stream.on("finish", async () => {
      await file.makePublic();
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      res.status(200).json({ message: "Upload successful", url: fileUrl });
    });

    stream.end(imageFile.data);
  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteImage =async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Image ID is required" });
  }

  try {
    const imageDoc = await db.collection("images").doc(id).get();
    if (!imageDoc.exists) {
      return res.status(404).json({ error: "Image not found" });
    }

    const imageUrl = imageDoc.data()?.imageUrl;
    const fileName = imageUrl.split('/').pop();
    const file = bucket.file(fileName);

    await file.delete();
    await db.collection("images").doc(id).delete();

    return res.status(200).json({ msg: "Image deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
}