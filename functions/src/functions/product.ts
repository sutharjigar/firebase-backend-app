import {Request,Response} from "express";
import { v4 as uuidv4 } from 'uuid';
import { db } from "..";

export const createProduct = async (req: Request, res: Response): Promise<any> => {
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
}

export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
  const products = await db.collection("products").get();
  const productList: any[] = [];
  products.forEach((doc) => {
    productList.push({ id: doc.id, data: doc.data() });
  });
  return res.status(200).json(productList);
}

export const updateProduct = async (req: Request, res: Response): Promise<any> => {
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
}

export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
    try {
        await db.collection("products").doc("/" + req.params.id + "/").delete();
        return res.status(200).json({ msg: "Product deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
}