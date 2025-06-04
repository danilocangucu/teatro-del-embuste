import { prisma } from "@/lib/prisma";

export const createGuestUser = async (
  fullName: string,
  email: string,
  phone: string | undefined,
  isGuest: boolean,
  reservationId: string
) => {
  try {
    const user = await prisma.users.create({
      data: {
        full_name: fullName,
        email,
        phone,
        is_guest: isGuest,
        reservation_id: reservationId,
      },
    });
    return user.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      console.warn(`[getUser] User with ID ${userId} not found`);
      return null;
    }
    return user;
  } catch (error) {
    console.error("[getUser] Error fetching user:", error);
    throw new Error("[getUser] Failed to fetch user");
  }
};
