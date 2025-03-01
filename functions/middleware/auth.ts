import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface AuthRequest extends Request {
    user?: string | JwtPayload; // Attach user data to the request
}

export const isAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
):any => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No Token Provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid or Expired Token" });
    }
};