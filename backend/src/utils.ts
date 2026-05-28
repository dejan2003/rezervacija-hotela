import type { Response } from "express";

export async function handleRequest(res: Response, callback: Promise<any>) {
  try {
    const data = await callback;
    if (data == undefined) {
      res.status(204).send();
      return;
    }
    delete data.deletedAt;
    res.json(data);
  } catch (e: unknown) {
    let code = 500;

    const message = e instanceof Error ? e.message : "Unknown error";

    if (message == "NOT_FOUND") code = 404;

    res.status(code).json({
      message,
      timestamp: new Date(),
    });
  }
}

export function checkIfDefined<T>(data: T | null | undefined): T {
  if (data == undefined) {
    throw new Error("NOT_FOUND");
  }

  return data;
}
