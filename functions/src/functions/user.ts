import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db, JWT_SECRET } from "..";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


export const signUp = async (req: Request, res: Response): Promise<any> => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const id = uuidv4();

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection("users").doc(id).set({
            username: name,
            password: hashedPassword,
        });

        return res.status(201).json({ msg: "User created successfully" });
    } catch (error) {
        console.error("SignUp Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req: Request, res: Response): Promise<any> => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // Query user by username
        const userQuery = await db.collection("users").where("username", "==", name).get();

        if (userQuery.empty) {
            return res.status(404).json({ error: "Invalid username or password" });
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // Compare the hashed password
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: userDoc.id }, (JWT_SECRET as string), { expiresIn: "30d" });

        return res.status(200).json({ msg: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
