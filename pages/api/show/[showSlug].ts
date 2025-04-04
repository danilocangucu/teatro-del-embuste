import { getShow } from "@/app/services/showService";
import { sanitizeShow } from "@/app/utils/showUtils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { showSlug } = req.query;

  try {
    const showDetails = await getShow(showSlug as string);
    const mappedShow = sanitizeShow(showDetails);
    res.status(200).json(mappedShow);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch show details" });
  }
}
