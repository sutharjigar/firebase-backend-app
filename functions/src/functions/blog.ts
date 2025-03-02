import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { db } from "..";


export const createBlog=  async (req: Request, res: Response): Promise<any> => {
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
}

export const getAllBlogs = async (req: Request, res: Response): Promise<any> => {
    const blogs = await db.collection("blogs").get();
    const blogList: any[] = [];
    blogs.forEach((doc) => {
        blogList.push({ id: doc.id, data: doc.data() });
    });
    return res.status(200).json(blogList);
}

export const updateBlog = async (req: Request, res: Response): Promise<any> => {
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
}

export const deleteBlog = async (req: Request, res: Response): Promise<any> => {
  try {
    await db.collection("blogs").doc("/" + req.params.id + "/").delete();
    return res.status(200).json({ msg: "Blog deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
}