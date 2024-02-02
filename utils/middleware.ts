import type { NextFunction, Request, Response } from "express";

export const tokenExtractor = (req: any, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    const err = new Error("Missing Authorization Token");
    next(err);
  } else {
    if (authorizationHeader.includes("Bearer")) {
      const token = authorizationHeader.split(" ")[1];
      req.token = token;
      console.log("Token: ", token);
      next();
    } else {
      const err = new Error("Invalid Token");
      next(err);
    }
  }
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof Error) {
    if (err.message === "Missing Authorization Token") {
      console.log(err.message);
      return res.status(200).send({
        valid: false,
        message: "Missing Authroization Token in header",
      });
    } else if (err.message === "Invalid Token") {
      return res.status(403).send({
        valid: false,
        message: err.message,
      });
    } else {
      console.log("Error: " + err);
      return res.sendStatus(500);
    }
  } else {
    console.log(err);
    return res.sendStatus(500);
  }
};
