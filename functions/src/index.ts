

import * as functions from "firebase-functions";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import admin from "firebase-admin";
import multer from "multer";
import { isAuth } from "../middleware/auth";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "./functions/product";
import { createBlog, deleteBlog, getAllBlogs, updateBlog } from "./functions/blog";
import { createContact, getAllContacts } from "./functions/contact";
import { deleteImage, uploadImage } from "./functions/general";
import { login, signUp } from "./functions/user";
import * as path from "path";


const app = express();
dotenv.config({ path: path.resolve(__dirname, "../../src/.env") });

export const JWT_SECRET = process.env.JWT_SECRET;

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
admin.initializeApp(firebaseConfig);
export const db = admin.firestore();

export const bucket = admin.storage().bucket(
  firebaseConfig.storageBucket
);

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Routes 

// Users routes
app.post("/signup", signUp);
app.post("/login", login);

// Product routes
app.get("/products", getAllProducts);
app.post("/create-product", isAuth, createProduct);
app.put("/update-product/:id", isAuth, updateProduct);
app.delete("/delete-product/:id", isAuth,deleteProduct);

// Blog routes
app.get("/blogs", getAllBlogs);
app.post("/create-blog", isAuth,createBlog);
app.put("/update-blog/:id", isAuth, updateBlog);
app.delete("/delete-blog/:id", isAuth, deleteBlog);

// Contact routes
app.get("/contacts",getAllContacts);
app.post("/create-contact",createContact);

// General routes
app.post("/upload-image",isAuth, upload.single("image"), uploadImage);
app.delete("/delete-image/:id", isAuth, deleteImage);

// export the api to Firebase Cloud Functions 
exports.app = functions.https.onRequest(app);
