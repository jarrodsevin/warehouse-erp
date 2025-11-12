"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function createVendor(formData: FormData) {
  const name = formData.get("name") as string;
  const contactPerson = formData.get("contactPerson") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  await prisma.vendor.create({
    data: {
      name,
      contactPerson,
      email,
      phone,
      address,
      status: status || "active",
      notes,
    },
  });

  revalidatePath("/vendors");
}

export async function getVendors() {
  return await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getVendor(id: string) {
  return await prisma.vendor.findUnique({
    where: { id }
  })
}

export async function deleteVendor(id: string) {
  await prisma.vendor.delete({
    where: { id },
  });

  revalidatePath("/vendors");
}

export async function updateVendor(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const contactPerson = formData.get("contactPerson") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  await prisma.vendor.update({
    where: { id },
    data: {
      name,
      contactPerson,
      email,
      phone,
      address,
      status: status || "active",
      notes,
    },
  });

  revalidatePath("/vendors");
}