

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
// import admin from "firebase-admin";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import { isAuth } from "../middleware/auth";
import serviceAccount from "../permissions.json";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: "fir-clone-1f8e4.firebasestorage.app",

  databaseURL: "https://fir-clone-1f8e4-default-rtdb.firebaseio.com"
});
const app = express();
const db = admin.firestore();
const bucket = admin.storage().bucket(
  "fir-clone-1f8e4.firebasestorage.app"
);

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Routes 

app.get("/users", async (req: Request, res: Response): Promise<any> => {
  return res.status(200).json({ msg: "Hello from Firebase Cloud Functions 2" });
})
app.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const id = uuidv4()
  try {
    await db.collection("users").doc("/" + id + "/").create({ username: req.body.name, password: req.body.password });
    return res.status(201).json({ msg: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});
app.post("/login", async (req: Request, res: Response): Promise<any> => {
  const user = await db.collection("users").where("username", "==", req.body.name).where("password", "==", req.body.password).get();
  if (user.empty) {
    return res.status(404).json({ error: "User not found" });
  }
  const token = jwt.sign({
    id: user
      .docs[0].id
  }, JWT_SECRET as string, { expiresIn: "1h" });
  return res.status(200).json({ msg: "User found", token });
});

app.post("/create-product", isAuth, async (req: Request, res: Response): Promise<any> => {
  const { title, price, description, imageUrl, catelogUrl } = req.body;
  if (!title || !price || !description || !imageUrl || !catelogUrl) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const id = uuidv4()
  try {
    await db.collection("products").doc("/" + id + "/").create({ title, price, description, imageUrl, catelogUrl });
    return res.status(201).json({ msg: "Product created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.get("/products", async (req: Request, res: Response): Promise<any> => {
  const products = await db.collection("products").get();
  const productList: any[] = [];
  products.forEach((doc) => {
    productList.push({ id: doc.id, data: doc.data() });
  });
  return res.status(200).json(productList);
});

app.put("/update-product/:id", isAuth, async (req: Request, res: Response): Promise<any> => {
  const { title, price, description, imageUrl, catelogUrl } = req.body;
  if (!title || !price || !description || !imageUrl || !catelogUrl) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    await db.collection("products").doc("/" + req.params.id + "/").update({ title, price, description, imageUrl, catelogUrl });
    return res.status(200).json({ msg: "Product updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.delete("/delete-product/:id", isAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    await db.collection("products").doc("/" + req.params.id + "/").delete();
    return res.status(200).json({ msg: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.post("/create-blog", isAuth, async (req: Request, res: Response): Promise<any> => {
  const { title, content, thumbUrl, description } = req.body;
  if (!title || !content || !thumbUrl || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const id = uuidv4()
  try {
    await db.collection("blogs").doc("/" + id + "/").create({ title, content, thumbUrl, description });
    return res.status(201).json({ msg: "Blog created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.get("/blogs", async (req: Request, res: Response): Promise<any> => {
  const blogs = await db.collection("blogs").get();
  const blogList: any[] = [];
  blogs.forEach((doc) => {
    blogList.push({ id: doc.id, data: doc.data() });
  });
  return res.status(200).json(blogList);
});

app.put("/update-blog/:id", isAuth, async (req: Request, res: Response): Promise<any> => {
  const { title, content, thumbUrl, description } = req.body;
  if (!title || !content || !thumbUrl || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    await db.collection("blogs").doc("/" + req.params.id + "/").update({ title, content, thumbUrl, description });
    return res.status(200).json({ msg: "Blog updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.delete("/delete-blog/:id", isAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    await db.collection("blogs").doc("/" + req.params.id + "/").delete();
    return res.status(200).json({ msg: "Blog deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.post("/create-contact", isAuth, async (req: Request, res: Response): Promise<any> => {
  const { firstName, lastName, email, number } = req.body;
  if (!firstName || !lastName || !email || !number) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const id = uuidv4()
  try {
    await db.collection("contacts").doc("/" + id + "/").create({ firstName, lastName, email, number });
    return res.status(201).json({ msg: "Contact created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
});

app.get("/contacts", isAuth, async (req: Request, res: Response): Promise<any> => {
  const contacts = await db.collection("contacts").get();
  const contactList: any[] = [];
  contacts.forEach((doc) => {
    contactList.push({ id: doc.id, data: doc.data() });
  });
  return res.status(200).json(contactList);
});

app.post("/upload-image", upload.single("image"), async (req: Request, res: Response):Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = bucket.file(`uploads/${Date.now()}_${req.file.originalname}`);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
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

    stream.end(req.file.buffer);
  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/delete-image/:id", isAuth, async (req: Request, res: Response): Promise<any> => {
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
});

// export the api to Firebase Cloud Functions 
exports.app = functions.https.onRequest(app);
