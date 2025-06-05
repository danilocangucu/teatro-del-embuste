export const patchUser = async (
  userId: string,
  currentData: { full_name?: string; email?: string; phone?: string },
  newData: { fullName: string; email: string; phone?: string }
) => {
  const updates: Record<string, string | undefined> = {};

  if (newData.fullName !== currentData.full_name) {
    updates.fullName = newData.fullName;
  }
  if (newData.email !== currentData.email) {
    updates.email = newData.email;
  }
  if (newData.phone !== currentData.phone) {
    updates.phone = newData.phone;
  }

  if (Object.keys(updates).length === 0) {
    return { success: true, message: "No changes detected" };
  }

  const response = await fetch("/api/users", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      ...updates,
    }),
  });

  if (!response.ok) {
    console.error("[patchUser] Failed to patch user:", await response.json());
    throw new Error("Failed to update user");
  }

  return await response.json();
};