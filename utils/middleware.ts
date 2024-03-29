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
      return res.status(200).send({
        valid: false,
        message: "Missing Authroization Token in header",
      });
    } else if (err.message === "Invalid Token") {
      return res.status(403).send({
        valid: false,
        message: err.message,
      });
    } else if (err.name === "CastError") {
      return res.status(200).send({
        valid: false,
        message: "invalid id",
      });
    } else if (err.message === "invalid signature") {
      return res.status(200).send({
        valid: false,
        message: "incorrect token",
      });
    } else {
      return res.status(500).send({
        valid: true,
        message: err.message,
      });
    }
  } else {
    return res.sendStatus(500);
  }
};
