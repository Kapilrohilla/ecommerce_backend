import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const router = Router();

interface ExtendedRequest extends Request {
  token?: string;
}
//@ts-ignore
router.post(
  "/",
  async (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const body: any = req.body;
    const userToken = req.token;

    if (!body.productId) {
      return res.status(200).send({
        valid: false,
        message: "productId is required",
      });
    }

    if (!userToken) {
      return res.status(200).send({
        valid: false,
        message: "Token is required",
      });
    }
    console.log(userToken, "<<--token");
    const userEmail = jwt.decode(userToken);
    console.log(userEmail);

    return res.sendStatus(500);
  }
);

export default router;
