import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createAppointment, getAppointments, createReview, getApprovedReviews, getAllReviews } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  appointments: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        vehicle: z.string().min(1),
        service: z.string().min(1),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createAppointment({
          ...input,
          status: "pending",
        });
        
        await notifyOwner({
          title: "Nouvelle demande de rendez-vous",
          content: `${input.name} (${input.email}) a demandé un rendez-vous pour ${input.service}.`,
        });
        
        return result;
      }),
    
    list: publicProcedure.query(() => getAppointments()),
  }),
  
  reviews: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        rating: z.number().min(1).max(5),
        title: z.string().min(1),
        content: z.string().min(1),
        service: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createReview({
          ...input,
          status: "pending",
        });
        
        await notifyOwner({
          title: "Nouvel avis client",
          content: `${input.name} a laissé un avis de ${input.rating}/5 étoiles: "${input.title}".`,
        });
        
        return result;
      }),
    
    listApproved: publicProcedure.query(() => getApprovedReviews()),
    listAll: publicProcedure.query(() => getAllReviews()),
  }),
});

export type AppRouter = typeof appRouter;
