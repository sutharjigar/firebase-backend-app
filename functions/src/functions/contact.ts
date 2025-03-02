import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { db } from "..";



export const createContact =  async (req: Request, res: Response): Promise<any> => {
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
}

export const getAllContacts =  async (req: Request, res: Response): Promise<any> => {
  const contacts = await db.collection("contacts").get();
  const contactList: any[] = [];
  contacts.forEach((doc) => {
    contactList.push({ id: doc.id, data: doc.data() });
  });
  return res.status(200).json(contactList);
}