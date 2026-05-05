import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { emitCustomerEvent } from "@/lib/events/dispatcher";
import { CustomerEventType } from "@prisma/client";
import { CustomerRepo } from "@/repo";

export async function POST(req: Request) {
  console.log("📬 Clerk webhook received");
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, username, image_url } =
      evt.data;

    try {
      const customer = await db.customers.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address ?? "",
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          username: username ?? null,
          imageUrl: image_url ?? null,
        },
      });

      const client = await clerkClient();
      await client.users.updateUser(id, {
        publicMetadata: {
          role: "customer",
          dbId: customer.id,
          createdAt: new Date().toISOString(),
        },
      });

      // USER_SIGNUP event is auto-emitted by audit-events Prisma extension
      // when db.customers.create runs above.

      return new Response("Success: Customer created and metadata updated", {
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error creating customer:", error);
      return new Response("Error: Failed to create customer", {
        status: 500,
      });
    }
  }

  if (evt.type === "session.created") {
    const { user_id, id: sessionId } = evt.data as {
      user_id?: string;
      id?: string;
    };
    if (user_id) {
      try {
        const customer = await CustomerRepo.fetchCustomerByClerkId(user_id);
        if (customer) {
          await emitCustomerEvent({
            type: CustomerEventType.USER_LOGIN,
            customerId: customer.id,
            payload: { clerkId: user_id, sessionId },
          });
        }
      } catch (err) {
        console.error("[clerk webhook] failed to emit USER_LOGIN", err);
      }
    }
    return new Response("Success: login recorded", { status: 200 });
  }

  return new Response("Success: Webhook received", { status: 200 });
}
