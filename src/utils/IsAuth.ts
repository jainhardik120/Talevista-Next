import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { HttpError } from "./HttpError";
import jsonwebtoken from "jsonwebtoken";
import key from "./SecretKey";
import { LoginJwtPayload } from "@/app/api/auth/login/route";

const isAuth = (headersList : ReadonlyHeaders)=>{
    const authHeader = headersList.get('Authorization')
    if (!authHeader) {
       throw new HttpError(401, "Not authenticated!");
    }
    const token = authHeader.split(' ')[1];
    let decodedToken
    try {
        decodedToken = jsonwebtoken.verify(token, key)
    } catch (error) {
        throw error
    }
    if (!decodedToken) {
        throw new HttpError(401, "Not authenticated!");
    }
    const payload = decodedToken as LoginJwtPayload
    const userId = payload.userId
    return userId
}

export default isAuth