import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../src";


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
        const decoded = jwt.verify(token, (JWT_SECRET as string)) as JwtPayload;
        if(decoded){

            next();
        }else{
            return res.status(401).json({error:"Unauthorized"})
        }
    } catch (error) {
        return res.status(403).json({ error: "Invalid or Expired Token" });
    }
};