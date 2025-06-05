import { prisma } from "@/lib/prisma";

type UserUpdateInput = {
  full_name?: string;
  email?: string;
  phone?: string;
};

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

export const updateUser = async (userId: string, updates: UserUpdateInput) => {
  try {
    if (Object.keys(updates).length === 0) {
      throw new Error("[updateUser] No fields provided for update");
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updates,
    });

    return updatedUser ? true : false;
  } catch (error) {
    console.error("[updateUser] Error updating user:", error);
    throw new Error("[updateUser] Failed to update user");
  }
};
